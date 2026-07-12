import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {LoginService} from './login.service';
import {catchError, map, Observable, of, tap, throwError} from 'rxjs';
import {User} from '../pages/models/user';
import {environment} from '../../environments/environment';

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
  private readonly API_URL=environment.apiURL;

  /**
   * Inscription d'un nouvel utilisateur
   */


  register(credentials: RegisterCredentials): Observable<User> {
    return this.http.post<any>(
      `${this.API_URL}/users/register`,
      credentials
    ).pipe(
      tap(response =>{
        console.log('Reponse du backend : ', response)
        /*if (response.token) {
          localStorage.setItem('token', response.token);
        }
        const userData=response.user || response;
        localStorage.setItem('user', JSON.stringify(userData));
        this.loginService.setUser(new User(userData));*/
      }),
      map(response =>  new User(response.user || response)),
      catchError(error => {
        console.error('Erreur dans le service:', error); // Pour debug
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
