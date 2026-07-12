import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, map, Observable, of} from 'rxjs';
export interface Reservation {
  uuid: string;
  title: string;
  eventDateTime: Date;
  ticketCount: number;
  totalPrice: number;
  bookingDate: Date;
  eventId: string;
  //userId: string;
}
@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private http=inject(HttpClient)
  private readonly API_URL = 'http://localhost:8080/api';

  /**
   * Récupérer toutes les réservations de l'utilisateur connecté
   */
  getUserReservations(): Observable<Reservation[]>{
    const token = localStorage.getItem('token');

    if (!token) {
      return of([])
    }

    const headers=new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any>(`${this.API_URL}/user/reservations`, { headers }).pipe(
      map((result: any)=>{
        if (result.reservations && Array.isArray(result.reservations)){
          return result.reservations.map((r: any)=>({
            ...r,
            eventDateTime: new Date(r.eventDateTime),
            bookingDate: new Date(r.bookingDate)
          }));
        }
        return [];
      }),
      catchError((error)=>{
        console.error('Erreur lors de la récupération des réservations:', error);
        return of([]);
      })
    )
  }

  getReservationById(id:number): Observable<Reservation | null>{
    const token = localStorage.getItem('token');

    if (!token) {
      return of(null);
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any>(`${this.API_URL}/reservations/${id}`, { headers }).pipe(
      map((result: any) => {
        if (result.reservation) {
          return {
            ...result.reservation,
            eventDateTime: new Date(result.reservation.eventDateTime),
            bookingDate: new Date(result.reservation.bookingDate)
          };
        }
        return null;
      }),
      catchError((error) => {
        console.error('Erreur lors de la récupération de la réservation:', error);
        return of(null);
      })
    );
  }

  /**
   * Annuler une réservation
   */
  cancelReservation(id: string): Observable<boolean> {
    const token = localStorage.getItem('token');

    if (!token) {
      return of(false);
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.delete<any>(`${this.API_URL}/reservations/${id}`, { headers }).pipe(
      map((result: any) => result.success === true),
      catchError((error) => {
        console.error('Erreur lors de l\'annulation de la réservation:', error);
        return of(false);
      })
    );
  }

  createReservation(eventId: string, ticketCount: number): Observable<Reservation | null> {
    const token = localStorage.getItem('token');
    if (!token) {
      return of(null);
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const body={eventId, ticketCount}

    return this.http.post<any>(`${this.API_URL}/reservations`, body, { headers }).pipe(
      map((result): Reservation | null => {
        if (result.reservation) {
          return {
            ...result.reservation,
            eventDateTime: new Date(result.reservation.eventDateTime),
            bookingDate: new Date(result.reservation.bookingDate),
          };
        }
        return null;
      }),
      catchError((error) => {
        console.error('Erreur lors de la création de la réservation:', error);
        return of(null);
      })
    )
  }

}
