import { flatten, Injectable } from 'nest-web-common';
import { InstanceWrapper } from '../injector/instance-wrapper';
import { Module } from '../injector/module';
import { ModulesContainer } from '../injector/modules-container';

/**
 * @publicApi
 */
export interface DiscoveryOptions {
  include?: Function[];
}

/**
 * @publicApi
 */
@Injectable()
export class DiscoveryService {
  constructor(private readonly modulesContainer: ModulesContainer) {}

  getProviders(
    options: DiscoveryOptions = {},
    modules: Module[] = this.getModules(options),
  ): InstanceWrapper[] {
    const providers = modules.map((item) =>
      Array.from(item.providers.values()),
    );
    return flatten(providers);
  }

  protected getModules(options: DiscoveryOptions = {}): Module[] {
    if (!options.include) {
      const moduleRefs = Array.from(this.modulesContainer.values());
      return moduleRefs;
    }
    const whitelisted = this.includeWhitelisted(options.include);
    return whitelisted;
  }

  private includeWhitelisted(include: Function[]): Module[] {
    const moduleRefs = Array.from(this.modulesContainer.values());
    return moduleRefs.filter(({ metatype }) =>
      include.some((item) => item === metatype),
    );
  }
}
