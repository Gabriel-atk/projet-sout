import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {catchError, throwError} from 'rxjs';

export const userAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Vérifier si on est dans une route utilisateur (frontend)
  const isUserContext = !router.url.startsWith('/organizer');

  const publicRoutes = [
    '/events',
    '/event-detail',
    '/login',
    '/inscription',
    '/contact',
    '/'
  ];

  const isPublicRoute = publicRoutes.some(route =>
    router.url === route || router.url.startsWith(route)
  );

  if (isUserContext) {
    const token = localStorage.getItem('token');
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  }

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        if (isUserContext && !isPublicRoute) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('userTrackingId');
          router.navigate(['/login'], {
            queryParams: {returnUrl: router.url}
          })
        }
      }
      return throwError(() => error);
    })
  );
};
