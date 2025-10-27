import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Header} from './layout/components/header/header';
import {Banner} from './layout/components/banner/banner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Banner],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
