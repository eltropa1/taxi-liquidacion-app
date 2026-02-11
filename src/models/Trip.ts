import { TripSource, PaymentType } from '../constants/enums';

/**
 * Modelo de dominio Trip.
 * Representa un viaje realizado por el taxista.
 *
 * IMPORTANTE:
 * - Este modelo NO sabe nada de SQLite
 * - Solo define cómo es un viaje en la app
 */
export interface Trip {
  id?: number;                 // Opcional: SQLite lo genera

  /**
   * Identificador del Workday al que pertenece el viaje.
   *
   * FASE 1:
   * - Se introduce como opcional y nullable.
   * - NO se usa todavía en lógica.
   * - NO es obligatorio aún.
   *
   * FASE 3 lo convertirá en obligatorio.
   */
  workdayId?: number | null;

  startTime: string;           // ISO string
  endTime?: string | null;     // Puede ser null si el viaje está en curso
  pickup?: string | null;
  rate?: string | null;
  source: TripSource;
  amount?: number | null;
  payment?: PaymentType | null;
  createdAt: string;
  ticketPhotoUri?: string | null;
  notes?: string | null;
  customSource?: string | null;

}
