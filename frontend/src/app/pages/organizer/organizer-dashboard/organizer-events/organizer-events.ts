import {ChangeDetectorRef, Component, inject, NgZone, OnInit} from '@angular/core';
import {OrganizerDashboardService} from '../../../../services/organizer.dashboard.service';
import {OrganizerAuthService} from '../../../../services/organizer.auth.service';
import {Router} from '@angular/router';
import {EventOrganizerSide} from '../../../models/eventOrganizerSide';
export interface EventToCreate{
  name: string;
  description: string;
  capacity: number;
  startDateTime: string;
  endDateTime: string;
  organizerId: string;
  images: string[];
}
import {DatePipe, CommonModule} from '@angular/common';
import {finalize} from 'rxjs';
import {TicketTemplate} from '../ticket-template/ticket-template';

@Component({
  selector: 'app-organizer-events',
  imports: [CommonModule, DatePipe, TicketTemplate],
  templateUrl: './organizer-events.html',
  styleUrls: ['./organizer-events.css'],
})
export class OrganizerEvents implements OnInit {
  private organizerDashboardService=inject(OrganizerDashboardService)
  private organizerAuthService=inject(OrganizerAuthService)
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef)
  private ngZone=inject(NgZone);
  private eventsWithBilleterie=new Set<string>();

  events: EventOrganizerSide[] = [];
  loading = false;
  error: string | null = null;

  stats = {
    totalEvents: 0,
    publishedEvents: 0,
    totalTicketsSold: 0,
    totalRevenue: 0
  };

  showTicketTemplate=false
  selectedEventId: string='';

  ngOnInit(): void {
    this.loadOrganizerEvents()
  }

  loadOrganizerEvents() {
    const token = localStorage.getItem('organizerToken');
    const trackingId = localStorage.getItem('organizerTrackingId');

    console.log('=== DEBUG CHARGEMENT ===');
    console.log('Token présent:', !!token);
    console.log('TrackingId:', trackingId);
    console.log('URL appelée:', `${this.organizerDashboardService['API_URL']}/events/organizer/${trackingId}`);

    //this.loading = true;
    this.error = null;
    this.loading = false;
    this.cdr.detectChanges();

    this.organizerDashboardService.getOrganizerEvents().subscribe({
      next: (events) => {
        this.ngZone.run(() => {
          console.log('Événements reçus:', events);
          this.events = events ?? [];
          // Charger l'état de billeterie pour chaque événement
          this.events.forEach(event => {
            this.organizerDashboardService.checkEventHasBilleterie(event.uuid)
              .subscribe(hasBilleterie => {
                if (hasBilleterie) {
                  this.eventsWithBilleterie.add(event.uuid);
                  this.cdr.detectChanges();
                }
              });
          });
          this.calculateStats();
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          console.error('Erreur de chargement:', err);
          this.error = 'Erreur lors du chargement des événements';
          this.events = [];
          this.cdr.detectChanges();
        });
      }
    });
  }

  openTicketTemplate(eventTrackingId: string){
    this.selectedEventId = eventTrackingId;
    this.showTicketTemplate = true;
  }

  closeTicketTemplate(){
    this.showTicketTemplate = false;
    this.selectedEventId = '';
  }

  calculateStats() {
    this.stats.totalEvents = this.events.length;
    this.stats.publishedEvents = this.events.length; // Tous les événements sont considérés actifs
    // Ces valeurs devraient venir du backend
    this.stats.totalTicketsSold = 0;
    this.stats.totalRevenue = 0;
  }

  trackByEvent(_:number, item: EventOrganizerSide){
    return item?.uuid ?? _;
  }

  hasBilleterie(event: EventOrganizerSide): boolean{
    if (!event) return false
    const anyEvent = event as any
    const backendHas = Array.isArray(anyEvent.ticketTemplates)
    ? anyEvent.ticketTemplates.length > 0
    : !! anyEvent.hasBilleterie;
    return backendHas || this.eventsWithBilleterie.has(event.uuid);
  }

  onTicketCreated(){
    this.eventsWithBilleterie.add(this.selectedEventId);
    this.closeTicketTemplate();
    this.loadOrganizerEvents();
  }
}
