import {ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {EventCard, EventUserSide} from '../event/event-card';
import {EventsService} from '../../../../services/events.service';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [
    EventCard,
    FormsModule
    ,CommonModule
  ],
  templateUrl: './evenements.html',
  styleUrl: './evenements.css',
})
export class Evenements implements OnInit {
  private eventService=inject(EventsService)
  private cdr = inject(ChangeDetectorRef);

  events: EventUserSide[]=[];
  filteredEvents: EventUserSide[] = [];

  loading = false;
  error: string | null = null;

  // Filtres
  searchQuery = '';

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.loading = true;
    this.error = null;

    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.filteredEvents = events;
        this.loading = false;
        // force Angular à rafraîchir la vue immédiatement
        try { this.cdr.detectChanges(); } catch(e) { /* ignore */ }
        console.log('Events reçus:', events.length);
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des événements';
        this.loading = false;
        console.error(err);
      }
    });
  }


  onSearch() {
    this.filteredEvents=this.eventService.searchEvents(this.events, this.searchQuery || '');
  }

  resetSearch() {
    this.searchQuery = '';
    //this.loadEvents();
    this.filteredEvents = this.events;
  }


  get totalEvents(): number {
    return this.events.length;
  }

  get hasResults(): boolean {
    return this.filteredEvents.length > 0;
  }

}
