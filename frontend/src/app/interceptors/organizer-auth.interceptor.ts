import {HttpContextToken, HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {catchError, throwError} from 'rxjs';

// Création d'un token de contexte pour ignorer la redirection sur certaines requêtes
export const SKIP_AUTH_REDIRECT = new HttpContextToken<boolean>(() => false);

export const organizerAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('organizerToken');

  // 1. Détection plus robuste du contexte Organisateur
  // On vérifie si on est sur une page organisateur OU si on tape sur l'API organisateur
  const isOrganizerPage = router.url.startsWith('/organizer');
  const isOrganizerApi = req.url.includes('/organizer/') || req.url.includes('/ticket_template/');

  // Routes publiques (Login, Register, Verify)
  const publicOrganizerRoutes = ['/organizer/login', '/organizer/register', '/organizer/verify'];
  const isPublicPage = publicOrganizerRoutes.some(route => router.url.startsWith(route));

  // 2. Injection du Token
  // Si on a un token ET (qu'on est sur une page organisateur OU qu'on appelle l'API organisateur)
  if (token && (isOrganizerPage || isOrganizerApi) && !isPublicPage) {
    // On n'ajoute le header que s'il n'est pas déjà présent
    if (!req.headers.has('Authorization')) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
  }

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // 3. Gestion intelligente de la redirection
        const shouldSkipRedirect = req.context.get(SKIP_AUTH_REDIRECT);

        // On ne redirige QUE SI :
        // - Ce n'est pas une requête "ignorable" (comme checkEventHasBilleterie)
        // - On n'est pas déjà sur une page publique
        if (!shouldSkipRedirect && !isPublicPage) {
          console.warn(`Session expirée sur la requête : ${req.url}`);
          localStorage.removeItem('organizerToken');
          localStorage.removeItem('organizerEmail');
          localStorage.removeItem('organizerId');
          localStorage.removeItem('OrganizerFullName');
          localStorage.removeItem('organizerTrackingId');
          router.navigate(['/organizer/login']);
        }
      }
      return throwError(() => error);
    })
  );
};
