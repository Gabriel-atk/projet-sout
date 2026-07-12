export interface OrganizerRegisterRequest {
  // Étape 1 - Informations personnelles (comme user)
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;

  // Étape 2 - Informations professionnelles
  companyName?: string;
  companyDescription?: string;
  website?: string;
  companyAddress?: string;
  companyPhone?: string;
  siret?: string; // Numéro SIRET ou équivalent
  businessType?: string; // Type d'activité
}

export interface OrganizerRegisterResponse {
  success: boolean;
  message: string;
  organizerId?: string;
  email?: string;
}
