import type { PaymentType } from "../../constants/enums";
import type { ServiceStatus } from "../../domain/services";

export type TripVisualProjectionInput = Readonly<{
  readonly id: number;
  readonly startTime: string;
  readonly endTime: string | null;
  readonly serviceStatus?: ServiceStatus | null;
  readonly amount: number | null;
  readonly source: string;
  readonly payment: PaymentType | null;
  readonly serviceTypeId?: string | null;
  readonly description?: string | null;
}>;

export type TripVisualPlatformProjection = Readonly<{
  readonly id: string;
  readonly label: string;
  readonly initial: string;
  readonly color: string;
  readonly surfaceColor: string;
  readonly onSurfaceColor: string;
}>;

export type TripVisualPaymentProjection = Readonly<{
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly initial: string;
}>;

export type TripVisualServiceTypeProjection = Readonly<{
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly initial: string;
}>;

export type TripVisualProjection = Readonly<{
  readonly id: number;
  readonly platform: TripVisualPlatformProjection;
  readonly paymentMethod: TripVisualPaymentProjection | null;
  readonly serviceType: TripVisualServiceTypeProjection | null;
  readonly schedule: Readonly<{
    readonly startTime: string;
    readonly endTime: string | null;
    readonly label: string;
  }>;
  readonly description: string | null;
  readonly amount: Readonly<{
    readonly value: number | null;
    readonly label: string;
  }>;
  readonly isPendingCompletion: boolean;
  readonly navigationGlyph: string;
}>;
