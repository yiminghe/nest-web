import { SCOPE_OPTIONS_METADATA } from 'nest-web-common';
import { Type } from 'nest-web-common';

export function isDurable(provider: Type<unknown>): boolean | undefined {
  const metadata = Reflect.getMetadata(SCOPE_OPTIONS_METADATA, provider);
  return metadata && metadata.durable;
}
