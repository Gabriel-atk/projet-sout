import {inject, Injectable, signal} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, map, Observable, of, tap, throwError} from 'rxjs';
import {Router} from '@angular/router';
import {environment} from '../../environments/environment';

export interface Organizer {
  id: string;
  email: string;
  organizationName?: string;
  phone?: string;
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RegisterResponse {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  role: string;
  country: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  trackingId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  roles: string;
  rolesList: string[];
  actif: boolean;
  country: string;
}


export interface VerificationResponse {
  success: boolean;
  message?: string;
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
  private router=inject(Router);
  private readonly API_URL = environment.apiURL;

  organizer=signal<Organizer | null>(null)

  constructor() {
    this.checkCurrentOrganizer();
  }

  registerOrganizer(data: any): Observable<RegisterResponse>{
    return this.http.post<RegisterResponse>(`${this.API_URL}/users/register`,
      data
    ).pipe(
      tap((result)=>{
        console.log("Organisateur crée",result)
        //stocker les choses utiles ici
        localStorage.setItem('organizerEmail', data.email);
        this.organizer.set({
          id:result.email,
          email: result.email,
          isVerified: false
        })
      }),
      catchError((error) => {
        console.error('Registration error:', error);
        return of({
          firstName: '',
          lastName: '',
          phone: '',
          email: '',
          password: '',
          role: '',
          country: ''
        });
      })
    )
  }

  loginOrganizer(email: string, password:string): Observable<LoginResponse | null>{
    return this.http.post<LoginResponse>(`${this.API_URL}/users/login`,
      {email, password}
    ).pipe(
      map(response=>{
        console.log('LoginResponse brut:', response);
        const rawRoles=response.rolesList && response.rolesList.length
          ? response.rolesList
          : (response.roles ? [response.roles] : []);

        const normalizedRoles=rawRoles.map(r => {
          const upper = r.toUpperCase();
          if (upper.startsWith('ROLE_')) {
            return upper.substring(5);
          }
          return upper;
        });

        const isOrganizer=normalizedRoles.includes('ADMIN_EVENT')
        if (!isOrganizer){
          throw new Error('L\'utilisateur n\'est pas un organisateur');
        }

        console.log("Organisateur connecté",response)
        localStorage.setItem('organizerToken', response.token);
        localStorage.setItem('organizerEmail', response.email);
        localStorage.setItem('organizerId', response.trackingId);
        localStorage.setItem('OrganizerFullName', `${response.lastName} ${response.firstName}`);
        localStorage.setItem('organizerTrackingId', response.trackingId);

        this.organizer.set({
          id:response.trackingId,
          email: response.email,
          phone: response.phone,
          isVerified: response.actif,
          organizationName: '',
          createdAt: undefined,
          updatedAt: undefined
        });
        return response;
      }),
      catchError((error) => {
        console.error('Login organizer error:', error);
        localStorage.removeItem('organizerToken');
        localStorage.removeItem('organizerEmail');
        localStorage.removeItem('organizerId');
        localStorage.removeItem('OrganizerFullName');
        localStorage.removeItem('organizerTrackingId');
        return throwError(() => error);
      })
    );
  }

  sendVerificationCode(email: string): Observable<VerificationResponse> {
    return this.http.post<VerificationResponse>(
      `${this.API_URL}/organizer/send-code`,
      { email }
    ).pipe(
      tap((response) => {
        if (response.success) {
          console.log('Code de vérification envoyé à:', email);
        }
      }),
      catchError((error) => {
        console.error('Erreur lors de l\'envoi du code:', error);

        // Retourner une réponse d'erreur appropriée
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
    );
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


  private checkCurrentOrganizer(): void {
    const token = localStorage.getItem('organizerToken');
    const email = localStorage.getItem('organizerEmail');
    const id = localStorage.getItem('organizerId');
    const fullName = localStorage.getItem('OrganizerFullName');

    if (token && email && id) {
      this.organizer.set({
        id: id,
        email: email,
        organizationName: fullName || '',
        isVerified: true,
        phone:''
      })
    } else {
      this.organizer.set(null);
    }
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
    const id=localStorage.getItem('organizerId');
    return !!token && !!id;
  }


  getToken(): string | null {
    return localStorage.getItem('organizerToken');
  }
  getOrganizerFullName(): string | null {
    return localStorage.getItem('OrganizerFullName');
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
