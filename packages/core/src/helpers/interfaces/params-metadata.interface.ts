import { ParamData } from 'nest-web-common';

export type ParamsMetadata = Record<number, ParamMetadata>;
export interface ParamMetadata {
  index: number;
  data?: ParamData;
}
