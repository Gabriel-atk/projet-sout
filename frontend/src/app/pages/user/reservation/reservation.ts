import {Component, computed, inject, OnDestroy, OnInit} from '@angular/core';
import {LoginService} from '../../../services/login.service';
import {DatePipe} from '@angular/common';
import {ReservationService, Reservation as ReservationModel} from '../../../services/reservation.service';
import {Subscription} from 'rxjs';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-reservation',
  imports: [
    DatePipe,
    RouterLink
  ],
  templateUrl: './reservation.html',
  styleUrl: './reservation.css',
})
export class Reservation implements OnInit, OnDestroy {

  private loginService=inject(LoginService);
  private reservationService=inject(ReservationService);

  user=this.loginService.user;
  isLoggedIn=computed(()=>this.user() !==null && this.user() !== undefined);

  reservations:ReservationModel[] = [];
  isLoading=false;
  errorMessage='';

  private reservationsSubscription:Subscription | null=null;

  ngOnInit(): void {
    if (this.isLoggedIn()) {
      this.loadReservations();
    }
  }

  ngOnDestroy(): void {
    this.reservationsSubscription?.unsubscribe();
  }

  private loadReservations() {
    this.isLoading=true;
    this.errorMessage='';

    this.reservationsSubscription=this.reservationService.getUserReservations().subscribe({
      next: (reservations) => {
        this.reservations = reservations;
        this.isLoading=false;
        console.log('Réservations chargées:', reservations);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des réservations:', error);
        this.isLoading = false;
        this.errorMessage = 'Impossible de charger vos réservations. Veuillez réessayer.';
        this.loadMockData();
      }
    });



  }


  private loadMockData(): void {
    console.warn('Chargement des données mockées');
    setTimeout(() => {
      this.reservations = [
        {
          id: '1',
          title: 'Concert Jazz Festival',
          eventDateTime: new Date('2025-12-15T20:00:00'),
          ticketCount: 2,
          totalPrice: 15000,
          bookingDate: new Date('2025-10-20T10:30:00'),
          eventId: 'evt001',
          userId: this.user()?.id || 'user001'
        },
        {
          id: '2',
          title: 'Match de Football - Final',
          eventDateTime: new Date('2025-11-30T18:00:00'),
          ticketCount: 4,
          totalPrice: 8000,
          bookingDate: new Date('2025-10-25T14:20:00'),
          eventId: 'evt002',
          userId: this.user()?.id || 'user001'
        },
        {
          id: '3',
          title: 'Festival de Musique Urbaine',
          eventDateTime: new Date('2025-12-01T19:00:00'),
          ticketCount: 1,
          totalPrice: 5000,
          bookingDate: new Date('2025-10-15T09:00:00'),
          eventId: 'evt003',
          userId: this.user()?.id || 'user001'
        }
      ];
      this.isLoading = false;
      this.errorMessage = '';
    }, 1000);
  }

  refreshReservations(): void {
    this.loadReservations();
  }



  downloadTickets(reservationId: string): void {
    // TODO: Implémenter le téléchargement des billets
    console.log('Téléchargement des billets pour la réservation:', reservationId);
    alert('Fonctionnalité de téléchargement en cours de développement');
  }

  viewDetails(reservationId: string): void {
    // TODO: Naviguer vers la page de détails ou ouvrir une modale
    console.log('Voir les détails de la réservation:', reservationId);
    alert('Détails de la réservation ID: ' + reservationId);
  }

  /**
   * Vérifier si une réservation peut être annulée
   * (par exemple, pas d'annulation possible 24h avant l'événement)
   */
  canCancelReservation(reservation: ReservationModel): boolean {
    const now = new Date();
    const eventDateTime = new Date(reservation.eventDateTime);
    const hoursDifference = (eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Autoriser l'annulation si l'événement est dans plus de 24h
    return hoursDifference > 24;
  }

  formatPrice(price: number): string {
    return price.toLocaleString('fr-FR');
  }

  getTotalSpent(): number {
    return this.reservations.reduce((sum, r) => sum + r.totalPrice, 0);
  }
}
