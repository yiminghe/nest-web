import { NestContainer } from 'nest-web-core';
import { STATIC_CONTEXT } from 'nest-web-core';
import {
  Injector,
  Module,
  InstanceWrapper,
  InjectorDependencyContext,
} from 'nest-web-core';
import { MockFactory } from './interfaces';

export class TestingInjector extends Injector {
  protected mocker?: MockFactory;
  protected container: NestContainer;

  public setMocker(mocker: MockFactory) {
    this.mocker = mocker;
  }

  public setContainer(container: NestContainer) {
    this.container = container;
  }

  public async resolveComponentInstance<T>(
    moduleRef: Module,
    name: any,
    dependencyContext: InjectorDependencyContext,
    wrapper: InstanceWrapper<T>,
    contextId = STATIC_CONTEXT,
    inquirer?: InstanceWrapper,
    keyOrIndex?: string | number,
  ): Promise<InstanceWrapper> {
    try {
      const existingProviderWrapper = await super.resolveComponentInstance(
        moduleRef,
        name,
        dependencyContext,
        wrapper,
        contextId,
        inquirer,
        keyOrIndex,
      );
      return existingProviderWrapper;
    } catch (err) {
      if (this.mocker) {
        const mockedInstance = this.mocker(name);
        if (!mockedInstance) {
          throw err;
        }
        const newWrapper = new InstanceWrapper({
          name,
          isAlias: false,
          scope: wrapper.scope,
          instance: mockedInstance,
          isResolved: true,
          host: moduleRef,
          metatype: wrapper.metatype,
        });
        const internalCoreModule = this.container.getInternalCoreModuleRef();
        internalCoreModule.addCustomProvider(
          {
            provide: name,
            useValue: mockedInstance,
          },
          internalCoreModule.providers,
        );
        internalCoreModule.addExportedProvider(name);
        return newWrapper;
      } else {
        throw err;
      }
    }
  }
}
