import { Trip } from '../../models/Trip';
import { db } from '../database';

/**
 * TripRepository
 * -----------------
 * Encapsula TODAS las operaciones con SQLite.
 * Las pantallas y servicios NO deben ejecutar SQL directamente.
 */
export class TripRepository {

  /**
   * Inserta un nuevo viaje en la base de datos
   */
  static create(trip: Trip): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `
          INSERT INTO trips 
          (startTime, endTime, pickup, rate, source, amount, payment, createdAt, ticketPhotoUri, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            trip.startTime,
            trip.endTime ?? null,
            trip.pickup ?? null,
            trip.rate ?? null,
            trip.source,
            trip.amount ?? null,
            trip.payment ?? null,
            trip.createdAt,
            trip.ticketPhotoUri ?? null,
            trip.notes ?? null,
          ],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  /**
   * Obtiene todos los viajes de un día concreto
   */
  static getByDate(dateISO: string): Promise<Trip[]> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `
          SELECT * FROM trips
          WHERE date(startTime) = date(?)
          ORDER BY startTime ASC
          `,
          [dateISO],
          (_, result) => resolve(result.rows._array as Trip[]),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }
}
