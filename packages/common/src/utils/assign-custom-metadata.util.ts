import { CUSTOM_ROUTE_ARGS_METADATA } from '../constants';

import { PipeTransform, Type } from '../interfaces';
import { CustomParamFactory } from '../interfaces/features/custom-route-param-factory.interface';

export function assignCustomParameterMetadata(
  args: Record<number, any>,
  paramtype: number | string,
  index: number,
  factory: CustomParamFactory,
  data?: any,
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
) {
  return {
    ...args,
    [`${paramtype}${CUSTOM_ROUTE_ARGS_METADATA}:${index}`]: {
      index,
      factory,
      data,
      pipes,
    },
  };
}
