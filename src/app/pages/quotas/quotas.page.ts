import { Component } from '@angular/core';
import {
  IonHeader, IonToolbar, IonButtons, IonMenuButton,
  IonTitle, IonContent
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-quotas',
  templateUrl: './quotas.page.html',
  styleUrls: ['./quotas.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonButtons, IonMenuButton,
    IonTitle, IonContent
  ]
})
export class QuotasPage {}