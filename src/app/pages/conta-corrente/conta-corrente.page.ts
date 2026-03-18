import { Component } from '@angular/core';
import {
  IonHeader, IonToolbar, IonButtons, IonMenuButton,
  IonTitle, IonContent
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-conta-corrente',
  templateUrl: './conta-corrente.page.html',
  styleUrls: ['./conta-corrente.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonButtons, IonMenuButton,
    IonTitle, IonContent
  ]
})
export class ContaCorrentePage {}