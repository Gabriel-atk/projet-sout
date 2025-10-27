import { Routes } from '@angular/router';
import {Signin} from './layout/components/register/signin';
import {Login} from './layout/components/login/login';

export const routes: Routes = [
  { path: 'inscription', component: Signin },
  { path: 'login', component: Login },
];
