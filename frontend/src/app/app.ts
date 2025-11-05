import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Header} from './pages/user/header/header';
import {Login} from './pages/user/auth/login/login';
import {Register} from './pages/user/auth/register/register.component';
import {Evenements} from './pages/user/evenements/evenements/evenements';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Login, Register, Evenements],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
