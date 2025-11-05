import {Component, inject, OnDestroy} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {Credentials, LoginService} from '../../../../services/login.service';
import {Subscription} from 'rxjs';
import {User} from '../../../models/user';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnDestroy{
  connexionForm: FormGroup;
  private loginService = inject(LoginService)
  private router = inject(Router);
  private fb = inject(FormBuilder)

  private loginSubscription: Subscription | null = null;
  errorMessage: string='';
  isLoading: boolean = false;

  constructor(
    //private fb: FormBuilder,
    //private router: Route
  ) {
    this.connexionForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnDestroy(): void {
    this.loginSubscription?.unsubscribe();
  }

  login() {
    this.loginSubscription=this.loginService.login(
      this.connexionForm.value as Credentials
    ).subscribe({
      next: (result: User | null | undefined) => {
        this.navigateHome();
      },
      error: (error) => {

      }
    })
  }

  onSubmit() {
    if (this.connexionForm.valid) {
      this.isLoading = true;
      this.errorMessage='';

      const credentials: Credentials = {
        email: this.connexionForm.value.email,
        password: this.connexionForm.value.motDePasse,
      };

      this.loginSubscription=this.loginService.login(credentials).subscribe({
        next: (user: User | null | undefined) => {
          this.isLoading = false;
          if (user) {
            console.log('Connexion successfully logged in', user);
            this.navigateHome();
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.log('Error logged in', error);
          this.errorMessage = error.message;
        }
      });
    }
  }

  googleLogin() {
    console.log('Google login');
    // Logique de connexion Google
  }

  facebookLogin() {
    console.log('Facebook login');
    // Logique de connexion Facebook
  }

  private navigateHome() {
    this.router.navigate(['/']);
  }
}
