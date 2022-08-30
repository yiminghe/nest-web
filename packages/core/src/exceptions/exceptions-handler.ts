import {  Type } from 'nest-web-common';
import { ExceptionFilterMetadata } from 'nest-web-common';
import { ArgumentsHost } from 'nest-web-common';
import { isEmpty } from 'nest-web-common';
import { InvalidExceptionFilterException } from '../errors/exceptions/invalid-exception-filter.exception';
import { BaseExceptionFilter } from './base-exception-filter';

export class ExceptionsHandler extends BaseExceptionFilter {
  private filters: ExceptionFilterMetadata[] = [];

  public next(exception: Error  | any, ctx: ArgumentsHost) {
    if (this.invokeCustomFilters(exception, ctx)) {
      return;
    }
    super.catch(exception, ctx);
  }

  public setCustomFilters(filters: ExceptionFilterMetadata[]) {
    if (!Array.isArray(filters)) {
      throw new InvalidExceptionFilterException();
    }
    this.filters = filters;
  }

  public invokeCustomFilters<T = any>(
    exception: T,
    ctx: ArgumentsHost,
  ): boolean {
    if (isEmpty(this.filters)) {
      return false;
    }
    const isInstanceOf = (metatype: Type<unknown>) =>
      exception instanceof metatype;

    const filter = this.filters.find(({ exceptionMetatypes }) => {
      const typeExists =
        !exceptionMetatypes.length || exceptionMetatypes.some(isInstanceOf);
      return typeExists;
    });
    filter && filter.func(exception, ctx);
    return !!filter;
  }
}
