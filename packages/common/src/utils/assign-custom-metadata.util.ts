import { CUSTOM_ROUTE_ARGS_METADATA } from '../constants';

export function assignCustomParameterMetadata(
  args: Record<number, any>,
  paramtype: number | string,
  index: number,
  factory: any,
  data?: any,
  ...pipes: any[]
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
