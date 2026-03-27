import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonButtons, IonMenuButton,
  IonTitle, IonContent, IonIcon,
  AlertController, ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  accessibilityOutline, helpCircleOutline, lockClosedOutline,
  cardOutline, notificationsOutline, documentTextOutline,
  logOutOutline, chevronForwardOutline, exitOutline, chevronDownOutline,
} from 'ionicons/icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { AcessibilidadeModalComponent } from './acessibilidade-modal';
import { NotificacoesModalComponent } from './notificacoes-modal';
import { PasswordModalComponent } from './password-modal';
import { CartoesModalComponent } from './cartoes-modal';
import { SuporteModalComponent } from './suporte-modal';
import { TermosModalComponent } from './termos-modal';
import { firstValueFrom } from 'rxjs';

export interface OpcaoDefinicao {
  id: string;
  labelKey: string;
  descKey?: string;
  icone: string;
  danger?: boolean;
}

@Component({
  selector: 'app-definicoes',
  templateUrl: './definicoes.page.html',
  styleUrls: ['./definicoes.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonIcon,
    AcessibilidadeModalComponent,
    NotificacoesModalComponent,
    PasswordModalComponent,
    CartoesModalComponent,
    SuporteModalComponent,
    TermosModalComponent,
  ],
})
export class DefinicoesPage {

  opcaoAberta: string | null = null;

  opcoes: OpcaoDefinicao[] = [
    { id: 'acessibilidade', labelKey: 'DEFINICOES.ACESSIBILIDADE', icone: 'accessibility-outline' },
    { id: 'notificacoes', labelKey: 'DEFINICOES.NOTIFICACOES', icone: 'notifications-outline' },
    { id: 'password', labelKey: 'DEFINICOES.PASSWORD', icone: 'lock-closed-outline' },
    { id: 'cartoes', labelKey: 'DEFINICOES.CARTOES', icone: 'card-outline' },
    { id: 'suporte', labelKey: 'DEFINICOES.SUPORTE', icone: 'help-circle-outline' },
    { id: 'termos', labelKey: 'DEFINICOES.TERMOS', icone: 'document-text-outline' },
    { id: 'logout', labelKey: 'MENU.LOGOUT', icone: 'exit-outline', danger: true },
  ];

  cinzentos: string[] = ['#616161', '#565656', '#4a4a4a', '#3e3e3e', '#323232', '#262626'];

  private readonly DROPDOWNS = [
    'acessibilidade', 'notificacoes', 'password', 'cartoes', 'suporte', 'termos'
  ];

  constructor(
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private auth: AuthService,
    private translate: TranslateService,
  ) {
    addIcons({
      accessibilityOutline, helpCircleOutline, lockClosedOutline,
      cardOutline, notificationsOutline, documentTextOutline,
      logOutOutline, chevronForwardOutline, exitOutline, chevronDownOutline,
    });
  }

  getCinzento(index: number): string {
    return this.cinzentos[Math.min(index, this.cinzentos.length - 1)];
  }

  async clicar(opcao: OpcaoDefinicao) {
    if (this.DROPDOWNS.includes(opcao.id)) {
      this.opcaoAberta = this.opcaoAberta === opcao.id ? null : opcao.id;
      return;
    }

    switch (opcao.id) {
      case 'logout':
        await this.fazerLogout();
        break;
    }
  }

  private async fazerLogout() {
    const header = await firstValueFrom(this.translate.get('MENU.LOGOUT'));
    const msg = await firstValueFrom(this.translate.get('NOTIFICACOES.ELIMINAR_MSG'));

    const alert = await this.alertCtrl.create({
      header,
      message: msg,
      buttons: [
        { text: this.translate.instant('COMUM.CANCELAR'), role: 'cancel' },
        {
          text: this.translate.instant('MENU.LOGOUT'),
          role: 'destructive',
          handler: () => this.auth.logout(),
        },
      ],
    });
    await alert.present();
  }

  private async showToast(msg: string, color = 'medium') {
    const t = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      position: 'bottom',
      color,
    });
    await t.present();
  }
}