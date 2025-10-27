import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  connexionForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.connexionForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.connexionForm.valid) {
      console.log(this.connexionForm.value);
      // Logique de connexion ici
      // Exemple: this.authService.login(this.connexionForm.value)
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
}
