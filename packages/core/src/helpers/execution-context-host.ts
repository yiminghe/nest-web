import { ExecutionContext } from 'nest-web-common';
import { Type } from 'nest-web-common';
import { ContextType } from 'nest-web-common';

export class ExecutionContextHost implements ExecutionContext {
  private contextType = 'http';

  constructor(
    private readonly args: any[],
    private readonly constructorRef: Type<any> = null,
    private readonly handler: Function = null,
  ) {}

  setType<TContext extends string = ContextType>(type: TContext) {
    type && (this.contextType = type);
  }

  getType<TContext extends string = ContextType>(): TContext {
    return this.contextType as TContext;
  }

  getClass<T = any>(): Type<T> {
    return this.constructorRef;
  }

  getHandler(): Function {
    return this.handler;
  }

  getArgs<T extends Array<any> = any[]>(): T {
    return this.args as T;
  }

  getArgByIndex<T = any>(index: number): T {
    return this.args[index] as T;
  }
}
