import { Logger } from 'nest-web-common';

export class ExternalExceptionFilter<T = any, R = any> {
  private static readonly logger = new Logger('ExceptionsHandler');

  catch(exception: T): R | Promise<R> {
    throw exception;
  }
}
