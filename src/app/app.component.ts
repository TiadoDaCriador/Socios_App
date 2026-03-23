import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import {
  IonApp, IonSplitPane, IonMenu, IonContent, IonList,
  IonMenuToggle, IonItem, IonIcon, IonLabel,
  IonRouterOutlet, IonRouterLink
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  person, calendar, calendarClear, card, mail, wallet,
  settings, homeOutline, calendarOutline, personOutline,
  menuOutline, logOutOutline, documentOutline,
} from 'ionicons/icons';

import { MenuController } from '@ionic/angular';
import { AuthService } from './services/auth.service';
import { LembretesService } from './services/lembretes.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterLink, TranslateModule,
    IonApp, IonSplitPane, IonMenu, IonContent, IonList,
    IonMenuToggle, IonItem, IonIcon, IonLabel,
    IonRouterLink, IonRouterOutlet
  ]
})
export class AppComponent {

  isLoggedIn = false;

  public appPages = [
    { title: 'MENU.PERFIL',         url: '/tabs/perfil',         icon: 'person'           },
    { title: 'MENU.EVENTOS',        url: '/tabs/eventos',        icon: 'calendar'         },
    { title: 'MENU.CALENDARIO',     url: '/tabs/calendario',     icon: 'calendar-clear'   },
    { title: 'MENU.CONTA_CORRENTE', url: '/tabs/conta-corrente', icon: 'card'             },
    { title: 'MENU.CONVOCATORIAS',  url: '/tabs/convocatorias',  icon: 'mail'             },
    { title: 'MENU.QUOTAS',         url: '/tabs/quotas',         icon: 'wallet'           },
    { title: 'MENU.DEFINICOES',     url: '/tabs/definicoes',     icon: 'settings'         },
    { title: 'MENU.DOCUMENTOS',     url: '/tabs/documentos',     icon: 'document-outline' },
  ];

  constructor(
    private auth:             AuthService,
    private menu:             MenuController,
    private router:           Router,
    private lembretesService: LembretesService,
    private translate:        TranslateService,
    private cdr:              ChangeDetectorRef,
  ) {
    addIcons({
      person, calendar, calendarClear, card, mail, wallet,
      settings, homeOutline, calendarOutline, personOutline,
      menuOutline, logOutOutline, documentOutline,
    });

    this.translate.addLangs(['pt', 'en', 'es']);
    this.translate.setDefaultLang('pt');
    const idiomaGuardado = localStorage.getItem('idioma') ?? 'pt';
    this.translate.use(idiomaGuardado);

    // ✅ Força atualização do componente quando o idioma muda
    this.translate.onLangChange.subscribe(() => {
      this.cdr.detectChanges();
    });

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      this.isLoggedIn = this.auth.isLoggedIn();
    });

    this.restaurarAcessibilidade();
  }

  private restaurarAcessibilidade() {
    const root = document.documentElement;

    if (localStorage.getItem('modoEscuro') === 'true') {
      root.classList.add('dark');
      document.body.classList.add('dark');
    }

    const fontePx: Record<string, string> = {
      pequeno: '13px', normal: '16px', grande: '20px', extra: '24px',
    };
    const tamanhoFonte = localStorage.getItem('tamanhoFonte');
    if (tamanhoFonte && fontePx[tamanhoFonte]) {
      root.style.fontSize = fontePx[tamanhoFonte];
      root.style.setProperty('--app-font-size', fontePx[tamanhoFonte]);
    }
  }

  openMenu() { this.menu.open(); }

  async logout() {
    await this.menu.close();
    this.lembretesService.parar();
    this.auth.logout();
  }
}