// src/app/pages/definicoes/notificacoes-modal.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonButton, IonIcon, IonToggle, ModalController, ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, notificationsOutline } from 'ionicons/icons';

@Component({
  selector: 'app-notificacoes-modal',
  templateUrl: './notificacoes-modal.html',
  styleUrls: ['./modal-shared.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle,
    IonContent, IonButtons, IonButton, IonIcon, IonToggle],
})
export class NotificacoesModalComponent {
  notifEventos = true;
  notifQuotas = true;
  notifConvocatorias = true;
  notifNoticias = false;

  constructor(private modalCtrl: ModalController, private toastCtrl: ToastController) {
    addIcons({ closeOutline, notificationsOutline });
  }

  fechar() { this.modalCtrl.dismiss(); }

  async guardar() {
    // TODO: this.prefsService.guardarNotificacoes({...})
    const t = await this.toastCtrl.create({ message: 'Notificações guardadas!', duration: 2000, position: 'bottom', color: 'success' });
    await t.present();
    this.modalCtrl.dismiss();
  }
}