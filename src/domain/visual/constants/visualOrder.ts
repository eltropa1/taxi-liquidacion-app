export const visualOrder = Object.freeze({
  platformColor: 1,
  serviceTypeIcon: 2,
  paymentMethodIcon: 3,
  schedule: 4,
  description: 5,
  amount: 6,
} as const);

export type VisualOrderKey = keyof typeof visualOrder;

export const visualOrderSequence = Object.freeze([
  'platformColor',
  'serviceTypeIcon',
  'paymentMethodIcon',
  'schedule',
  'description',
  'amount',
] as const);
