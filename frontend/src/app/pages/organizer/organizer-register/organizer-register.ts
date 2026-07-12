import {ChangeDetectorRef, Component, inject, OnDestroy} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {OrganizerAuthService} from '../../../services/organizer.auth.service';
import {Subscription} from 'rxjs';

export interface OrganizerRegisterData {
  // Étape 1 - Infos personnelles
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;

  // Étape 2 - Infos entreprise
  organizationName?: string;
  organizationType?: string;
  website?: string;
  description?: string;
  address?: string;
  city?: string;
}

@Component({
  selector: 'app-organizer-register',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './organizer-register.html',
  styleUrl: './organizer-register.css',
})
export class OrganizerRegister implements OnDestroy{
  private fb=inject(FormBuilder)
  private router=inject(Router)
  private authService=inject(OrganizerAuthService)
  private cdr=inject(ChangeDetectorRef);

  currentStep: 1 | 2  = 1;
  step1Form: FormGroup;
  step2Form: FormGroup;

  isLoading=false;
  errorMessage='';
  successMessage='';

  private registerSubscription: Subscription | null = null;

  constructor() {
    this.step1Form=this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s]{7,15}$/)]],
      indicatif: ['+228', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    },{
      validators: this.passwordMatchValidator
    });

    this.step2Form=this.fb.group({
      organisationName: ['', [Validators.minLength(2)]],
      organisationType: [''],
      website: ['',[Validators.pattern(/^(https?:\/\/)?([\w\-])+\.{1}([a-zA-Z]{2,63})([\/\w\-\.\?=%&=]*)?$/)]],
      description: ['', [Validators.maxLength(500)]],
      address: [''],
      city: ['']
    })
  }

  ngOnDestroy(): void {
    this.registerSubscription?.unsubscribe();
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password=control.get('password');
    const confirmPassword=control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value===confirmPassword.value?null: {mismatch: true};
  }

  nextStep(): void {
    if (this.step1Form.valid) {
      this.currentStep = 2;
      this.errorMessage = '';
      this.cdr.detectChanges();
      window.scrollTo(0, 0);
    }else {
      this.markFormGroupTouched(this.step1Form);
      this.errorMessage='Veuillez remplir correctement le formulaire.';
      this.cdr.detectChanges();
    }
  }

  previousStep(): void {
    this.currentStep = 1;
    this.errorMessage = '';
    this.cdr.detectChanges();
    window.scrollTo(0, 0);
  }

  onSubmit(): void{
    if (!this.step2Form.valid || !this.step2Form.valid) {
      this.markFormGroupTouched(this.step2Form);
      this.errorMessage='Veuillez remplir correctement le formulaire.';
      this.cdr.detectChanges();
      return;
    }
    this.isLoading=true;
    this.errorMessage='';
    this.successMessage='';
    this.cdr.detectChanges()

    const fullPhone= `${this.step1Form.value.indicatif}${this.step1Form.value.phone}`;

    const registerData={
      firstName: this.step1Form.value.firstName,
      lastName: this.step1Form.value.lastName,
      phone: fullPhone,
      email: this.step1Form.value.email,
      password: this.step1Form.value.password,
      role: 'ADMIN_EVENT',
      country: 'TOGO'
    }

    this.registerSubscription=this.authService.registerOrganizer(registerData).subscribe({
      next: (response) => {
        this.isLoading=false;
        if (response.email) {
          this.successMessage='Inscription réussie ! Redirection....';
          this.cdr.detectChanges();
          setTimeout(() => {
            this.router.navigate(['/organizer/login']);
          },1500);
        }else {
          this.errorMessage= 'Erreur lors de l\'inscription. Veuillez réessayer.';
          this.cdr.detectChanges();
        }
      },
      error: (error)=>{
        this.isLoading=false;
        console.error('Erreur lors de l\'inscription de l\'organisateur:', error);
        if (error.status===409) {
          this.errorMessage='Cet email est déjà utilisé.';
        }else if (error.status===400) {
          this.errorMessage='Données invalides. Veuillez vérifier vos informations.';
        }else {
          this.errorMessage='Une erreur est survenue. Veuillez réessayer.';
        }
        this.cdr.detectChanges();
      }

    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  hasError(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);

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
      if (fieldName === 'phone') {
        return 'Format invalide (8 chiffres attendus)';
      }
      if (fieldName === 'website') {
        return 'URL invalide';
      }
    }
    if (field?.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength'].requiredLength;
      return `Maximum ${maxLength} caractères`;
    }

    return '';
  }

  get passwordsMatch(): boolean {
    const password = this.step1Form.get('password')?.value;
    const confirmPassword = this.step1Form.get('confirmPassword')?.value;
    return password === confirmPassword;
  }

  get showPasswordMismatch(): boolean {
    const confirmPassword = this.step1Form.get('confirmPassword');
    return !!(confirmPassword?.touched && !this.passwordsMatch && confirmPassword?.value);
  }



}
