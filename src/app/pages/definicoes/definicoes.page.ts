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
  logOutOutline, chevronForwardOutline, exitOutline,
} from 'ionicons/icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { AcessibilidadeModalComponent } from './acessibilidade-modal';
import { NotificacoesModalComponent } from './notificacoes-modal';
import { CartoesModalComponent } from './cartoes-modal';
import { TermosModalComponent } from './termos-modal';
import { ModalController } from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';

export interface OpcaoDefinicao {
  id: string; labelKey: string; descKey?: string; icone: string; danger?: boolean;
}

@Component({
  selector: 'app-definicoes',
  templateUrl: './definicoes.page.html',
  styleUrls: ['./definicoes.page.scss'],
  standalone: true,
  imports: [
    CommonModule, TranslateModule,
    IonHeader, IonToolbar, IonButtons, IonMenuButton,
    IonTitle, IonContent, IonIcon,
  ],
})
export class DefinicoesPage {

  opcoes: OpcaoDefinicao[] = [
    { id: 'acessibilidade', labelKey: 'DEFINICOES.ACESSIBILIDADE', descKey: 'DEFINICOES.ACESSIBILIDADE_DESC', icone: 'accessibility-outline' },
    { id: 'suporte',        labelKey: 'DEFINICOES.SUPORTE',        descKey: 'DEFINICOES.SUPORTE_DESC',        icone: 'help-circle-outline' },
    { id: 'password',       labelKey: 'DEFINICOES.PASSWORD',       descKey: 'DEFINICOES.PASSWORD_DESC',       icone: 'lock-closed-outline' },
    { id: 'cartoes',        labelKey: 'DEFINICOES.CARTOES',        descKey: 'DEFINICOES.CARTOES_DESC',        icone: 'card-outline' },
    { id: 'notificacoes',   labelKey: 'DEFINICOES.NOTIFICACOES',   descKey: 'DEFINICOES.NOTIFICACOES_DESC',   icone: 'notifications-outline' },
    { id: 'termos',         labelKey: 'DEFINICOES.TERMOS',         descKey: 'DEFINICOES.TERMOS_DESC',         icone: 'document-text-outline' },
    { id: 'logout',         labelKey: 'MENU.LOGOUT',                                                          icone: 'exit-outline', danger: true },
  ];

  // Tons de cinzento do mais claro (topo) para o mais escuro (baixo)
  cinzentos: string[] = ['#616161', '#565656', '#4a4a4a', '#3e3e3e', '#323232', '#262626'];

  constructor(
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private auth: AuthService,
    private translate: TranslateService,
  ) {
    addIcons({
      accessibilityOutline, helpCircleOutline, lockClosedOutline,
      cardOutline, notificationsOutline, documentTextOutline,
      logOutOutline, chevronForwardOutline, exitOutline,
    });
  }

  getCinzento(index: number): string {
    return this.cinzentos[Math.min(index, this.cinzentos.length - 1)];
  }

  async clicar(opcao: OpcaoDefinicao) {
    switch (opcao.id) {
      case 'acessibilidade': await this.abrirModal(AcessibilidadeModalComponent); break;
      case 'suporte':        window.open('mailto:suporte@associacao.pt?subject=Suporte App Sócios', '_blank'); break;
      case 'password':       await this.alterarPassword(); break;
      case 'cartoes':        await this.abrirModal(CartoesModalComponent); break;
      case 'notificacoes':   await this.abrirModal(NotificacoesModalComponent); break;
      case 'termos':         await this.abrirModal(TermosModalComponent); break;
      case 'logout':         await this.confirmarLogout(); break;
    }
  }

  private async abrirModal(component: any) {
    const modal = await this.modalCtrl.create({
      component,
      initialBreakpoint: 0.9,
      breakpoints: [0, 0.9, 1],
      handleBehavior: 'cycle',
    });
    await modal.present();
  }

  private async alterarPassword() {
    const header  = await firstValueFrom(this.translate.get('DEFINICOES.PASSWORD'));
    const pldAtual = await firstValueFrom(this.translate.get('PASSWORD.CURRENT'));
    const pldNova  = await firstValueFrom(this.translate.get('PASSWORD.NEW'));
    const pldConf  = await firstValueFrom(this.translate.get('PASSWORD.CONFIRM'));

    const alert = await this.alertCtrl.create({
      header,
      inputs: [
        { name: 'atual',     type: 'password', placeholder: pldAtual },
        { name: 'nova',      type: 'password', placeholder: pldNova },
        { name: 'confirmar', type: 'password', placeholder: pldConf },
      ],
      buttons: [
        { text: this.translate.instant('COMUM.CANCELAR'), role: 'cancel' },
        {
          text: this.translate.instant('COMUM.GUARDAR'),
          handler: (data) => {
            if (!data.atual) { this.showToast(this.translate.instant('PASSWORD.ERROR_CURRENT'), 'warning'); return false; }
            if (!data.nova || data.nova !== data.confirmar) { this.showToast(this.translate.instant('REGISTER.ERRO_PASSWORDS'), 'danger'); return false; }
            this.showToast(this.translate.instant('PERFIL.SUCESSO'), 'success');
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  private async confirmarLogout() {
    const header = await firstValueFrom(this.translate.get('MENU.LOGOUT'));
    const msg    = await firstValueFrom(this.translate.get('NOTIFICACOES.ELIMINAR_MSG'));

    const alert = await this.alertCtrl.create({
      header,
      message: msg,
      buttons: [
        { text: this.translate.instant('COMUM.CANCELAR'), role: 'cancel' },
        { text: this.translate.instant('MENU.LOGOUT'), role: 'destructive', handler: () => this.auth.logout() },
      ],
    });
    await alert.present();
  }

  private async showToast(msg: string, color = 'medium') {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000, position: 'bottom', color });
    await t.present();
  }
}