import type { VisualIdentity } from './VisualIdentity';

export interface ServiceTypeIdentity extends VisualIdentity {
  readonly domain: 'serviceType';
  readonly icon: string;
  readonly color?: never;
}
