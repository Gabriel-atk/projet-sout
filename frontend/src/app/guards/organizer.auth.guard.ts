import {inject} from '@angular/core';
import {OrganizerAuthService} from '../services/organizer.auth.service';
import {Router} from '@angular/router';

export const organizerAuthGuard=()=>{
  const organizerAuthService=inject(OrganizerAuthService);
  const router=inject(Router);

  if (organizerAuthService.isLoggedIn()){
    return true;
  }

  router.navigate(['/organizer/login']);
  return false;
}
