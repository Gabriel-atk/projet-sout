import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Subject, takeUntil} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {EventsService} from '../../../../services/events.service';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-event-detail',
  imports: [
    NgClass
  ],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.css',
})
export class EventDetail implements OnInit , OnDestroy{
  event: any=null
  isLoading=true
  errorMessage: string | null = null;
  private destroy$=new Subject<void>();

  constructor(private route: ActivatedRoute,
              private router: Router,
              private eventService: EventsService,
              private cdr: ChangeDetectorRef){}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const eventId = params['eventId'];
      if (eventId) {
        this.loadEventDetails(eventId);
      }
    })
  }

  private loadEventDetails(eventId: string): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.detectChanges();

    this.eventService.getEventByUuid(eventId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.event = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors du chargement:', err);
        this.errorMessage = 'Impossible de charger les détails de l\'événement.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    })
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  goToPurchase(): void {
    if (this.event?.uuid) {
      this.router.navigate(['purchase-ticket', this.event.uuid]);
    }
  }

  goBack(): void {
    this.router.navigate(['events']);
  }

  getEventImage(): string {
    return this.event?.imageUrl || 'assets/images/event-placeholder.jpg';
  }

  getStatusClass(): string {
    const now = new Date();
    const startDate = new Date(this.event?.startDateTime);
    const endDate = new Date(this.event?.endDateTime);

    if (now < startDate) return 'status-upcoming';
    if (now >= startDate && now <= endDate) return 'status-ongoing';
    return 'status-ended';
  }

  getStatusText(): string {
    const now = new Date();
    const startDate = new Date(this.event?.startDateTime);
    const endDate = new Date(this.event?.endDateTime);

    if (now < startDate) return 'À venir';
    if (now >= startDate && now <= endDate) return 'En cours';
    return 'Terminé';
  }
}
