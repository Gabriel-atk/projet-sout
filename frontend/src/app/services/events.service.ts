import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {catchError, map, Observable, of} from 'rxjs';
import {EventUserSide} from '../pages/user/evenements/event/event-card';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api';

  getAllEvents(): Observable<EventUserSide[]>{
    return this.http.get<EventUserSide[]>(`${this.API_URL}/events/all`).pipe(
      map((events) => {
        // Trier par date (les plus récents en premier)
        return events.sort((a, b) =>
          new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime()
        );
      }),
      catchError((error) => {
        console.error('Erreur lors de la récupération des événements:', error);
        return of([]);
      })
    );
  }

  getEventByUuid(uuid: string): Observable<EventUserSide | null> {
    return this.http.get<EventUserSide>(`${this.API_URL}/events/${uuid}`).pipe(
      catchError((error) => {
        console.error(`Erreur lors de la récupération de l'événement ${uuid}:`, error);
        return of(null);
      })
    );
  }

  searchEvents(list: EventUserSide[], query: string): EventUserSide[] {
    if (!query || !query.trim()) {
      //return this.getAllEvents();
      return list;
    }

    const searchTerm= query.toLowerCase().trim();

    /*return this.getAllEvents().pipe(
      map((events) => {
        const searchTerm = query.toLowerCase().trim();
        return events.filter(event =>
          event.name.toLowerCase().includes(searchTerm) ||
          event.description.toLowerCase().includes(searchTerm) ||
          event.organizerName.toLowerCase().includes(searchTerm)
        );
      })
    );*/
    return list.filter(event =>
      event.name.toLowerCase().includes(searchTerm) ||
      event.description.toLowerCase().includes(searchTerm) ||
      event.organizerName.toLowerCase().includes(searchTerm)
    );
  }

  getEventsByOrganizer(organizerId: string): Observable<EventUserSide[]> {
    return this.http.get<EventUserSide[]>(`${this.API_URL}/events/organizer/${organizerId}`).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération des événements de l\'organisateur:', error);
        return of([]);
      })
    );
  }


  sortEvents(events: EventUserSide[], sortBy: 'date' | 'name' | 'capacity' | 'organizer', order: 'asc' | 'desc' = 'asc'): EventUserSide[] {
    const sorted = [...events];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime();
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'capacity':
          comparison = a.capacity - b.capacity;
          break;
        case 'organizer':
          comparison = a.organizerName.localeCompare(b.organizerName);
          break;
      }

      return order === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }
}
