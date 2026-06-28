import { visualOrder, visualOrderSequence } from '../constants/visualOrder';

export type VisualLegendChannelKey =
  | 'platformColor'
  | 'serviceTypeIcon'
  | 'paymentMethodIcon'
  | 'schedule'
  | 'description'
  | 'amount';

export interface VisualLegendChannel {
  readonly key: VisualLegendChannelKey;
  readonly label: string;
  readonly meaning: string;
  readonly order: number;
}

export interface VisualLegend {
  readonly principles: readonly string[];
  readonly hierarchy: readonly VisualLegendChannelKey[];
  readonly channels: readonly VisualLegendChannel[];
}

export const visualLegend = {
  principles: [
    'Un significado por canal visual',
    'Una única fuente de verdad',
    'Consistencia',
    'Continuidad visual',
    'Accesibilidad',
    'Escalabilidad',
  ],
  hierarchy: visualOrderSequence,
  channels: [
    {
      key: 'platformColor',
      label: 'Color plataforma',
      meaning: 'Plataforma',
      order: visualOrder.platformColor,
    },
    {
      key: 'serviceTypeIcon',
      label: 'Icono principal',
      meaning: 'Tipo de servicio',
      order: visualOrder.serviceTypeIcon,
    },
    {
      key: 'paymentMethodIcon',
      label: 'Icono secundario',
      meaning: 'Método de pago',
      order: visualOrder.paymentMethodIcon,
    },
    {
      key: 'schedule',
      label: 'Horario',
      meaning: 'Horario',
      order: visualOrder.schedule,
    },
    {
      key: 'description',
      label: 'Texto',
      meaning: 'Información descriptiva',
      order: visualOrder.description,
    },
    {
      key: 'amount',
      label: 'Importe',
      meaning: 'Resultado económico',
      order: visualOrder.amount,
    },
  ],
} as const satisfies VisualLegend;
