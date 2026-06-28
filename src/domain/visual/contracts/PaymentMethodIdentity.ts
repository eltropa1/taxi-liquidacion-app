import type { VisualIdentity } from './VisualIdentity';

export interface PaymentMethodIdentity extends VisualIdentity {
  readonly domain: 'paymentMethod';
  readonly icon: string;
  readonly color?: never;
}
