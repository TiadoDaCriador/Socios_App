import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  IonApp,
  IonSplitPane,
  IonMenu,
  IonContent,
  IonList,
  IonMenuToggle,
  IonItem,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonRouterLink
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  person,
  calendar,
  calendarClear,
  card,
  mail,
  wallet,
  settings,
  homeOutline,
  calendarOutline,
  personOutline,
  menuOutline,
  logOutOutline,
  documentOutline, // 👈 adicionado
} from 'ionicons/icons';

import { MenuController } from '@ionic/angular';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonApp,
    IonSplitPane,
    IonMenu,
    IonContent,
    IonList,
    IonMenuToggle,
    IonItem,
    IonIcon,
    IonLabel,
    IonRouterLink,
    IonRouterOutlet
  ]
})
export class AppComponent {

  public appPages = [
    { title: 'Perfil',          url: '/tabs/perfil',          icon: 'person'           },
    { title: 'Eventos',         url: '/tabs/eventos',         icon: 'calendar'         },
    { title: 'Calendário',      url: '/tabs/calendario',      icon: 'calendar-clear'   },
    { title: 'Conta Corrente',  url: '/tabs/conta-corrente',  icon: 'card'             },
    { title: 'Convocatórias',   url: '/tabs/convocatorias',   icon: 'mail'             },
    { title: 'Quotas',          url: '/tabs/quotas',          icon: 'wallet'           },
    { title: 'Definições',      url: '/tabs/definicoes',      icon: 'settings'         },
    { title: 'Documentos',      url: '/tabs/documentos',      icon: 'document-outline' }, // 👈 corrigido
  ];

  constructor(
    private auth: AuthService,
    private menu: MenuController,
  ) {
    addIcons({
      person,
      calendar,
      calendarClear,
      card,
      mail,
      wallet,
      settings,
      homeOutline,
      calendarOutline,
      personOutline,
      menuOutline,
      logOutOutline,
      documentOutline, // 👈 adicionado
    });
  }

  openMenu() {
    this.menu.open();
  }

  logout() {
    this.auth.logout();
  }
}