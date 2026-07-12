import {Component, computed, inject} from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {LoginService} from '../../../services/login.service';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
    private loginService = inject(LoginService);
    private router = inject(Router);

    user=this.loginService.user;

    isLoggedIn=computed(() => this.user() !==null && this.user !== undefined);

    isProfileMenuOpen=false;

  getUserInitials(): string {
    const currentUser = this.user();
    if (!currentUser) return '';

    const firstName = currentUser.email || '';
    const lastName = currentUser.email || '';

    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  toggleProfileMenu(){
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  logout(){
    this.loginService.logout();
    this.isProfileMenuOpen = false;
    this.router.navigate(['/']);
  }

  closeProfileMenu(){
    this.isProfileMenuOpen = false;
  }
}
