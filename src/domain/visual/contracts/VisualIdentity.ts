export type VisualIdentityDomain =
  | 'platform'
  | 'serviceType'
  | 'paymentMethod'
  | (string & {});

export interface VisualIdentity {
  readonly id: string;
  readonly domain: VisualIdentityDomain;
  readonly label: string;
  readonly order: number;
  readonly description?: string;
  readonly aliases?: readonly string[];
  readonly initial?: string;
}
