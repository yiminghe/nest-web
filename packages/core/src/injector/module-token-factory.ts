import { DynamicModule } from 'nest-web-common';
import { Type } from 'nest-web-common';
import { randomStringGenerator } from 'nest-web-common';
import { isFunction, isSymbol } from 'nest-web-common';

export class ModuleTokenFactory {
  private readonly moduleIdsCache = new WeakMap<Type<unknown>, string>();

  public create(
    metatype: Type<unknown>,
    dynamicModuleMetadata?: Partial<DynamicModule> | undefined,
  ): string {
    const moduleId = this.getModuleId(metatype);
    const opaqueToken = {
      id: moduleId,
      module: this.getModuleName(metatype),
      dynamic: this.getDynamicMetadataToken(dynamicModuleMetadata),
    };
    return JSON.stringify(opaqueToken);
  }

  public getDynamicMetadataToken(
    dynamicModuleMetadata: Partial<DynamicModule> | undefined,
  ): string {
    // Uses safeStringify instead of JSON.stringify to support circular dynamic modules
    // The replacer function is also required in order to obtain real class names
    // instead of the unified "Function" key
    return dynamicModuleMetadata
      ? JSON.stringify(dynamicModuleMetadata, this.replacer)
      : '';
  }

  public getModuleId(metatype: Type<unknown>): string {
    let moduleId = this.moduleIdsCache.get(metatype);
    if (moduleId) {
      return moduleId;
    }
    moduleId = randomStringGenerator();
    this.moduleIdsCache.set(metatype, moduleId);
    return moduleId;
  }

  public getModuleName(metatype: Type<any>): string {
    return metatype.name;
  }

  private replacer(key: string, value: any) {
    if (isFunction(value)) {
      const funcAsString = value.toString();
      const isClass = /^class\s/.test(funcAsString);
      if (isClass) {
        return value.name;
      }
      return JSON.stringify(funcAsString);
    }
    if (isSymbol(value)) {
      return value.toString();
    }
    return value;
  }
}
