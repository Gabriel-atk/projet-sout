import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {LoginService} from './login.service';
import {catchError, map, Observable, of, tap} from 'rxjs';
import {User} from '../pages/models/user';

export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  telephone: string;
}
@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private http= inject(HttpClient)
  private loginService=inject(LoginService)
  private readonly API_URL="http://localhost:8080/"

  /**
   * Inscription d'un nouvel utilisateur
   */
  register(registerCredentials: RegisterCredentials): Observable<User | null>{
    return this.http.post<any>(this.API_URL+"register", registerCredentials).pipe(
      tap((result: any)=>{
        if (result.token){
          localStorage.setItem("token",result.token);
          const userB=new User(result.user);
          this.loginService.login(userB);
        }
      }),
      map((result:any)=>{
        if (result.user){
          return new User(result.user);
        }
        return null;
      }),
      catchError((error) => {
        console.error('Erreur lors de l\'inscription:', error);
        return of(null);
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
