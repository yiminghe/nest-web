import { DynamicModule, Global, Module } from 'nest-web-common';
import {
  ExistingProvider,
  FactoryProvider,
  ValueProvider,
} from 'nest-web-common';
import { Reflector } from '../services';
import { inquirerProvider } from './inquirer/inquirer-providers';

const ReflectorAliasProvider = {
  provide: Reflector.name,
  useExisting: Reflector,
};

@Global()
@Module({
  providers: [
    Reflector,
    ReflectorAliasProvider,
    inquirerProvider,
  ],
  exports: [
    Reflector,
    ReflectorAliasProvider,
    inquirerProvider,
  ],
})
export class InternalCoreModule {
  static register(
    providers: Array<ValueProvider | FactoryProvider | ExistingProvider>,
  ): DynamicModule {
    return {
      module: InternalCoreModule,
      providers: [...providers],
      exports: [...providers.map(item => item.provide)],
    };
  }
}
