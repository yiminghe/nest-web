import { LoggerService, LogLevel } from '../services/logger.service';
import { DynamicModule } from './modules';
import { Type } from './type.interface';

/**
 * Interface defining NestApplicationContext.
 *
 * @publicApi
 */
export interface INestApplicationContext {
  /**
   * Allows navigating through the modules tree, for example, to pull out a specific instance from the selected module.
   * @returns {INestApplicationContext}
   */
  select<T>(module: Type<T> | DynamicModule): INestApplicationContext;

  /**
   * Retrieves an instance of either injectable or controller, otherwise, throws exception.
   * @returns {TResult}
   */
  get<TInput = any, TResult = TInput>(
    typeOrToken: Type<TInput> | Function | string | symbol,
    options?: { strict: boolean },
  ): TResult;

  /**
   * Resolves transient or request-scoped instance of either injectable or controller, otherwise, throws exception.
   * @returns {Promise<TResult>}
   */
  resolve<TInput = any, TResult = TInput>(
    typeOrToken: Type<TInput> | Function | string | symbol,
    contextId?: { id: number },
    options?: { strict: boolean },
  ): Promise<TResult>;

  /**
   * Registers the request/context object for a given context ID (DI container sub-tree).
   * @returns {void}
   */
  registerRequestByContextId<T = any>(
    request: T,
    contextId: { id: number },
  ): void;

  /**
   * Terminates the application
   * @returns {Promise<void>}
   */
  close(): Promise<void>;

  /**
   * Sets custom logger service.
   * Flushes buffered logs if auto flush is on.
   * @returns {void}
   */
  useLogger(logger: LoggerService | LogLevel[] | false): void;

  /**
   * Prints buffered logs and detaches buffer.
   * @returns {void}
   */
  flushLogs(): void;

  /**
   * Initializes the Nest application.
   * Calls the Nest lifecycle events.
   * It isn't mandatory to call this method directly.
   *
   * @returns {Promise<this>} The NestApplicationContext instance as Promise
   */
  init(): Promise<this>;
}
