import { Component, Input } from '@angular/core';

export interface EventModel {
  id: string;
  name: string;
  description: string;
  location: string;
  capacity: number;
  price: number;
  imageUrl: string;
  venue?: string;
  startDateTime: string;
  endDateTime?: string;
  organizer: string;
  expired?: boolean;

}
@Component({
  selector: 'app-event',
  imports: [],
  templateUrl: './event.html',
  styleUrl: './event.css',
})
export class Event {
  @Input() event!: EventModel;

  onReserve(){

  }
}
