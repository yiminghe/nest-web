export type ParamsMetadata = Record<number, ParamMetadata>;
export interface ParamMetadata {
  index: number;
  data?: any;
}
