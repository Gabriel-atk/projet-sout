import {Component, inject, OnInit} from '@angular/core';
import {OrganizerDashboardService} from '../../../services/organizer.dashboard.service';
import {EventOrganizerSide} from '../../models/eventOrganizerSide';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {NgIf} from '@angular/common';
import {OrganizerAuthService} from '../../../services/organizer.auth.service';
import {CreateEventForm} from './create-event-form/create-event-form';
import {MatDialog} from '@angular/material/dialog';
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
  ngOnInit(): void {

  }

  private organizerAuthService=inject(OrganizerAuthService)
  private dashboardService = inject(OrganizerDashboardService);
  protected router = inject(Router);
  private dialog=inject(MatDialog);

  sidebarOpen = true;
  events: EventOrganizerSide[] = [];

  loadEvents(){
    this.dashboardService.getOrganizerEvents().subscribe({
      next: (events) => this.events = events,
      error: (err) => console.error('Erreur chargement événements:', err)
    });
  }


  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  openCreateEventDialog() {
    const dialogRef=this.dialog.open(CreateEventForm, {
      width: '800px',
      maxWidth: '95vw',
      disableClose: false,
      panelClass: 'custom-dialog-container'
    })
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Événement créé:', result);
        this.loadEvents()
      }
    })
  }




  getCurrentOrganizerEmail(): string | null {
    return this.organizerAuthService.getCurrentOrganizerEmail();
  }

  getCurrentOrganizerFullName(): string | null{
    return this.organizerAuthService.getOrganizerFullName();
  }




  logout() {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
      localStorage.removeItem('organizerToken');
      localStorage.removeItem('organizerFullName');
      localStorage.removeItem('organizerEmail');
      localStorage.removeItem('organizerTrackingId');
      localStorage.removeItem('OrganizerId');
      this.router.navigate(['/organizer/login']);
    }
  }
}
