

import { INestApplicationContext } from './nest-application-context.interface';
import { VersioningOptions } from './version-options.interface';

/**
 * Interface defining the core NestApplication object.
 *
 * @publicApi
 */
export interface INestApplication extends INestApplicationContext {
  /**
   * A wrapper function around HTTP adapter method: `adapter.use()`.
   * Example `app.use(cors())`
   *
   * @returns {this}
   */
  use(...args: any[]): this;

  /**
   * Enables Versioning for the application.
   * By default, URI-based versioning is used.
   *
   * @param {VersioningOptions} options
   * @returns {this}
   */
  enableVersioning(options?: VersioningOptions): this;

  /**
   * Returns the url the application is listening at, based on OS and IP version. Returns as an IP value either in IPv6 or IPv4
   *
   * @returns {Promise<string>} The IP where the server is listening
   */
  getUrl(): Promise<string>;
}
