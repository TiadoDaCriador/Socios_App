// src/app/pages/eventos/evento-detalhe-modal.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonButton, IonIcon, ModalController,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline, calendarOutline, timeOutline,
  locationOutline, pricetagOutline, trashOutline,
} from 'ionicons/icons';
import { EventoLista } from './eventos.page';
import { EventosService } from '../../services/eventos.service';

@Component({
  selector: 'app-evento-detalhe-modal',
  templateUrl: './evento-detalhe-modal.html',
  styleUrls: ['./evento-detalhe-modal.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonButton, IonIcon,
  ],
})
export class EventoDetalheModalComponent {

  @Input() evento!: EventoLista;

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private eventosService: EventosService,
  ) {
    addIcons({
      closeOutline, calendarOutline, timeOutline,
      locationOutline, pricetagOutline, trashOutline,
    });
  }

  fechar() {
    this.modalCtrl.dismiss();
  }

  async eliminar() {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar Evento',
      message: `Tens a certeza que queres eliminar "${this.evento.nome}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          cssClass: 'alert-btn-danger',
          handler: () => {
            this.eventosService.eliminar(this.evento.id);
            this.modalCtrl.dismiss({ eliminado: true }, 'eliminar');
          },
        },
      ],
    });
    await alert.present();
  }

  formatarDataCompleta(d: Date): string {
    return d.toLocaleDateString('pt-PT', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  formatarHora(d: Date): string {
    return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  }
}