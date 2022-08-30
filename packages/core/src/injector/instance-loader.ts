import { Logger } from 'nest-web-common';
import { Controller } from 'nest-web-common';
import { MODULE_INIT_MESSAGE } from '../helpers/messages';
import { NestContainer } from './container';
import { Injector } from './injector';
import { InternalCoreModule } from './internal-core-module';
import { Module } from './module';

export class InstanceLoader {
  protected readonly injector = new Injector();
  constructor(
    protected readonly container: NestContainer,
    private logger = new Logger(InstanceLoader.name, {
      timestamp: true,
    }),
  ) {}

  public setLogger(logger: Logger) {
    this.logger = logger;
  }

  public async createInstancesOfDependencies(
    modules: Map<string, Module> = this.container.getModules(),
  ) {
    this.createPrototypes(modules);
    await this.createInstances(modules);
  }

  private createPrototypes(modules: Map<string, Module>) {
    modules.forEach(moduleRef => {
      this.createPrototypesOfProviders(moduleRef);
      this.createPrototypesOfInjectables(moduleRef);
      this.createPrototypesOfControllers(moduleRef);
    });
  }

  private async createInstances(modules: Map<string, Module>) {
    await Promise.all(
      Array.from(modules.values()).map(async moduleRef => {
        await this.createInstancesOfProviders(moduleRef);
        await this.createInstancesOfInjectables(moduleRef);
        await this.createInstancesOfControllers(moduleRef);

        const { name } = moduleRef.metatype;
        this.isModuleWhitelisted(name) &&
          this.logger.log(MODULE_INIT_MESSAGE`${name}`);
      }),
    );
  }

  private createPrototypesOfProviders(moduleRef: Module) {
    const { providers } = moduleRef;
    providers.forEach(wrapper =>
      this.injector.loadPrototype<any>(wrapper, providers),
    );
  }

  private async createInstancesOfProviders(moduleRef: Module) {
    const { providers } = moduleRef;
    const wrappers = Array.from(providers.values());
    await Promise.all(
      wrappers.map(item => this.injector.loadProvider(item, moduleRef)),
    );
  }

  private createPrototypesOfControllers(moduleRef: Module) {
    const { controllers } = moduleRef;
    controllers.forEach(wrapper =>
      this.injector.loadPrototype<Controller>(wrapper, controllers),
    );
  }

  private async createInstancesOfControllers(moduleRef: Module) {
    return;
  }

  private createPrototypesOfInjectables(moduleRef: Module) {
    const { injectables } = moduleRef;
    injectables.forEach(wrapper =>
      this.injector.loadPrototype(wrapper, injectables),
    );
  }

  private async createInstancesOfInjectables(moduleRef: Module) {
    const { injectables } = moduleRef;
    const wrappers = Array.from(injectables.values());
    await Promise.all(
      wrappers.map(item => this.injector.loadInjectable(item, moduleRef)),
    );
  }

  private isModuleWhitelisted(name: string): boolean {
    return name !== InternalCoreModule.name;
  }
}
