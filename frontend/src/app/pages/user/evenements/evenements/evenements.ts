import { Component } from '@angular/core';
import {Event, EventModel} from '../event/event';

@Component({
  selector: 'app-evenements',
  imports: [
    Event
  ],
  templateUrl: './evenements.html',
  styleUrl: './evenements.css',
})
export class Evenements {

  events: EventModel[]=[
    {
      id: '1',
      name: 'Festival des Divinités Noires',
      description: '',
      imageUrl: 'https://picsum.photos/400/300?random=1',
      startDateTime: '12 Janvier 2025',
      capacity: 45,
      price: 500,
      location: 'Togo',
      expired: false,
      organizer: 'UL'

    },

    {
      id: '1',
      name: 'Festival des Divinités Noires',
      description: '',
      imageUrl: 'https://picsum.photos/400/300?random=1',
      startDateTime: '12 Janvier 2025',
      capacity: 45,
      price: 500,
      location: 'Togo',
      expired: true,
      organizer: 'UL'


    }
  ];

}
