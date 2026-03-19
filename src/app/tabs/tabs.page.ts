// src/app/tabs/tabs.page.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline, calendarOutline, personOutline, notificationsOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  standalone: true,
  imports: [
    RouterModule,
    IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel,
  ],
})
export class TabsPage {
  constructor() {
    addIcons({ homeOutline, calendarOutline, personOutline, notificationsOutline });
  }
}