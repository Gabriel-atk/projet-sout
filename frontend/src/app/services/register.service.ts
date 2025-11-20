import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {LoginService} from './login.service';
import {catchError, map, Observable, of, tap, throwError} from 'rxjs';
import {User} from '../pages/models/user';

export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  role?: string;
  country?: string;
}
@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private http= inject(HttpClient)
  private loginService=inject(LoginService)
  private readonly API_URL="http://localhost:8080/api"

  /**
   * Inscription d'un nouvel utilisateur
   */
  /*register(registerCredentials: RegisterCredentials): Observable<User | null> {
    return this.http.post<any>(`${this.API_URL}/user/register`, registerCredentials).pipe(
      tap((result: any) => {
        if (result.token) {
          localStorage.setItem("token", result.token);
          const userB = new User(result.user);
          this.loginService.user.set(userB);
        }
      }),
      map((result: any) => {
        if (result.user) {
          return new User(result.user);
        }
        return null;
      }),
      catchError((error) => {
        console.error('Erreur lors de l\'inscription:', error);
        return of(null);
      })
    );
  }*/

  register(credentials: RegisterCredentials): Observable<User> {
    return this.http.post<any>(
      `${this.API_URL}/user/register`,
      credentials
    ).pipe(
      tap(response => console.log('Réponse du backend:', response)), // Pour debug
      map(response => {
        // Ici, response contient directement les propriétés du user
        return new User(response);
      }),
      catchError(error => {
        console.error('Erreur dans le service:', error); // Pour debug
        // On laisse remonter l’erreur au composant (très important)
        return throwError(() => error);
      })
    );
  }


  checkEmailExists(email: string): Observable<boolean>{
    return this.http.get<any>(`${this.API_URL+"register/email/checkEmailExists"}`,{
      params:{email}
    }).pipe(
      map((result: any) => result.exists),
      catchError(() => of(false))
    );
  }

}
