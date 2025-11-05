import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { OrganizerLayout } from './layout/organizer-layout/organizer-layout';
import { Evenements } from './pages/user/evenements/evenements/evenements';
import { authGuard } from './pages/user/auth/auth.guard';

export const routes: Routes = [
  // Routes avec le header principal (MainLayout)
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/user/home/home').then(m => m.Home),
        title: 'Accueil - EventTicket'
      },
      {
        path: 'events',
        component: Evenements,
        title: 'Événements - EventTicket'
      },
      {
        path: 'inscription',
        loadComponent: () => import('./pages/user/auth/register/register.component').then(m => m.Register),
        title: 'Inscription - EventTicket'
      },
      {
        path: 'login',
        loadComponent: () => import('./pages/user/auth/login/login').then(m => m.Login),
        title: 'Connexion - EventTicket'
      },
      {
        path: 'reservations',
        loadComponent: () => import('./pages/user/reservation/reservation').then(m => m.Reservation),
        title: 'Mes Réservations - EventTicket',
        canActivate: [authGuard]
      }
    ]
  },

  // Routes pour l'espace organisateur (sans le header principal)
  {
    path: 'organizer',
    component: OrganizerLayout,
    children: [
      {
        path: 'auth',
        loadComponent: () => import('./pages/organizer/organizer-auth/organizer-auth').then(m => m.OrganizerAuth),
        title: 'Connexion Organisateur - EventTicket'
      },
      {
        path: 'dashboard',
        //loadComponent: () => import('./pages/organizer/dashboard/dashboard').then(m => m.OrganizerDashboard),
        title: 'Dashboard Organisateur - EventTicket',
        canActivate: [authGuard] // Utilisez un guard spécifique pour les organisateurs si nécessaire
      },
      {
        path: '',
        redirectTo: 'auth',
        pathMatch: 'full'
      }
    ]
  },

  // Redirection pour les routes non trouvées
  {
    path: '**',
    redirectTo: ''
  }
];
