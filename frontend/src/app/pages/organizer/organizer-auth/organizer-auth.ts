import {Component, inject, OnDestroy} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {OrganizerAuthService} from '../services/organizer.auth.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-organizer-auth',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './organizer-auth.html',
  styleUrl: './organizer-auth.css',
})
export class OrganizerAuth implements OnDestroy{
  private fb=inject(FormBuilder)
  private router=inject(Router);
  private authService=inject(OrganizerAuthService)

  emailForm:FormGroup;
  currentStep: 'email' | 'verification' = 'email';
  email='';
  verificationCode=['','','','','','']
  isLoading=false;
  errorMessage=''
  successMessage=''
  private authSubscription:Subscription | null=null;
  constructor() {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe()
  }

  onSubmitEmail(): void {
    if (this.emailForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.email = this.emailForm.value.email;

      this.authSubscription = this.authService.sendVerificationCode(this.email).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.currentStep = 'verification';
            this.successMessage = 'Code envoyé ! Vérifiez votre boîte mail.';
            setTimeout(() => this.successMessage = '', 3000);
          } else {
            this.errorMessage = 'Erreur lors de l\'envoi du code';
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Erreur:', error);
          this.errorMessage = 'Impossible d\'envoyer le code. Veuillez réessayer.';
        }
      });
    }
  }

  onCodeInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Ne garder qu'un seul caractère
    if (value.length > 1) {
      input.value = value.charAt(0);
    }

    this.verificationCode[index] = input.value;

    // Passer au champ suivant si un caractère est saisi
    if (input.value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  }

  onCodeKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    }
  }

  onCodePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text');

    if (pastedData && /^\d{6}$/.test(pastedData)) {
      this.verificationCode = pastedData.split('');
      this.verificationCode.forEach((digit, index) => {
        const input = document.getElementById(`code-${index}`) as HTMLInputElement;
        if (input) {
          input.value = digit;
        }
      });

      // Focus sur le dernier champ
      const lastInput = document.getElementById('code-5') as HTMLInputElement;
      if (lastInput) {
        lastInput.focus();
      }
    }
  }

  onSubmitCode(): void {
    const code = this.verificationCode.join('');

    if (code.length !== 6) {
      this.errorMessage = 'Veuillez entrer le code à 6 chiffres';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authSubscription = this.authService.verifyCode(this.email, code).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.token) {
          // Sauvegarder le token organisateur
          localStorage.setItem('organizerToken', response.token);
          localStorage.setItem('organizerEmail', this.email);

          this.successMessage = 'Connexion réussie ! Redirection...';

          // Rediriger vers le dashboard organisateur
          setTimeout(() => {
            this.router.navigate(['/organizer/dashboard']);
          }, 1500);
        } else {
          this.errorMessage = 'Code invalide';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erreur:', error);

        if (error.status === 401) {
          this.errorMessage = 'Code incorrect ou expiré';
        } else {
          this.errorMessage = 'Erreur lors de la vérification. Veuillez réessayer.';
        }
      }
    });
  }

  resendCode(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.verificationCode = ['', '', '', '', '', ''];

    // Réinitialiser les inputs
    for (let i = 0; i < 6; i++) {
      const input = document.getElementById(`code-${i}`) as HTMLInputElement;
      if (input) {
        input.value = '';
      }
    }

    this.authSubscription = this.authService.sendVerificationCode(this.email).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = 'Code renvoyé avec succès !';
          setTimeout(() => this.successMessage = '', 3000);
        } else {
          this.errorMessage = 'Erreur lors de l\'envoi du code';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erreur:', error);
        this.errorMessage = 'Impossible de renvoyer le code. Veuillez réessayer.';
      }
    });
  }

  changeEmail(): void {
    this.currentStep = 'email';
    this.verificationCode = ['', '', '', '', '', ''];
    this.errorMessage = '';
    this.successMessage = '';
  }

  isCodeComplete(): boolean {
    return this.verificationCode.every(digit => digit !== '');
  }

}
