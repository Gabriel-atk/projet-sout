import {inject, Injectable, signal} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, map, Observable, of, tap} from 'rxjs';

export interface Organizer {
  id: string;
  email: string;
  organizationName?: string;
  phone?: string;
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface VerificationResponse {
  success: boolean;
  message: string;
}
export interface VerifyCodeResponse {
  success: boolean;
  token?: string;
  organizer?: Organizer;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizerAuthService {
  private http=inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000';

  organizer=signal<Organizer | null>(null)
  constructor() {
    this.checkCurrentOrganizer();
  }
  sendVerificationCode(email: string): Observable<VerificationResponse>{
    return this.http.post<VerificationResponse>(`${this.API_URL}/api/verificationcode`, {email}).pipe(
      tap((response)=>{
        if (response.success){
          console.log('Code de vérification envoyé à:', email);
        }
      }),
      catchError((error)=>{
        console.error('Erreur lors de l\'envoi du code:', error);
        if (error.status === 429) {
          return of({
            success: false,
            message: 'Trop de tentatives. Veuillez réessayer dans quelques minutes.'
          });
        }
        return of({
          success: false,
          message: 'Erreur lors de l\'envoi du code. Veuillez réessayer.'
        });
      })
    )
  }
  verifyCode(email: string, code: string): Observable<VerifyCodeResponse> {
    return this.http.post<VerifyCodeResponse>(
      `${this.API_URL}/organizer/verify-code`,
      { email, code }
    ).pipe(
      tap((response) => {
        if (response.success && response.token && response.organizer) {
          // Sauvegarder le token et les infos
          localStorage.setItem('organizerToken', response.token);
          localStorage.setItem('organizerEmail', email);
          localStorage.setItem('organizerId', response.organizer.id);

          // Mettre à jour le signal
          const organizer: Organizer = {
            ...response.organizer,
            createdAt: response.organizer.createdAt
              ? new Date(response.organizer.createdAt)
              : undefined,
            updatedAt: response.organizer.updatedAt
              ? new Date(response.organizer.updatedAt)
              : undefined
          };

          this.organizer.set(organizer);
          console.log('Organisateur connecté:', organizer.email);
        }
      }),
      catchError((error) => {
        console.error('Erreur lors de la vérification du code:', error);

        // Messages d'erreur spécifiques
        if (error.status === 401) {
          return of({
            success: false,
            message: 'Code incorrect ou expiré'
          });
        }

        if (error.status === 404) {
          return of({
            success: false,
            message: 'Email non trouvé'
          });
        }

        return of({
          success: false,
          message: 'Erreur lors de la vérification. Veuillez réessayer.'
        });
      })
    );
  }

  getOrganizerProfile(): Observable<Organizer | null> {
    const token = localStorage.getItem('organizerToken');

    if (!token) {
      this.organizer.set(null);
      return of(null);
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any>(
      `${this.API_URL}/organizer/profile`,
      { headers }
    ).pipe(
      map((response) => {
        if (response.organizer) {
          const organizer: Organizer = {
            ...response.organizer,
            createdAt: response.organizer.createdAt
              ? new Date(response.organizer.createdAt)
              : undefined,
            updatedAt: response.organizer.updatedAt
              ? new Date(response.organizer.updatedAt)
              : undefined
          };

          this.organizer.set(organizer);
          return organizer;
        }
        return null;
      }),
      catchError((error) => {
        console.error('Erreur lors de la récupération du profil organisateur:', error);

        // Si le token est invalide, nettoyer
        if (error.status === 401) {
          this.logout();
        }

        this.organizer.set(null);
        return of(null);
      })
    );
  }
  checkCurrentOrganizer():void{
    const token = localStorage.getItem('organizerToken');

    if (token) {
      this.getOrganizerProfile().subscribe({
        next: (organizer) => {
          if (!organizer) {
            // Token invalide, nettoyer
            this.logout();
          }
        },
        error: () => {
          this.logout();
        }
      });
    } else {
      this.organizer.set(null);
    }
  }

  updateProfile(data: Partial<Organizer>): Observable<Organizer | null> {
    const token = localStorage.getItem('organizerToken');

    if (!token) {
      return of(null);
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<any>(
      `${this.API_URL}/organizer/profile`,
      data,
      { headers }
    ).pipe(
      map((response) => {
        if (response.organizer) {
          const organizer: Organizer = {
            ...response.organizer,
            createdAt: response.organizer.createdAt
              ? new Date(response.organizer.createdAt)
              : undefined,
            updatedAt: response.organizer.updatedAt
              ? new Date(response.organizer.updatedAt)
              : undefined
          };

          this.organizer.set(organizer);
          return organizer;
        }
        return null;
      }),
      catchError((error) => {
        console.error('Erreur lors de la mise à jour du profil:', error);
        return of(null);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('organizerToken');
    localStorage.removeItem('organizerEmail');
    localStorage.removeItem('organizerId');
    this.organizer.set(null);
    console.log('Organisateur déconnecté');
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('organizerToken');
    return !!token && this.organizer() !== null;
  }
  getToken(): string | null {
    return localStorage.getItem('organizerToken');
  }
  getCurrentOrganizerId(): string | null {
    return localStorage.getItem('organizerId');
  }
  getCurrentOrganizerEmail(): string | null {
    return localStorage.getItem('organizerEmail');
  }
  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<any>(
      `${this.API_URL}/organizer/check-email`,
      { params: { email } }
    ).pipe(
      map((response) => response.exists === true),
      catchError(() => of(false))
    );
  }

}
