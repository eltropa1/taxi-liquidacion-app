/**
 * Enumeraciones del dominio.
 * Usar enums evita errores de texto y hace el código más seguro.
 */

export enum TripSource {
  TAXI = 'TAXI',
  UBER = 'UBER',
  CABIFY = 'CABIFY',
  FREE_NOW = 'FreeNow',
  CUSTOM = 'Otro',
 }

export enum PaymentType {
  CASH = 'CASH',
  CARD = 'CARD',
  APP = 'APP',
}

