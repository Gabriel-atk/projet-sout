import {ChangeDetectorRef, Component, inject, OnDestroy} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {RegisterCredentials, RegisterService} from '../../../../services/register.service';
import {Router, RouterLink} from '@angular/router';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class Register implements OnDestroy{
  inscriptionForm: FormGroup;
  private registerService=inject(RegisterService)
  private router=inject(Router);
  private fb=inject(FormBuilder)
  private cdr=inject(ChangeDetectorRef);

  private registerSubscription: Subscription | null = null;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;


  constructor() {
    this.inscriptionForm = this.fb.group(
      {
        nom: ['', [Validators.required, Validators.minLength(3)]],
        prenom: ['', [Validators.required, Validators.minLength(3)]],
        indicatif: ['+228', [Validators.required]],
        telephone: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
        email: ['', [Validators.required, Validators.email]],
        motDePasse: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]]
      },
      {validators: this.passwordMatchValidator});
  }

  ngOnDestroy(): void {
    this.registerSubscription?.unsubscribe();
  }

  /**
   * Validator personnalisé pour vérifier que les mots de passe correspondent
   */
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password=control.get('motDePasse');
    const confirmPassword=control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value===confirmPassword.value?null: {mismatch: true};
  }

  /**
   * Vérifier si les mots de passe correspondent
   */
  get passwordsMatch():boolean{
    const password=this.inscriptionForm.get('motDePasse')?.value;
    const confirmPassword = this.inscriptionForm.get('confirmPassword')?.value;
    return password === confirmPassword;
  }

  /**
   * Vérifier si le champ confirmPassword a été touché et les mots de passe ne correspondent pas
   */
  get showPasswordMismatch(): boolean {
    const confirmPassword = this.inscriptionForm.get('confirmPassword');
    return !!(confirmPassword?.touched && !this.passwordsMatch);
  }


  onSubmit() {
      if (this.inscriptionForm.valid) {
        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';
        this.cdr.detectChanges();

        const fullPhone = `${this.inscriptionForm.value.indicatif}${this.inscriptionForm.value.telephone}`;

        const credentials: RegisterCredentials = {
          firstName: this.inscriptionForm.value.prenom,
          lastName: this.inscriptionForm.value.nom,
          email: this.inscriptionForm.value.email,
          password: this.inscriptionForm.value.motDePasse,
          phone: fullPhone,
          role: 'USER',
          country: 'TG'
        };

        this.registerSubscription=this.registerService.register(credentials).subscribe({
          next: (user)=> {
            this.isLoading = false;
            if (user) {
              console.log('Inscription réussie', user);
              this.successMessage = 'Inscription réussie !  Veuillez vous connecter';
              this.cdr.detectChanges();
              // Rediriger vers la page d'accueil après 1.5 secondes
              setTimeout(() => {
                this.router.navigate(['/login']);
              }, 1500);
            }else {
              this.errorMessage='Une erreur est survenue lors de l\'inscription';
              this.cdr.detectChanges();
            }
          },
          error: (error)=> {
            this.isLoading = false;
            console.error('Erreur d\'inscription', error);
            this.errorMessage = error.error?.message || 'Une erreur est survenue. Veuillez réessayer.';
            this.cdr.detectChanges();
          }
        });
      }else {
        this.inscriptionForm.markAllAsTouched();
        this.cdr.detectChanges();
      }
    }

  /**
   * Naviguer vers la page d'accueil
   */
  private navigateHome() {
    this.router.navigate(['/']);
  }

  /**
   * Vérifier si un champ a une erreur et a été touché
   */
  hasError(fieldName: string): boolean {
    const field = this.inscriptionForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Obtenir le message d'erreur pour un champ
   */
  getErrorMessage(fieldName: string): string {
    const field = this.inscriptionForm.get(fieldName);

    if (field?.hasError('required')) {
      return 'Ce champ est requis';
    }
    if (field?.hasError('email')) {
      return 'Email invalide';
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Minimum ${minLength} caractères requis`;
    }
    if (field?.hasError('pattern')) {
      return 'Format invalide (8 chiffres attendus)';
    }

    return '';
  }
}
