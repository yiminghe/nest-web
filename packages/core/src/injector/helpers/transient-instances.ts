import { InstanceWrapper } from '../instance-wrapper';
import { InstanceToken } from '../module';

/**
 * Returns the instances which are transient
 * @param instances The instances which should be checked whether they are transcient
 */
export function getTransientInstances(
  instances: [InstanceToken, InstanceWrapper][],
): InstanceWrapper[] {
  return instances
    .filter(([_, wrapper]) => wrapper.isDependencyTreeStatic())
    .map(([_, wrapper]) => wrapper.getStaticTransientInstances())
    .flat()
    .filter((item) => !!item)
    .map(({ instance }: any) => instance) as InstanceWrapper[];
}

/**
 * Returns the instances which are not transient
 * @param instances The instances which should be checked whether they are transcient
 */
export function getNonTransientInstances(
  instances: [InstanceToken, InstanceWrapper][],
): InstanceWrapper[] {
  return instances
    .filter(
      ([key, wrapper]) =>
        wrapper.isDependencyTreeStatic() && !wrapper.isTransient,
    )
    .map(([key, { instance }]) => instance) as InstanceWrapper[];
}
