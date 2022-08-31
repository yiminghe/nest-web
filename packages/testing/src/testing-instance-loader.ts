import { InstanceLoader, Module } from 'nest-web-core';
import { MockFactory } from './interfaces';
import { TestingInjector } from './testing-injector';

export class TestingInstanceLoader extends InstanceLoader {
  protected injector = new TestingInjector();

  public async createInstancesOfDependencies(
    modules: Map<string, Module> = this.container.getModules(),
    mocker?: MockFactory,
  ): Promise<void> {
    this.injector.setContainer(this.container);
    mocker && this.injector.setMocker(mocker);
    await super.createInstancesOfDependencies();
  }
}
