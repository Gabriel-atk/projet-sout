import { Component } from '@angular/core';
import {Header} from '../../pages/user/header/header';
import {RouterOutlet} from '@angular/router';
import {Footer} from '../../pages/user/footer/footer';

@Component({
  selector: 'app-main-layout',
  imports: [
    Header,
    RouterOutlet,
    Footer
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {

}
