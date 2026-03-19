// src/app/pages/definicoes/cartoes-modal.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonButton, IonIcon, ModalController,
  AlertController, ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, cardOutline, addCircleOutline, trashOutline } from 'ionicons/icons';

export interface CartaoAssociado {
  id: number; ultimos4: string; tipo: string; titular: string;
}

@Component({
  selector: 'app-cartoes-modal',
  templateUrl: './cartoes-modal.html',
  styleUrls: ['./modal-shared.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle,
    IonContent, IonButtons, IonButton, IonIcon],
})
export class CartoesModalComponent {
  cartoes: CartaoAssociado[] = [
    { id: 1, ultimos4: '4532', tipo: 'Visa',       titular: 'João Silva' },
    { id: 2, ultimos4: '1234', tipo: 'Mastercard', titular: 'João Silva' },
  ];

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
  ) {
    addIcons({ closeOutline, cardOutline, addCircleOutline, trashOutline });
  }

  fechar() { this.modalCtrl.dismiss(); }

  async adicionar() {
    const alert = await this.alertCtrl.create({
      header: 'Adicionar Cartão',
      inputs: [
        { name: 'numero',   type: 'text',     placeholder: 'Número do cartão' },
        { name: 'titular',  type: 'text',     placeholder: 'Nome do titular'  },
        { name: 'validade', type: 'text',     placeholder: 'MM/AA'            },
        { name: 'cvv',      type: 'password', placeholder: 'CVV'              },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Guardar', handler: (d) => {
            this.cartoes = [...this.cartoes, { id: Date.now(), ultimos4: d.numero.slice(-4), tipo: 'Visa', titular: d.titular }];
            // TODO: this.cartoesService.adicionar(d).subscribe()
          }
        },
      ],
    });
    await alert.present();
  }

  async remover(c: CartaoAssociado) {
    const alert = await this.alertCtrl.create({
      header: 'Remover Cartão',
      message: `Remover cartão terminado em ${c.ultimos4}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Remover', role: 'destructive', handler: () => {
            this.cartoes = this.cartoes.filter(x => x.id !== c.id);
            // TODO: this.cartoesService.remover(c.id).subscribe()
          }
        },
      ],
    });
    await alert.present();
  }
}