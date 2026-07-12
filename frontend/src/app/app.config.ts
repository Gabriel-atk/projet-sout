import {
  APP_INITIALIZER,
  ApplicationConfig, inject, provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {LoginService} from './services/login.service';
import {provideClientHydration, withEventReplay} from '@angular/platform-browser';
import {organizerAuthInterceptor} from './interceptors/organizer-auth.interceptor';
import {userAuthInterceptor} from './interceptors/user-auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideAppInitializer(()=>inject(LoginService).checkCurrentUser()),
    provideHttpClient(withInterceptors([organizerAuthInterceptor, userAuthInterceptor])),
    //provideClientHydration(withEventReplay())
  ]
};
