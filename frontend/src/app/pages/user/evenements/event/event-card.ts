import {Component, inject, Input} from '@angular/core';
import {formatDate, CommonModule} from '@angular/common';
import {Router} from '@angular/router';

export interface EventUserSide {

  startDateTime: string;
  endDateTime: string;
  images?: string[];
  uuid: string;
  name: string;
  description: string;
  capacity: number;
  organizerId: string;
  organizerName: string;
  organizerEmail: string;
  //location: string;


}



@Component({
  selector: 'app-event',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-card.html',
  styleUrl: './event-card.css',
})
export class EventCard {
  @Input() event!: EventUserSide;
  private router=inject(Router)
  onReserve(){
    if (this.isExpired()){
      alert('Cet événement est expiré et ne peut plus être réservé.');
      return;
    }
    this.router.navigate(['/purchase-ticket', this.event.uuid]);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('fr-FR', options);
  }

  isExpired(): boolean {
    if (!this.event.endDateTime) {
      return new Date(this.event.startDateTime) < new Date();
    }
    return new Date(this.event.endDateTime) < new Date();
  }

  showDetails() {
    this.router.navigate(['/event-detail', this.event.uuid]);
  }
}
