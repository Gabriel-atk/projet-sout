import {inject, Injectable, signal} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {User} from '../pages/models/user';
import {catchError, map, Observable, of, tap} from 'rxjs';

export interface Credentials {
  email: string;
  password: string;
}
@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private http= inject(HttpClient)
  private readonly API_URL = 'http://localhost:8080/api';

  user = signal<User | null | undefined >(undefined)

  constructor() {
    this.checkCurrentUser();
  }

  login(credentials: Credentials): Observable<User | null | undefined>{
    return this.http.post<User>(`${this.API_URL}/user/login`, credentials).pipe(
      tap((result: any) => {
        localStorage.setItem('token', result['token'])
        const userB = new User(result.user);
        this.user.set(userB);
      }),
      map(() => this.user()),
      catchError((error)=>{
        console.error('Erreur de connexion:', error);
        this.user.set(null);
        return of(null);
      })
    );
  }

  /*getUser(): Observable<User | null | undefined>{
    return this.http.get('/users').pipe(
      tap((result: any) => {
        const userB = new User(result.user);
        this.user.set(userB);
      }),
      map(() => this.user())
    )
  }*/

  /**
   * Récupérer l'utilisateur connecté
   */

  getUser(): Observable<User | null | undefined> {
    const token = localStorage.getItem('token');

    if (!token) {
      this.user.set(null);
      return of(null);
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any>(`/user`, { headers }).pipe(
      tap((result: any) => {
        const userB = new User(result.user);
        this.user.set(userB);
      }),
      map(() => this.user()),
      catchError((error) => {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        this.user.set(null);
        localStorage.removeItem('token');
        return of(null);
      })
    );
  }

  /**
   * Vérifier si un utilisateur est connecté au chargement de l'application
   */
  checkCurrentUser(): void {
    const token = localStorage.getItem('token');

    if (token) {
      this.getUser().subscribe();
    } else {
      this.user.set(null);
    }
  }

  /*logout(): Observable<null> {
    return this.http.get('url').pipe(
      tap((result: any) => {
        localStorage.removeItem('token')
        this.user.set(null);
      })
    )
  }*/

  /**
   * Déconnexion de l'utilisateur
   */
  logout(): void {
    localStorage.removeItem('token');
    this.user.set(null);
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isLoggedIn(): boolean {
    return this.user() !== null && this.user() !== undefined;
  }

  setUser(user: User): void {
    this.user.set(user);
  }
}
