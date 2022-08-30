import {
  INestApplicationContext,
  Logger,
  LoggerService,
  LogLevel,
} from 'nest-web-common';
import { Abstract, DynamicModule, Scope } from 'nest-web-common';
import { Type } from 'nest-web-common';
import { InvalidClassScopeException } from './errors/exceptions/invalid-class-scope.exception';
import { UnknownElementException } from './errors/exceptions/unknown-element.exception';
import { UnknownModuleException } from './errors/exceptions/unknown-module.exception';
import { createContextId } from './helpers/context-id-factory';
import {
  callAppShutdownHook,
  callBeforeAppShutdownHook,
  callModuleBootstrapHook,
  callModuleDestroyHook,
  callModuleInitHook,
} from './hooks';
import { ModuleCompiler } from './injector/compiler';
import { NestContainer } from './injector/container';
import { Injector } from './injector/injector';
import { InstanceLinksHost } from './injector/instance-links-host';
import { ContextId } from './injector/instance-wrapper';
import { Module } from './injector/module';

/**
 * @publicApi
 */
export class NestApplicationContext implements INestApplicationContext {
  protected isInitialized = false;
  protected readonly injector = new Injector();

  private shouldFlushLogsOnOverride = false;
  private readonly activeShutdownSignals = new Array<string>();
  private readonly moduleCompiler = new ModuleCompiler();
  private shutdownCleanupRef?: (...args: unknown[]) => unknown;
  private _instanceLinksHost: InstanceLinksHost;
  private _moduleRefsByDistance?: Array<Module>;

  private get instanceLinksHost() {
    if (!this._instanceLinksHost) {
      this._instanceLinksHost = new InstanceLinksHost(this.container);
    }
    return this._instanceLinksHost;
  }

  constructor(
    protected readonly container: NestContainer,
    private readonly scope = new Array<Type<any>>(),
    private contextModule: Module = null,
  ) {}

  public selectContextModule() {
    const modules = this.container.getModules().values();
    this.contextModule = modules.next().value;
  }

  public select<T>(
    moduleType: Type<T> | DynamicModule,
  ): INestApplicationContext {
    const modulesContainer = this.container.getModules();
    const contextModuleCtor = this.contextModule.metatype;
    const scope = this.scope.concat(contextModuleCtor);

    const moduleTokenFactory = this.container.getModuleTokenFactory();
    const { type, dynamicMetadata } =
      this.moduleCompiler.extractMetadata(moduleType);
    const token = moduleTokenFactory.create(type, dynamicMetadata);

    const selectedModule = modulesContainer.get(token);
    if (!selectedModule) {
      throw new UnknownModuleException();
    }
    return new NestApplicationContext(this.container, scope, selectedModule);
  }

  public get<TInput = any, TResult = TInput>(
    typeOrToken: Type<TInput> | Abstract<TInput> | string | symbol,
    options: { strict: boolean } = { strict: false },
  ): TResult {
    return !(options && options.strict)
      ? this.find<TInput, TResult>(typeOrToken)
      : this.find<TInput, TResult>(typeOrToken, this.contextModule);
  }

  public resolve<TInput = any, TResult = TInput>(
    typeOrToken: Type<TInput> | Abstract<TInput> | string | symbol,
    contextId = createContextId(),
    options: { strict: boolean } = { strict: false },
  ): Promise<TResult> {
    return this.resolvePerContext(
      typeOrToken,
      this.contextModule,
      contextId,
      options,
    );
  }

  public registerRequestByContextId<T = any>(request: T, contextId: ContextId) {
    this.container.registerRequestProvider(request, contextId);
  }

  /**
   * Initializes the Nest application.
   * Calls the Nest lifecycle events.
   *
   * @returns {Promise<this>} The NestApplicationContext instance as Promise
   */
  public async init(): Promise<this> {
    if (this.isInitialized) {
      return this;
    }
    await this.callInitHook();
    await this.callBootstrapHook();

    this.isInitialized = true;
    return this;
  }

  public async close(): Promise<void> {
    await this.callDestroyHook();
    await this.callBeforeShutdownHook();
    await this.dispose();
    await this.callShutdownHook();
    this.unsubscribeFromProcessSignals();
  }

  public useLogger(logger: LoggerService | LogLevel[] | false) {
    Logger.overrideLogger(logger);

    if (this.shouldFlushLogsOnOverride) {
      this.flushLogs();
    }
  }

  public flushLogs() {
    Logger.flush();
  }

  /**
   * Define that it must flush logs right after defining a custom logger.
   */
  public flushLogsOnOverride() {
    this.shouldFlushLogsOnOverride = true;
  }

 

  protected async dispose(): Promise<void> {
    // Nest application context has no server
    // to dispose, therefore just call a noop
    return Promise.resolve();
  }

  /**
   * Unsubscribes from shutdown signals (process events)
   */
  protected unsubscribeFromProcessSignals() {
    return;
  }

  /**
   * Calls the `onModuleInit` function on the registered
   * modules and its children.
   */
  protected async callInitHook(): Promise<void> {
    const modulesSortedByDistance = this.getModulesSortedByDistance();
    for (const module of modulesSortedByDistance) {
      await callModuleInitHook(module);
    }
  }

  /**
   * Calls the `onModuleDestroy` function on the registered
   * modules and its children.
   */
  protected async callDestroyHook(): Promise<void> {
    const modulesSortedByDistance = this.getModulesSortedByDistance();
    for (const module of modulesSortedByDistance) {
      await callModuleDestroyHook(module);
    }
  }

  /**
   * Calls the `onApplicationBootstrap` function on the registered
   * modules and its children.
   */
  protected async callBootstrapHook(): Promise<void> {
    const modulesSortedByDistance = this.getModulesSortedByDistance();
    for (const module of modulesSortedByDistance) {
      await callModuleBootstrapHook(module);
    }
  }

  /**
   * Calls the `onApplicationShutdown` function on the registered
   * modules and children.
   */
  protected async callShutdownHook(signal?: string): Promise<void> {
    const modulesSortedByDistance = this.getModulesSortedByDistance();
    for (const module of modulesSortedByDistance) {
      await callAppShutdownHook(module, signal);
    }
  }

  /**
   * Calls the `beforeApplicationShutdown` function on the registered
   * modules and children.
   */
  protected async callBeforeShutdownHook(signal?: string): Promise<void> {
    const modulesSortedByDistance = this.getModulesSortedByDistance();
    for (const module of modulesSortedByDistance) {
      await callBeforeAppShutdownHook(module, signal);
    }
  }

  protected find<TInput = any, TResult = TInput>(
    typeOrToken: Type<TInput> | Abstract<TInput> | string | symbol,
    contextModule?: Module,
  ): TResult {
    const moduleId = contextModule && contextModule.id;
    const { wrapperRef } = this.instanceLinksHost.get<TResult>(
      typeOrToken,
      moduleId,
    );
    if (
      wrapperRef.scope === Scope.REQUEST ||
      wrapperRef.scope === Scope.TRANSIENT
    ) {
      throw new InvalidClassScopeException(typeOrToken);
    }
    return wrapperRef.instance;
  }

  protected async resolvePerContext<TInput = any, TResult = TInput>(
    typeOrToken: Type<TInput> | Abstract<TInput> | string | symbol,
    contextModule: Module,
    contextId: ContextId,
    options?: { strict: boolean },
  ): Promise<TResult> {
    const isStrictModeEnabled = options && options.strict;
    const instanceLink = isStrictModeEnabled
      ? this.instanceLinksHost.get(typeOrToken, contextModule.id)
      : this.instanceLinksHost.get(typeOrToken);

    const { wrapperRef, collection } = instanceLink;
    if (wrapperRef.isDependencyTreeStatic() && !wrapperRef.isTransient) {
      return this.get(typeOrToken, options);
    }

    const ctorHost = wrapperRef.instance || { constructor: typeOrToken };
    const instance = await this.injector.loadPerContext(
      ctorHost,
      wrapperRef.host,
      collection,
      contextId,
      wrapperRef,
    );
    if (!instance) {
      throw new UnknownElementException();
    }
    return instance;
  }

  private getModulesSortedByDistance(): Module[] {
    if (this._moduleRefsByDistance) {
      return this._moduleRefsByDistance;
    }
    const modulesContainer = this.container.getModules();
    const compareFn = (a: Module, b: Module) => b.distance - a.distance;

    this._moduleRefsByDistance = Array.from(modulesContainer.values()).sort(
      compareFn,
    );
    return this._moduleRefsByDistance;
  }
}
