// src/app/pages/definicoes/definicoes.page.ts
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
  logOutOutline, chevronForwardOutline,
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { AcessibilidadeModalComponent } from './acessibilidade-modal';
import { NotificacoesModalComponent } from './notificacoes-modal';
import { CartoesModalComponent } from './cartoes-modal';
import { TermosModalComponent } from './termos-modal';
import { ModalController } from '@ionic/angular/standalone';

export interface OpcaoDefinicao {
  id: string;
  label: string;
  descricao?: string;
  icone: string;
  cor?: string;
  danger?: boolean;
}

@Component({
  selector: 'app-definicoes',
  templateUrl: './definicoes.page.html',
  styleUrls: ['./definicoes.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonButtons, IonMenuButton,
    IonTitle, IonContent, IonIcon,
  ],
})
export class DefinicoesPage {

  opcoes: OpcaoDefinicao[] = [
    { id: 'acessibilidade', label: 'Acessibilidade', descricao: 'Fonte, tema, idioma', icone: 'accessibility-outline' },
    { id: 'suporte', label: 'Suporte', descricao: 'Enviar email de suporte', icone: 'help-circle-outline' },
    { id: 'password', label: 'Palavra-passe', descricao: 'Alterar palavra-passe', icone: 'lock-closed-outline' },
    { id: 'cartoes', label: 'Cartões Associados', descricao: 'Gerir cartões de pagamento', icone: 'card-outline' },
    { id: 'notificacoes', label: 'Gerir Notificações', descricao: 'Eventos, quotas, convocatórias', icone: 'notifications-outline' },
    { id: 'termos', label: 'Termos e Permissões', descricao: 'Ver termos de utilização', icone: 'document-text-outline' },
    { id: 'logout', label: 'Terminar Sessão', icone: 'log-out-outline', danger: true },
  ];

  constructor(
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private auth: AuthService,
  ) {
    addIcons({
      accessibilityOutline, helpCircleOutline, lockClosedOutline,
      cardOutline, notificationsOutline, documentTextOutline,
      logOutOutline, chevronForwardOutline,
    });
  }

  async clicar(opcao: OpcaoDefinicao) {
    switch (opcao.id) {

      case 'acessibilidade':
        await this.abrirModal(AcessibilidadeModalComponent);
        break;

      case 'suporte':
        window.open('mailto:suporte@associacao.pt?subject=Suporte App Sócios', '_blank');
        break;

      case 'password':
        await this.alterarPassword();
        break;

      case 'cartoes':
        await this.abrirModal(CartoesModalComponent);
        break;

      case 'notificacoes':
        await this.abrirModal(NotificacoesModalComponent);
        break;

      case 'termos':
        await this.abrirModal(TermosModalComponent);
        break;

      case 'logout':
        await this.confirmarLogout();
        break;
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
    const alert = await this.alertCtrl.create({
      header: 'Alterar Palavra-passe',
      inputs: [
        { name: 'atual', type: 'password', placeholder: 'Palavra-passe atual' },
        { name: 'nova', type: 'password', placeholder: 'Nova palavra-passe' },
        { name: 'confirmar', type: 'password', placeholder: 'Confirmar nova' },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Alterar',
          handler: (data) => {
            if (!data.nova || data.nova !== data.confirmar) {
              this.showToast('As palavras-passe não coincidem', 'danger');
              return false;
            }
            // TODO: this.authService.alterarPassword(data.atual, data.nova).subscribe()
            this.showToast('Palavra-passe alterada!', 'success');
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  private async confirmarLogout() {
    const alert = await this.alertCtrl.create({
      header: 'Terminar Sessão',
      message: 'Tens a certeza que queres sair?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Sair', role: 'destructive', handler: () => this.auth.logout() },
      ],
    });
    await alert.present();
  }

  private async showToast(msg: string, color = 'medium') {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000, position: 'bottom', color });
    await t.present();
  }
}