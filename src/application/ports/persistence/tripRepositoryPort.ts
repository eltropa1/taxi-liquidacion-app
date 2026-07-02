import { PaymentType, TripSource } from "../../../constants/enums";
import type { Trip } from "../../../domain/trips/canonical";

export type TripPersistenceRecord = Readonly<{
  id: number;
  startTime: string;
  endTime: string | null;
  amount: number | null;
  payment: PaymentType | null;
  source: TripSource;
  customSource: string | null;
  chargedAmount: number | null;
  cashTip: number | null;
  manualPickupZone: string | null;
  manualDropoffZone: string | null;
  workdayId: number | null;
}>;

export type TripActiveRecord = Readonly<{
  id: number;
  startTime: string;
}>;

export type TripListRecord = Readonly<{
  id: number;
  startTime: string;
  endTime: string | null;
  amount: number | null;
  source: TripSource;
  payment: PaymentType | null;
  chargedAmount?: number | null;
  cashTip?: number | null;
}>;

export type TripExportRecord = Readonly<{
  startTime: string;
  endTime: string | null;
  amount: number | null;
  payment: PaymentType | null;
  source: TripSource;
}>;

export type TripStartInput = Readonly<{
  startedAt: Date;
  workdayId: number;
  source: TripSource;
  createdAt?: Date;
}>;

export type TripManualInput = Readonly<{
  startTime: Date;
  endTime: Date;
  amount: number;
  payment: PaymentType;
  source: TripSource;
  workdayId: number;
  createdAt?: Date;
}>;

export type TripUpdateInput = Readonly<{
  id: number;
  amount: number;
  payment: PaymentType;
  source: TripSource;
  customSource?: string | null;
  chargedAmount?: number | null;
  cashTip?: number | null;
}>;

export type TripTimeUpdateInput = Readonly<{
  id: number;
  startTime: Date;
  endTime: Date;
}>;

export type TripManualZoneUpdateInput = Readonly<{
  id: number;
  pickupZone: string | null;
  dropoffZone: string | null;
}>;

export type TripEditedInput = Readonly<{
  id: number;
  amount: number;
  payment: PaymentType;
  source: TripSource;
  startTime: Date;
  endTime: Date;
  manualPickupZone: string | null;
  manualDropoffZone: string | null;
  customSource?: string | null;
  chargedAmount?: number | null;
  cashTip?: number | null;
}>;

export interface TripRepositoryPort {
  runInTransaction<T>(operation: () => Promise<T>): Promise<T>;

  createStartedTrip(input: TripStartInput): Promise<{ id: number }>;

  createManualTrip(input: TripManualInput): Promise<{ id: number }>;

  findActiveTrip(): Promise<TripActiveRecord | null>;

  findTripById(id: number): Promise<TripPersistenceRecord | null>;

  findCanonicalTripById(id: number): Promise<Trip | null>;

  findTripsForWorkday(workdayId: number): Promise<TripListRecord[]>;

  findTripsForWorkdayIds(workdayIds: number[]): Promise<TripListRecord[]>;

  findAllTripsForExport(): Promise<TripExportRecord[]>;

  updateTrip(input: TripUpdateInput): Promise<void>;

  updateTripTimes(input: TripTimeUpdateInput): Promise<void>;

  updateTripManualZones(input: TripManualZoneUpdateInput): Promise<void>;

  updateEditedTrip(input: TripEditedInput): Promise<void>;

  deleteTrip(id: number): Promise<void>;
}
