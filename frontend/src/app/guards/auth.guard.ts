import {inject} from '@angular/core';
import {Router, CanActivateFn} from '@angular/router';
import {LoginService} from '../services/login.service';

export const authGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  if (loginService.isLoggedIn()) {
    return true;
  } else {
    // Rediriger vers la page de connexion
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
};
