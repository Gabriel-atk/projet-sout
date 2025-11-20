import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, map, Observable, of, throwError} from 'rxjs';
import {EventModel} from '../pages/models/event.model';

@Injectable({
  providedIn: 'root'
})
export class OrganizerDashboardService {
  private http=inject(HttpClient)
  private readonly API_URL = 'http://localhost:3000';




  getOrganizerEvents():Observable<EventModel[]>{
    const token = localStorage.getItem('token');

    if (!token) {
      return of([])
    }

    const headers=new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<EventModel[]>(`${this.API_URL}/organizer/events`, { headers }).pipe(
      map((response: any) => {
        // Si votre API retourne les données dans un wrapper (ex: {data: [...], success: true})
        // décommentez la ligne suivante et ajustez selon votre structure
        // return response.data || response;

        return response;
      }),
      catchError((error) => {
        console.error('Erreur lors de la récupération des événements:', error);

        // Gestion spécifique des erreurs
        if (error.status === 401) {
          console.error('Token invalide ou expiré');
          localStorage.removeItem('token'); // Nettoyer le token invalide
          // Optionnel: rediriger vers la page de connexion
          // this.router.navigate(['/organizer/auth']);
        } else if (error.status === 403) {
          console.error('Accès refusé. Vous n\'êtes pas un organisateur.');
        } else if (error.status === 404) {
          console.warn('Aucun événement trouvé');
          return of([]); // Retourner tableau vide si aucun événement
        }

        // Retourner un tableau vide en cas d'erreur
        //return of([]);

        // Alternative: propager l'erreur pour la gérer dans le composant
         return throwError(() => error);
      })
    );
  }

  createEvent(eventData: Partial<EventModel>): Observable<EventModel | null> {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('Impossible de créer un événement sans authentification');
      return of(null);
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<EventModel>(`${this.API_URL}/organizer/events`, eventData, { headers }).pipe(
      catchError((error) => {
        console.error('Erreur lors de la création de l\'événement:', error);
        return throwError(() => error);
      })
    );
  }
}
