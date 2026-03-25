// src/app/pages/definicoes/notificacoes-modal.ts
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonButton, IonIcon, IonToggle, ModalController, ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline, notificationsOutline, calendarOutline,
  walletOutline, newspaperOutline,
} from 'ionicons/icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NotificacoesService } from '../notificacoes/notificacoes.service';

@Component({
  selector: 'app-notificacoes-modal',
  templateUrl: './notificacoes-modal.html',
  styleUrls: ['./modal-shared.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, FormsModule, TranslateModule, IonHeader, IonToolbar, IonTitle,
    IonContent, IonButtons, IonButton, IonIcon, IonToggle],
})
export class NotificacoesModalComponent implements OnInit {

  notifEventos = true;
  notifQuotas = true;
  notifNoticias = true;

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private notifService: NotificacoesService,
    private translate: TranslateService,
  ) {
    addIcons({ closeOutline, notificationsOutline, calendarOutline, walletOutline, newspaperOutline });
  }

  ngOnInit() {
    const prefs = this.notifService.prefs;
    this.notifEventos = prefs.eventos;
    this.notifQuotas = prefs.quotas;
    this.notifNoticias = prefs.noticias;
  }

  fechar() { this.modalCtrl.dismiss(); }

  async guardar() {
    this.notifService.guardarPrefs({
      eventos: this.notifEventos,
      quotas: this.notifQuotas,
      noticias: this.notifNoticias,
    });
    const t = await this.toastCtrl.create({
      message: this.translate.instant('NOTIF_MODAL.GUARDAR'), duration: 2000, position: 'bottom', color: 'success',
    });
    await t.present();
    this.modalCtrl.dismiss();
  }
}