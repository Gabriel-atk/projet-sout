import {Component, inject, OnInit} from '@angular/core';
import {OrganizerDashboardService} from '../../../services/organizer.dashboard.service';
import {EventModel} from '../../models/event.model';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {NgIf} from '@angular/common';
export interface EventToCreate{
  uuid: string;
  name: string;
  description: string;
  capacity: number;
  startDateTime: string;
  endDateTime: string;
  images: string[];
}
@Component({
  selector: 'app-organizer-dashboard',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './organizer-dashboard.html',
  styleUrl: './organizer-dashboard.css',
})
export class OrganizerDashboard implements OnInit {
  private organizerService=inject(OrganizerDashboardService)
  private fb = inject(FormBuilder);
  private router = inject(Router);

  sidebarOpen = true;

  events: EventModel[] = [];
  loading = false;
  error: string | null = null;

  // État pour le formulaire de création
  showCreateForm = false;
  createEventForm!: FormGroup;
  submitting = false;
  createError: string | null = null;
  createSuccess = false;


  // Pour la gestion des images
  selectedImages: string[] = [];

  stats = {
    totalEvents: 0,
    publishedEvents: 0,
    totalTicketsSold: 0,
    totalRevenue: 0
  };

  ngOnInit(): void {
    this.loadOrganizerEvents()
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }


  loadOrganizerEvents() {
    this.loading = true;
    this.error = null;

    this.organizerService.getOrganizerEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.loading = false;
        this.calculateStats();
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des événements';
        this.loading = false;
        console.error(err);
      }
    });
  }

  calculateStats() {
    this.stats.totalEvents = this.events.length;
    this.stats.publishedEvents = this.events.length; // Tous les événements sont considérés actifs
    // Ces valeurs devraient venir du backend
    this.stats.totalTicketsSold = 0;
    this.stats.totalRevenue = 0;
  }

  /**
   * Initialise le formulaire de création d'événement
   */
  initCreateForm() {
    this.createEventForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
      location: ['', [Validators.required, Validators.minLength(3)]],
      capacity: [0, [Validators.required, Validators.min(1)]],
      startDateTime: ['', Validators.required],
      endDateTime: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      status: ['DRAFT', Validators.required],
      images: [[]]
    }, {
      validators: this.dateValidator // Valide que la date de fin est après la date de début
    });
  }

  /**
   * Validateur personnalisé pour les dates
   */
  dateValidator(group: FormGroup) {
    const start = group.get('startDateTime')?.value;
    const end = group.get('endDateTime')?.value;

    if (start && end && new Date(start) >= new Date(end)) {
      return { dateInvalid: true };
    }
    return null;
  }

  /**
   * Gère l'ajout d'images (URLs)
   */
  addImage(imageUrl: string) {
    if (imageUrl && imageUrl.trim()) {
      this.selectedImages.push(imageUrl.trim());
      this.createEventForm.patchValue({ images: this.selectedImages });
    } else {
      this.createError = 'URL d\'image invalide';
      setTimeout(() => this.createError = null, 3000);
    }
  }

  removeImage(index: number) {
    this.selectedImages.splice(index, 1);
    this.createEventForm.patchValue({ images: this.selectedImages });
  }

  /**
   * Gère l'upload de fichiers images (optionnel)
   */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validation du type de fichier
      if (!file.type.startsWith('image/')) {
        this.createError = 'Veuillez sélectionner une image valide';
        return;
      }

      // Validation de la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.createError = 'L\'image ne doit pas dépasser 5MB';
        return;
      }

      // Convertir en base64 ou uploader sur un serveur
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.addImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Crée un nouvel événement
   */
  createEvent() {
    // Réinitialiser les messages
    this.createError = null;
    this.createSuccess = false;

    // Validation du formulaire
    if (this.createEventForm.invalid) {
      this.createError = 'Veuillez remplir tous les champs obligatoires correctement';
      this.markFormGroupTouched(this.createEventForm);
      return;
    }

    // Validation de la date
    if (this.createEventForm.errors?.['dateInvalid']) {
      this.createError = 'La date de fin doit être après la date de début';
      return;
    }

    this.submitting = true;
    const eventData = this.createEventForm.value;

    // Formater les dates si nécessaire
    const formattedData = {
      ...eventData,
      startDateTime: new Date(eventData.startDateTime).toISOString(),
      endDateTime: new Date(eventData.endDateTime).toISOString(),
      images: this.selectedImages
    };

    this.organizerService.createEvent(formattedData).subscribe({
      next: (createdEvent) => {
        this.submitting = false;

        if (createdEvent) {
          this.createSuccess = true;
          this.createError = null;

          // Ajouter le nouvel événement à la liste
          this.events.unshift(createdEvent);

          // Réinitialiser le formulaire après 2 secondes
          setTimeout(() => {
            this.showCreateForm = false;
            this.resetCreateForm();
          }, 2000);

          console.log('Événement créé avec succès:', createdEvent);
        }
      },
      error: (err) => {
        this.submitting = false;
        console.error('Erreur lors de la création:', err);

        // Gestion des erreurs spécifiques
        if (err.status === 400) {
          this.createError = 'Données invalides. Veuillez vérifier les informations saisies.';
        } else if (err.status === 401) {
          this.createError = 'Session expirée. Veuillez vous reconnecter.';
          setTimeout(() => this.router.navigate(['/organizer/auth']), 2000);
        } else if (err.status === 403) {
          this.createError = 'Vous n\'avez pas les droits pour créer un événement.';
        } else if (err.error?.message) {
          this.createError = err.error.message;
        } else {
          this.createError = 'Erreur lors de la création de l\'événement. Veuillez réessayer.';
        }
      }
    });
  }


  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.resetCreateForm();
    }
  }

  /**
   * Réinitialise le formulaire de création
   */
  resetCreateForm() {
    this.createEventForm.reset({
      status: 'DRAFT',
      price: 0,
      capacity: 0
    });
    this.selectedImages = [];
    this.createError = null;
    this.createSuccess = false;
    this.submitting = false;
  }

  /**
   * Marque tous les champs du formulaire comme touchés (pour afficher les erreurs)
   */
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Vérifie si un champ a une erreur et a été touché
   */
  hasError(fieldName: string): boolean {
    const field = this.createEventForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Récupère le message d'erreur d'un champ
   */
  getErrorMessage(fieldName: string): string {
    const field = this.createEventForm.get(fieldName);

    if (field?.hasError('required')) {
      return 'Ce champ est obligatoire';
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Minimum ${minLength} caractères requis`;
    }
    if (field?.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength'].requiredLength;
      return `Maximum ${maxLength} caractères autorisés`;
    }
    if (field?.hasError('min')) {
      const min = field.errors?.['min'].min;
      return `La valeur minimum est ${min}`;
    }

    return '';
  }

  logout() {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
      localStorage.removeItem('token');
      this.router.navigate(['/organizer/auth']);
    }
  }


}
