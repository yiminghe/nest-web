import {
  PARAMTYPES_METADATA,
  RESPONSE_PASSTHROUGH_METADATA,
} from 'nest-web-common';

export interface ParamProperties<T = any, IExtractor extends Function = any> {
  index: number;
  type: T | string;
  data: any;
  pipes: any[];
  extractValue: IExtractor;
}

export class ContextUtils {
  public mapParamType(key: string): string {
    const keyPair = key.split(':');
    return keyPair[0];
  }

  public reflectCallbackParamtypes(instance: any, methodName: string): any[] {
    return Reflect.getMetadata(PARAMTYPES_METADATA, instance, methodName);
  }

  public reflectCallbackMetadata<T = any>(
    instance: any,
    methodName: string,
    metadataKey: string,
  ): T {
    return Reflect.getMetadata(metadataKey, instance.constructor, methodName);
  }

  public reflectPassthrough(instance: any, methodName: string): boolean {
    return Reflect.getMetadata(
      RESPONSE_PASSTHROUGH_METADATA,
      instance.constructor,
      methodName,
    );
  }

  public getArgumentsLength<T>(keys: string[], metadata: T): number {
    return keys.length
      ? Math.max(...keys.map((key) => metadata[key].index)) + 1
      : 0;
  }

  public createNullArray(length: number): any[] {
    const a = new Array(length);
    for (let i = 0; i < length; ++i) a[i] = undefined;
    return a;
  }

  public mergeParamsMetatypes(
    paramsProperties: ParamProperties[],
    paramtypes: any[],
  ): (ParamProperties & { metatype?: any })[] {
    if (!paramtypes) {
      return paramsProperties;
    }
    return paramsProperties.map((param) => ({
      ...param,
      metatype: paramtypes[param.index],
    }));
  }
}
