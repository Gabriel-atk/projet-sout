import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, map, Observable, of} from 'rxjs';
import {Reservation} from './reservation.service';
import {PurchasedTicket} from '../pages/user/tickets/tickets';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TicketsPaidService {
  private http=inject(HttpClient)
  private readonly API_URL = environment.apiURL;

  getUserTickets(userId: string): Observable<PurchasedTicket[]>{
    const token = localStorage.getItem('token');

    if (!token) {
      return of([])
    }

    const headers=new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<PurchasedTicket[]>(`${this.API_URL}/buyer/${userId}`, { headers }).pipe(
      map((tickets) => {
        // Convertir les dates si nécessaire
        return tickets.map(ticket => ({
          ...ticket,
          //eventDate: ticket.eventDate ? new Date(ticket.eventDate) : undefined
        }));
      }),
      catchError((error) => {
        console.error('Erreur lors de la récupération des tickets:', error);
        return of([]);
      })
    )
  }

  getTicketById(ticketId: string): Observable<PurchasedTicket | null> {
    const token = localStorage.getItem('token');

    if (!token) {
      return of(null);
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<PurchasedTicket>(
      `${this.API_URL}/api/purchased_ticket/${ticketId}`,
      { headers }
    ).pipe(
      map((ticket) => ({
        ...ticket,
        //eventDate: ticket.eventDate ? new Date(ticket.eventDate) : undefined
      })),
      catchError((error) => {
        console.error('Erreur lors de la récupération du ticket:', error);
        return of(null);
      })
    );
  }

  filterTicketsByStatus(){}

  downloadQRCode(qrCodeUrl: string, ticketId: string): void {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `ticket-${ticketId}.png`;
    link.click();
  }

  copyVoucherCode(voucherCode: string): boolean {
    try {
      navigator.clipboard.writeText(voucherCode);
      return true;
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      return false;
    }
  }

}
