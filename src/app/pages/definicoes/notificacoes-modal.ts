import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIcon, IonToggle, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, walletOutline, newspaperOutline } from 'ionicons/icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NotificacoesService } from '../notificacoes/notificacoes.service';

@Component({
  selector: 'app-notificacoes-modal',
  templateUrl: './notificacoes-modal.html',
  styleUrls: ['./notificacoes-modal.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, FormsModule, IonIcon, IonToggle, TranslateModule],
})
export class NotificacoesModalComponent implements OnInit {

  notifEventos = true;
  notifQuotas = true;
  notifNoticias = true;

  constructor(
    private toastCtrl: ToastController,
    private notifService: NotificacoesService,
    private translate: TranslateService,
  ) {
    addIcons({ calendarOutline, walletOutline, newspaperOutline });
  }

  ngOnInit() {
    const prefs = this.notifService.prefs;
    this.notifEventos = prefs.eventos;
    this.notifQuotas = prefs.quotas;
    this.notifNoticias = prefs.noticias;
  }

  async guardar() {
    this.notifService.guardarPrefs({
      eventos: this.notifEventos,
      quotas: this.notifQuotas,
      noticias: this.notifNoticias,
    });

    const t = await this.toastCtrl.create({
      message: this.translate.instant('NOTIF_MODAL.GUARDAR'),
      duration: 2000,
      position: 'bottom',
      color: 'success',
    });
    await t.present();
  }
}