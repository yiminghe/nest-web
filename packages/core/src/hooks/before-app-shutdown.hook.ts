import { BeforeApplicationShutdown } from 'nest-web-common';
import { isFunction, isNil } from 'nest-web-common';
import {
  getNonTransientInstances,
  getTransientInstances,
} from '../injector/helpers/transient-instances';
import { InstanceWrapper } from '../injector/instance-wrapper';
import { Module } from '../injector/module';

/**
 * Checks if the given instance has the `beforeApplicationShutdown` function
 *
 * @param instance The instance which should be checked
 */
function hasBeforeApplicationShutdownHook(
  instance: unknown,
): instance is BeforeApplicationShutdown {
  return isFunction(
    (instance as BeforeApplicationShutdown).beforeApplicationShutdown,
  );
}

/**
 * Calls the given instances
 */
function callOperator(
  instances: InstanceWrapper[],
  signal?: string,
): Promise<any>[] {
  return instances
    .filter((instance) => !isNil(instance))
    .filter(hasBeforeApplicationShutdownHook)
    .map(async (instance) =>
      (instance as any as BeforeApplicationShutdown).beforeApplicationShutdown(
        signal,
      ),
    );
}

/**
 * Calls the `beforeApplicationShutdown` function on the module and its children
 * (providers / controllers).
 *
 * @param module The module which will be initialized
 * @param signal The signal which caused the shutdown
 */
export async function callBeforeAppShutdownHook(
  module: Module,
  signal?: string,
): Promise<void> {
  const providers = module.getNonAliasProviders();
  const [_, moduleClassHost] = providers.shift();
  const instances = [
    ...providers,
    ...module.injectables,
    ...module.middlewares,
  ];

  const nonTransientInstances = getNonTransientInstances(instances);
  await Promise.all(callOperator(nonTransientInstances, signal));
  const transientInstances = getTransientInstances(instances);
  await Promise.all(callOperator(transientInstances, signal));

  const moduleClassInstance = moduleClassHost.instance;
  if (
    moduleClassInstance &&
    hasBeforeApplicationShutdownHook(moduleClassInstance) &&
    moduleClassHost.isDependencyTreeStatic()
  ) {
    await (
      moduleClassInstance as BeforeApplicationShutdown
    ).beforeApplicationShutdown(signal);
  }
}
