import {inject, Injectable, signal} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {User} from '../pages/models/user';
import {catchError, map, Observable, of, tap} from 'rxjs';
import {environment} from '../../environments/environment';

export interface Credentials {
  email: string;
  password: string;
}
@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private http= inject(HttpClient)
  private readonly API_URL = environment.apiURL;

  user = signal<User | null>(null)

  setUser(value: User | null) {
    this.user.set(value);
  }

  constructor() {
    this.checkCurrentUser();
  }

  /**
   * Vérifier si un utilisateur est connecté au chargement de l'application
   */
  checkCurrentUser(): void {
    const token = localStorage.getItem('token');
    const rawUser=localStorage.getItem('user');

    if (!token || !rawUser || rawUser === 'undefined' || rawUser === 'null') {
      this.logout();
      return;
    }

    try {
      this.user.set(new User(JSON.parse(rawUser)));
    }catch {
      this.logout();
    }
  }

  login(credentials: Credentials): Observable<User | null>{
    return this.http.post<any>(`${this.API_URL}/users/login`, credentials).pipe(
      tap(result => {
        //localStorage.setItem('token', result['token'])
        //localStorage.setItem('user', JSON.stringify(result.user))
        //this.user.set(new User(result.user));
        const userPayload = result.user ?? result.data ?? result;
        if (!userPayload) {
          throw new Error('Utilisateur manquant dans la réponse');
        }

        if (result.token) {
          localStorage.setItem('token', result.token);
        }

        localStorage.setItem('user', JSON.stringify(userPayload));
        this.user.set(new User(userPayload));
        localStorage.setItem('userTrackingId', result.trackingId)
      }),
      map(() => this.user()),
      catchError((err)=>{
        console.error('Erreur de connexion:', err);
        this.logout();
        return of(null);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.user.set(null);
  }

  isLoggedIn(): boolean {
    return this.user() !== null ;
  }


}
