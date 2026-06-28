import { PaymentType } from "../../constants/enums";
import { VisualCatalog } from "../../domain/visual";
import type { VisualIdentity } from "../../domain/visual/contracts/VisualIdentity";

import type {
  TripVisualPaymentProjection,
  TripVisualPlatformProjection,
  TripVisualProjection,
  TripVisualProjectionInput,
  TripVisualServiceTypeProjection,
} from "./TripVisualProjection";

const navigationGlyph = "›";

const paymentMethodIds: Record<PaymentType, string> = {
  [PaymentType.CASH]: "cash",
  [PaymentType.CARD]: "card",
  [PaymentType.APP]: "app",
};

function normalizeText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s_-]+/g, "");
}

function matchesVisualIdentity(
  identity: Pick<VisualIdentity, "id" | "label" | "aliases" | "initial">,
  value: string,
) {
  const normalizedValue = normalizeText(value);
  const candidates = [
    identity.id,
    identity.label,
    identity.initial ?? "",
    ...(identity.aliases ?? []),
  ].map(normalizeText);

  return candidates.includes(normalizedValue);
}

function resolveIdentityByText<T extends VisualIdentity>(
  items: readonly T[],
  value: string,
  fallback: T,
) {
  const match = items.find((item) => matchesVisualIdentity(item, value));
  const identity = match ?? fallback;

  return {
    identity,
    label: match ? match.label : value.trim() || fallback.label,
  };
}

function resolvePlatformProjection(source: string): TripVisualPlatformProjection {
  const fallback =
    VisualCatalog.getPlatform("other") ?? VisualCatalog.listPlatforms()[0];

  if (!fallback) {
    throw new Error("VisualCatalog no contiene plataformas");
  }

  const resolved = resolveIdentityByText(VisualCatalog.listPlatforms(), source, fallback);

  return {
    id: resolved.identity.id,
    label: resolved.label,
    initial: resolved.identity.initial ?? resolved.label.slice(0, 1).toUpperCase(),
    color: resolved.identity.color,
    surfaceColor: resolved.identity.surfaceColor,
    onSurfaceColor: resolved.identity.onSurfaceColor,
  } as const;
}

function resolvePaymentProjection(
  payment: PaymentType | null,
): TripVisualPaymentProjection | null {
  if (!payment) return null;

  const paymentId = paymentMethodIds[payment];
  const identity = VisualCatalog.getPaymentMethod(paymentId);
  if (!identity) return null;

  return Object.freeze({
    id: identity.id,
    label: identity.label,
    icon: identity.icon,
    initial: identity.initial ?? identity.label.slice(0, 1).toUpperCase(),
  });
}

function resolveServiceTypeProjection(
  serviceTypeId?: string | null,
): TripVisualServiceTypeProjection | null {
  if (!serviceTypeId) return null;

  const identity = VisualCatalog.getServiceType(serviceTypeId);
  if (!identity) return null;

  return Object.freeze({
    id: identity.id,
    label: identity.label,
    icon: identity.icon,
    initial: identity.initial ?? identity.label.slice(0, 1).toUpperCase(),
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString();
}

function formatAmount(amount: number | null) {
  if (amount === null) return "";
  return `${amount.toFixed(2)} €`;
}

export function toTripVisualProjection(
  trip: TripVisualProjectionInput,
): TripVisualProjection {
  const platform = resolvePlatformProjection(trip.source);
  const paymentMethod = resolvePaymentProjection(trip.payment);
  const serviceType = resolveServiceTypeProjection(trip.serviceTypeId);

  return Object.freeze({
    id: trip.id,
    platform: Object.freeze(platform),
    paymentMethod,
    serviceType,
    schedule: Object.freeze({
      startTime: trip.startTime,
      endTime: trip.endTime,
      label: `${formatTime(trip.startTime)} → ${trip.endTime ? formatTime(trip.endTime) : "..."}`,
    }),
    description: trip.description?.trim() ? trip.description.trim() : null,
    amount: Object.freeze({
      value: trip.amount,
      label: formatAmount(trip.amount),
    }),
    navigationGlyph,
  });
}
