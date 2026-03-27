import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IonIcon, AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cardOutline, addCircleOutline, trashOutline } from 'ionicons/icons';

export interface CartaoAssociado {
  id: number;
  ultimos4: string;
  tipo: string;
  titular: string;
}

@Component({
  selector: 'app-cartoes-modal',
  templateUrl: './cartoes-modal.html',
  styleUrls: ['./cartoes-modal.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CommonModule, TranslateModule, IonIcon],
})
export class CartoesModalComponent {

  cartoes: CartaoAssociado[] = [
    { id: 1, ultimos4: '4532', tipo: 'Visa',       titular: 'João Silva' },
    { id: 2, ultimos4: '1234', tipo: 'Mastercard', titular: 'João Silva' },
  ];

  constructor(private alertCtrl: AlertController) {
    addIcons({ cardOutline, addCircleOutline, trashOutline });
  }

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
        {
          text: 'Guardar',
          handler: (d) => {
            if (!d.numero || d.numero.length < 4) return false;
            this.cartoes = [...this.cartoes, {
              id: Date.now(),
              ultimos4: d.numero.slice(-4),
              tipo: 'Visa',
              titular: d.titular,
            }];
            return true;
          },
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
        {
          text: 'Remover',
          role: 'destructive',
          handler: () => {
            this.cartoes = this.cartoes.filter(x => x.id !== c.id);
          },
        },
      ],
    });
    await alert.present();
  }
}