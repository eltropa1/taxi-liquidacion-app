import type { PaymentMethodIdentity } from './contracts/PaymentMethodIdentity';
import type { PlatformIdentity } from './contracts/PlatformIdentity';
import type { ServiceTypeIdentity } from './contracts/ServiceTypeIdentity';
import type { VisualIdentity } from './contracts/VisualIdentity';
import { paymentMethods } from './catalogs/paymentMethods';
import { platforms } from './catalogs/platforms';
import { serviceTypes } from './catalogs/serviceTypes';
import { visualLegend } from './catalogs/visualLegend';
import { visualOrder } from './constants/visualOrder';

type VisualRegistry = {
  readonly platform: readonly PlatformIdentity[];
  readonly serviceType: readonly ServiceTypeIdentity[];
  readonly paymentMethod: readonly PaymentMethodIdentity[];
};

type VisualRegistryKey = keyof VisualRegistry;

type VisualRegistryItem<K extends VisualRegistryKey> = VisualRegistry[K][number];

function createIndex<T extends VisualIdentity>(items: readonly T[]) {
  return new Map(items.map((item) => [item.id, item] as const));
}

const registry: VisualRegistry = Object.freeze({
  platform: platforms,
  serviceType: serviceTypes,
  paymentMethod: paymentMethods,
});

const indexes = Object.freeze({
  platform: createIndex(registry.platform),
  serviceType: createIndex(registry.serviceType),
  paymentMethod: createIndex(registry.paymentMethod),
});

function listByKey<K extends VisualRegistryKey>(key: K): readonly VisualRegistryItem<K>[] {
  return registry[key];
}

function getByKey<K extends VisualRegistryKey>(
  key: K,
  id: string,
): VisualRegistryItem<K> | undefined {
  return indexes[key].get(id) as VisualRegistryItem<K> | undefined;
}

function listAll(): readonly VisualIdentity[] {
  return [...registry.platform, ...registry.serviceType, ...registry.paymentMethod];
}

export const VisualCatalog = Object.freeze({
  visualLegend,
  visualOrder,
  listPlatforms: () => listByKey('platform'),
  getPlatform: (id: string) => getByKey('platform', id),
  listServiceTypes: () => listByKey('serviceType'),
  getServiceType: (id: string) => getByKey('serviceType', id),
  listPaymentMethods: () => listByKey('paymentMethod'),
  getPaymentMethod: (id: string) => getByKey('paymentMethod', id),
  listAll,
  find: (domain: string, id: string): VisualIdentity | undefined => {
    if (domain === 'platform') return getByKey('platform', id);
    if (domain === 'serviceType') return getByKey('serviceType', id);
    if (domain === 'paymentMethod') return getByKey('paymentMethod', id);
    return undefined;
  },
  list: (domain: string): readonly VisualIdentity[] => {
    if (domain === 'platform') return listByKey('platform');
    if (domain === 'serviceType') return listByKey('serviceType');
    if (domain === 'paymentMethod') return listByKey('paymentMethod');
    return [];
  },
});
