import {Component, computed, inject, OnDestroy, OnInit} from '@angular/core';
import {TicketsPaidService} from '../../../services/tickets-paid.service';
import {LoginService} from '../../../services/login.service';
import {catchError, map, Observable, of, Subscription} from 'rxjs';
import {AsyncPipe, DatePipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import {EventsService} from '../../../services/events.service';
import {EventUserSide} from '../evenements/event/event-card';

export interface PurchasedTicket {
  ticketId: string;
  buyerName: string;
  nombreTicketAchete: number;
  qrCodeUrl: string;
  voucherCode: string;
  type: string;
  prixUnitaire: number;
  totalPrix: number;
  templateTrackingId: string;
  eventTrackingId: string;
}

@Component({
  selector: 'app-tickets',
  imports: [
    DatePipe,
    RouterLink,
    AsyncPipe
  ],
  templateUrl: './tickets.html',
  styleUrl: './tickets.css',
})
export class Tickets implements OnInit , OnDestroy{
  ngOnDestroy(): void {
    this.ticketsSubscription?.unsubscribe();
  }

  private loginService=inject(LoginService)
  private ticketService=inject(TicketsPaidService)
  private eventService=inject(EventsService)

  user=this.loginService.user;
  isLoggedIn=computed(()=>this.user() !==null && this.user() !== undefined);
  tickets:PurchasedTicket[]=[];
  isLoading=false;
  errorMessage='';

  private ticketsSubscription:Subscription | null=null;

  eventCache: Record<string, EventUserSide> = {};

  ngOnInit(): void {
    if (this.isLoggedIn()){
      this.loadTickets();
    }
  }

  private loadTickets():void {
    const userId=this.user()?.id;
    if (!userId){
      this.errorMessage='Utilisateur non authentifié.';
      return;
    }
    this.isLoading=true;
    this.errorMessage='';

    this.ticketsSubscription=this.ticketService.getUserTickets(userId).subscribe({
      next: (tickets) => {
        this.tickets=tickets;
        this.isLoading=false;
        console.log('Tickets chargés:', tickets);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des tickets:', error);
        this.isLoading=false;
        this.errorMessage='Impossible de charger vos tickets. Veuillez réessayer.';
      }
    })
  }

  private loadEventIfNeeded(eventId:string):void {
    if (!this.eventCache[eventId]) return;
    this.eventService.getEventByUuid(eventId).subscribe({
      next: (event) => {
        if (event) {
          this.eventCache[eventId] = event;
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'événement:', error);
      }
    })
  }

  /*getEventName(ticket: PurchasedTicket): Observable<string | null>{
    return this.eventService.getEventByUuid(ticket.eventTrackingId).pipe(
      map((event) => event ? event.name : null),
      catchError(()=>of(null))
    );
  }*/

  getEventName(ticket: PurchasedTicket): string{
    const eventId = ticket.eventTrackingId;
    this.loadEventIfNeeded(eventId);
    return this.eventCache[eventId]?.name || "Chargement...";
  }

  getEventStartDateTime(ticket: PurchasedTicket): string {
    const eventId = ticket.eventTrackingId;

    this.loadEventIfNeeded(eventId);

    const date = this.eventCache[eventId]?.startDateTime;
    if (!date) return "Chargement...";

    return new Date(date).toLocaleString("fr-FR", {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }


  getEventInfo(ticket: PurchasedTicket): Observable<EventUserSide | null> {
    return this.eventService.getEventByUuid(ticket.eventTrackingId).pipe(
      catchError(() => of(null))
    );
  }

  refreshTickets():void {
    this.loadTickets();
  }

  downloadQRCode(ticket: PurchasedTicket): void{
    this.ticketService.downloadQRCode(ticket.qrCodeUrl, ticket.ticketId);
  }

  copyVoucherCode(ticket: PurchasedTicket): void {
    const success = this.ticketService.copyVoucherCode(ticket.voucherCode);
    if (success) {
      alert('Code copié dans le presse-papiers !');
    } else {
      alert('Erreur lors de la copie du code');
    }
  }

  viewTicketDetails(ticket: PurchasedTicket): void {
    console.log('Voir détails du ticket:', ticket);
    // TODO: Ouvrir une modale avec le QR code agrandi
  }

  formatPrice(price: number): string {
    return price.toLocaleString('fr-FR');
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'valid':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'used':
      case 'utilized':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  }

  getStatusText(status: string): string {
    switch (status.toLowerCase()) {
      case 'valid':
      case 'active':
        return 'Valide';
      case 'used':
      case 'utilized':
        return 'Utilisé';
      case 'expired':
        return 'Expiré';
      default:
        return status;
    }
  }

  getTotalSpent(): number {
    return this.tickets.reduce((sum, ticket) => sum + ticket.totalPrix, 0);
  }

  getTotalTicketsCount(): number {
    return this.tickets.reduce((sum, ticket) => sum + ticket.nombreTicketAchete, 0);
  }


}
