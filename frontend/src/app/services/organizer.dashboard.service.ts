import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpContext, HttpHeaders, HttpParams, HttpResponse} from '@angular/common/http';
import {catchError, map, Observable, of, throwError} from 'rxjs';
import {EventOrganizerSide} from '../pages/models/eventOrganizerSide';
import {environment} from '../../environments/environment';
import {SKIP_AUTH_REDIRECT} from '../interceptors/organizer-auth.interceptor';

export type TicketType= 'VIP' | 'REGULAR';
export interface TicketTemplateCreate {
  eventTrackingId: string;
  type: TicketType;
  price: number;
  nombreTicketsDisponible: number;
  creatorId: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizerDashboardService {
  private http=inject(HttpClient)
  private readonly API_URL = environment.apiURL;
  private readonly API_BASE=environment.apiURL.replace(/\/+$/, '');
  private readonly API_PREFIX = '/api';

  private url(path: string): string {
    const clean = path.startsWith('/') ? path : `/${path}`;
    return `${this.API_BASE}${this.API_PREFIX}${clean}`;
  }




  getOrganizerEvents():Observable<EventOrganizerSide[]>{
    const trackingId = localStorage.getItem('organizerTrackingId');

    if (!trackingId || trackingId==='undefined' || trackingId==='null') {
      console.error('Tracking ID invalide:', trackingId);
      return of([])
    }

    return this.http.get<EventOrganizerSide[]>(`${this.API_URL}/api/events/organizer/${trackingId}`).pipe(
      map(res => res ?? []),
      catchError((err) => {
        console.error('Erreur lors de la récupération des événements: ', err);
         return throwError(() => err);
      })
    );
  }



  createEvent(eventData: {
    name: string;
    description: string;
    capacity: number;
    localization: string;
    startDateTime: string;
    endDateTime: string;
    images: string[];
  }): Observable<{ status: number; body: EventOrganizerSide | null }> {
    const organizerId = localStorage.getItem('organizerTrackingId');

    if (!organizerId || organizerId === 'undefined' || organizerId === 'null') {
      return throwError(() => ({ status: 401, message: 'Non authentifié' })); // Changement ici
    }




    const queryString = [
      `name=${encodeURIComponent(eventData.name)}`,
      `description=${encodeURIComponent(eventData.description)}`,
      `capacity=${eventData.capacity}`,
      `localization=${encodeURIComponent(eventData.localization)}`,
      `startDateTime=${encodeURIComponent(eventData.startDateTime)}`,
      `endDateTime=${encodeURIComponent(eventData.endDateTime)}`,
      `organizerId=${encodeURIComponent(organizerId)}`,
    ].join('&');
    const url = `http://localhost:9081/api/api/events/create?${queryString}`;
    console.log('URL envoyée:', url);

    const formatData=new FormData();
    if (eventData.images.length > 0) {
      eventData.images.forEach(img => formatData.append('images', img));
    } else {
      formatData.append('images', ''); // Champ vide mais présent
    }

    return this.http.post<EventOrganizerSide>(url, formatData, {
      //params,
      observe: 'response',
      context: new HttpContext().set(SKIP_AUTH_REDIRECT, false),
    }).pipe(
      map((res: HttpResponse<EventOrganizerSide>) => {
        console.log('HTTP Status:', res.status);
        console.log('HTTP Body:', res.body);
        console.log('HTTP Headers:', res.headers.get('content-type'));
        return {
          status: res.status,
          body: res.body ?? null,
        };
      }),
      catchError((error) => throwError(() => error))
    );
  }

  createTicketTemplate(ticketData: {
    eventTrackingId: string;
    type: 'VIP' | 'REGULAR';
    price: number;
    nombreTicketsDisponible: number;
  }) : Observable<any>{
    const creatorId = localStorage.getItem('organizerTrackingId');

    if (!creatorId) {
      return throwError(() => new Error('Authentification requise'));
    }

    const requestBody={
      eventTrackingId:ticketData.eventTrackingId,
      type: ticketData.type,
      price: ticketData.price,
      nombreTicketsDisponible: ticketData.nombreTicketsDisponible,
      creatorId: creatorId
    }


    return this.http.post(`${this.API_URL}/ticket_template/create`,
      requestBody,
      {
        context: new HttpContext().set(SKIP_AUTH_REDIRECT, true)
      }
    ).pipe(
      catchError((error) => {
        console.error('Erreur lors de la création du modèle de billet:', error);
        return throwError(() => error);
      })
    );
  }


  private base64ToBlob(base64: string): Blob {
    const parts=base64.split(';base64,');
    const contentType=parts[0].split(':')[1];
    const raw = window.atob(parts[1])
    const rawLength = raw.length;
    const uInt8Array=new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });

  }

  checkEventHasBilleterie(eventTrackingId:string): Observable<boolean> {


    return this.http.get<any[]>(
      `${this.API_URL}/ticket_template/getAllForOne/${eventTrackingId}`,
      {
        context: new HttpContext().set(SKIP_AUTH_REDIRECT, true)
      }
    ).pipe(
      map((templates) => templates && templates.length > 0),
      catchError((err) => {
        console.error('Erreur lors de la vérification de la billetterie pour l\'événement', eventTrackingId, err);
        return of(false);
      })
    )
  }
}
