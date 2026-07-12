import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {OrganizerDashboardService, TicketType} from '../../../../services/organizer.dashboard.service';
import {FormsModule} from '@angular/forms';
import {EventsService} from '../../../../services/events.service';
import {EventOrganizerSide} from '../../../models/eventOrganizerSide';
import {forkJoin, Observable} from 'rxjs';


@Component({
  selector: 'app-ticket-template',
  imports: [
    FormsModule
  ],
  templateUrl: './ticket-template.html',
  styleUrl: './ticket-template.css',
})
export class TicketTemplate {
  @Input() eventTrackingId!: string;
  @Output() close=new EventEmitter<void>();
  @Output() ticketCreated=new EventEmitter<void>();

  private organizerDashboardService=inject(OrganizerDashboardService)
  loading=false;

  selectedEvent!:EventOrganizerSide

  ticketData: Record<TicketType, { price: number, quantity: number }>={
    VIP: {price: 0, quantity: 0},
    REGULAR: {price: 0, quantity: 0},
  }

  selectedTypes: Record<TicketType, boolean>={
    VIP: false,
    REGULAR: false
  }

  toogleType(type: TicketType){
    this.selectedTypes[type]=!this.selectedTypes[type];
  }

  canSubmit(): boolean{
    const chosenTypes=(Object.keys(this.selectedTypes) as TicketType[])
      .filter(t=>this.selectedTypes[t]);
    if (chosenTypes.length===0) return false;
    return chosenTypes.every(t=>{
      const d=this.ticketData[t];
      return d.price>0 && d.quantity>0;
    })
  }

  createTicket(){
    if (!this.canSubmit()) return;
    this.loading=true;

    const observables: Observable<any>[]=[];
    (['VIP', 'REGULAR'] as TicketType[]).forEach(t=>{
      if (this.selectedTypes[t]){
        const data=this.ticketData[t];
        observables.push(
          this.organizerDashboardService.createTicketTemplate({
            eventTrackingId: this.eventTrackingId,
            type: t,
            price: data.price,
            nombreTicketsDisponible: data.quantity
          })
        )
      }
    })

    if (observables.length===0){
      this.loading=false;
      return;
    }

    forkJoin(observables).subscribe({
      next: ()=>{
        this.loading=false;
        this.ticketCreated.emit();
      },
      error: (err)=>{
        console.error('Erreur lors de la création des tickets : ', err);
        this.loading=false;
      }
    })
  }

  getEventNameByTrackingId(trackingId: string): string{
    this.selectedEvent.uuid = trackingId;
    return this.selectedEvent.name;
  }

  onClose(){
    this.close.emit();
  }
}
