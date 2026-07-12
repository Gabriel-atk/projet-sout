import {ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {OrganizerDashboardService} from '../../../../services/organizer.dashboard.service';
import {Router} from '@angular/router';
import {MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-create-event-form',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './create-event-form.html',
  styleUrl: './create-event-form.css',
})
export class CreateEventForm implements OnInit {
  private fb=inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateEventForm>);
  private dashbordService=inject(OrganizerDashboardService)
  private router=inject(Router)
  private cdr = inject(ChangeDetectorRef)
  private snackBar=inject(MatSnackBar)

  createEventForm!:FormGroup;
  submitting=false;
  //createError:string | null =null
  //createSuccess=false;
  selectedImages: string[]=[];

    ngOnInit(): void {
      this.initializeForm();
    }

  private toast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.snackBar.open(message, 'OK', {
      duration: 2500,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [`toast-${type}`],
    });
  }
  initializeForm(){
      this.createEventForm=this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
        description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
        capacity: [0, [Validators.required, Validators.min(1)]],
        localization: ['', [Validators.required]],
        startDateTime: ['', Validators.required],
        endDateTime: ['', Validators.required]
      },{
        validators: this.dateValidator
      })
  }

  dateValidator(group: FormGroup) {
    const start = group.get('startDateTime')?.value;
    const end = group.get('endDateTime')?.value;
    if (start && end && new Date(start) >= new Date(end)) {
      return {dateInvalid: true};
    }
    return null;
  }

  addImage(imageUrl: string) {
    if (imageUrl && imageUrl.trim()) this.selectedImages.push(imageUrl.trim());
    else this.toast("URL d'image invalide.", 'error');
  }

    removeImage(index:number){
      this.selectedImages.splice(index,1);
    }

    onFileSelected(event: Event){
      const input=event.target as HTMLInputElement;
      if (input.files && input.files.length > 0){
        const file=input.files[0];
        if (!file.type.startsWith('image/')){
          //this.createError='Veuillez sélectionner un fichier image valide.';
          this.toast('Veuillez sélectionner un fichier image valide.', 'error');
          return;
        }
        if (file.size> 5 * 1024 * 1024){
          //this.createError='L\'image ne doit pas dépasser 5MB.';
          this.toast('L’image ne doit pas dépasser 5MB.', 'error');
          return;
        }
        const reader=new FileReader();
        reader.onload=(e: ProgressEvent<FileReader>)=>{
          if (e.target?.result){
            this.addImage(e.target.result as string);
          }
        }
        reader.readAsDataURL(file);
      }
    }

    createEvent(){
      console.log('=== DÉBUT CRÉATION ÉVÉNEMENT ===');

      /*this.createError=null
      this.createSuccess=false
      this.cdr.detectChanges()*/

      if (this.createEventForm.invalid){
        //console.log('Formulaire invalide:', this.createEventForm.errors);
        //this.createError='Veuillez remplir correctement le formulaire.';
        this.markFormGroupTouched(this.createEventForm);
        //this.cdr.detectChanges();
        this.toast('Veuillez remplir correctement le formulaire.', 'error');
        return;
      }
      if (this.createEventForm.errors?.['dateInvalid']){
        this.toast(
          'La date/heure de fin doit être postérieure à la date/heure de début.',
          'error'
        );
        return;
      }
      this.submitting=true;
      this.cdr.detectChanges();

      const formData=this.createEventForm.value;
      const eventData ={
        name: formData.name as string,
        description: formData.description as string,
        capacity: formData.capacity as number,
        localization: formData.localization as string,
        startDateTime: formData.startDateTime as string,
        endDateTime: formData.endDateTime as string,
        images: this.selectedImages
      }
      console.log('Données à envoyer:', eventData);

      this.dashbordService.createEvent(eventData).subscribe({
        next: (res)=>{
          console.log('Réponse createEvent status:', res.status);
          console.log('Réponse createEvent body:', res.body);
          this.submitting=false;
          this.cdr.detectChanges();
          if (res.status === 200 || res.status === 201 || res.status === 204) {
            // Succès même si body vide
            this.toast('Événement créé avec succès \!', 'success');
            setTimeout(() => this.dialogRef.close(true), 300);
            return;
          }

          this.toast('Échec de la création \: réponse inattendue.', 'error');
        },
        error:(err)=>{
          console.error('=== ERREUR CRÉATION ===', err);
          this.submitting=false;

          if (err?.status===400){
            this.toast('Données invalides. Veuillez vérifier le formulaire.', 'error');
          }else if(err?.status===401){
            this.toast('Session expirée. Reconnexion nécessaire.', 'error');
            setTimeout(()=> {
              this.dialogRef.close();
              this.router.navigate(['/organizer/login']);
            },800);
          }else {
            this.toast(err?.error?.message || 'Erreur serveur. Veuillez réessayer plus tard.', 'error');
          }
          this.cdr.detectChanges();
        }
      })
    }

    closeDialog(){
      this.dialogRef.close();
    }

    markFormGroupTouched(formGroup:FormGroup){
      Object.keys(formGroup.controls).forEach(key=>{
        const control=formGroup.get(key);
        control?.markAsTouched();
        if (control instanceof FormGroup){
          this.markFormGroupTouched(control);
        }
      })
    }

    hasError(fieldName:string): boolean{
      const field=this.createEventForm.get(fieldName);
      return !!(field && field.invalid && field.touched);
    }

    getErrorMessage(fieldName:string): string {
      const field=this.createEventForm.get(fieldName);
      if (field?.hasError('required')) return 'Ce champ est requis.';
      if (field?.hasError('minlength')) return `Longueur minimale de ${field.errors?.['minlength'].requiredLength} caractères.`;
      if (field?.hasError('maxlength')) return `Longueur maximale de ${field.errors?.['maxlength'].requiredLength} caractères.`;
      if (field?.hasError('min')) return `La valeur doit être au moins ${field.errors?.['min'].min}.`;
      return '';
    }


}
