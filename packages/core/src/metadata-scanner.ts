import { isConstructor, isFunction, isNil } from 'nest-web-common';

export class MetadataScanner {
  public scanFromPrototype<T, R = any>(
    instance: T,
    prototype: object,
    callback: (name: string) => R,
  ): R[] {
    const methodNames = new Set(this.getAllFilteredMethodNames(prototype));
    return Array.from(methodNames.values())
      .map(callback)
      .filter((metadata) => !isNil(metadata));
  }

  *getAllFilteredMethodNames(prototype: object): IterableIterator<string> {
    const isMethod = (prop: string) => {
      const descriptor = Object.getOwnPropertyDescriptor(prototype, prop);
      if (descriptor.set || descriptor.get) {
        return false;
      }
      return !isConstructor(prop) && isFunction(prototype[prop]);
    };
    do {
      yield* Object.getOwnPropertyNames(prototype).filter(isMethod);
    } while (
      (prototype = Reflect.getPrototypeOf(prototype)) &&
      prototype !== Object.prototype
    );
  }
}
