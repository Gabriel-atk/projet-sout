import {ChangeDetectorRef, Component, inject} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router, RouterLink} from "@angular/router";
import {OrganizerAuthService} from '../../../services/organizer.auth.service';

@Component({
  selector: 'app-organizer-login',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterLink
    ],
  templateUrl: './organizer-login.html',
  styleUrl: './organizer-login.css',
})
export class OrganizerLogin {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(OrganizerAuthService);
  private cdr=inject(ChangeDetectorRef);

  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit():void {
    if (!this.loginForm.valid){
      this.loginForm.markAllAsTouched();
      this.errorMessage = 'Remplissez correctement le formulaire.';
      this.cdr.detectChanges()
      return;
    }

    const {email, password} = this.loginForm.value;
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.authService.loginOrganizer(email, password).subscribe({
      next: (response)=>{
        this.isLoading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/organizer/dashboard']);
      },
      error: (err)=>{
        this.isLoading = false;
        console.error('Erreur dans le composant:', err);
        if (err.status === 401){
          this.errorMessage = 'Email ou mot de passe incorrect.';
        }else {
          this.errorMessage = 'erreur serveur. Veuillez réessayer.';
        }
        this.cdr.detectChanges();
      }
    })
  }

  hasError(field: string):boolean{
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }


}
