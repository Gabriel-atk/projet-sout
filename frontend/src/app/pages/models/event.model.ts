export interface EventModel {
  uuid: string;
  name: string;
  description: string;
  location: string;
  capacity: number;
  imageUrl: string[];
  venue?: string;
  startDateTime: string;
  endDateTime?: string;
  organizerId: string;
  expired?: boolean;

}

// Interface pour les requêtes de création/modification d'événements
export interface EventRequest {
  name: string;
  description: string;
  capacity: number;
  startDateTime: string; // ISO format for backend
  endDateTime: string; // ISO format for backend
  images?: string[];
  organizerId: string;
}

// Interface pour la création d'événements avec fichiers
export interface CreateEventFormData {
  name: string;
  description: string;
  capacity: number;
  startDateTime: string;
  endDateTime: string;
  organizerId: string;
  images?: File[];
}
