import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { 
  IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel 
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  standalone: true,
  imports: [
    RouterModule,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel
  ]
})
export class TabsPage {}