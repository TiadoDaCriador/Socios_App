// src/app/tabs/tabs.page.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline, calendarOutline, personOutline, notificationsOutline,
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { NotificacoesService } from '../pages/notificacoes/notificacoes.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge,
  ],
})
export class TabsPage implements OnInit, OnDestroy {

  totalNaoLidas = 0;
  private sub!: Subscription;

  constructor(private notifService: NotificacoesService) {
    addIcons({ homeOutline, calendarOutline, personOutline, notificationsOutline });
  }

  ngOnInit() {
    this.sub = this.notifService.notificacoes$.subscribe(lista => {
      this.totalNaoLidas = lista.filter(n => !n.lida).length;
    });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }
}