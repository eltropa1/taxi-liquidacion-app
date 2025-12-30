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
