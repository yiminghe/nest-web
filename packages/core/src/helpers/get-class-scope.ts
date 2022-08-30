import { Scope } from 'nest-web-common';
import { SCOPE_OPTIONS_METADATA } from 'nest-web-common';
import { Type } from 'nest-web-common';

export function getClassScope(provider: Type<unknown>): Scope {
  const metadata = Reflect.getMetadata(SCOPE_OPTIONS_METADATA, provider);
  return metadata && metadata.scope;
}
