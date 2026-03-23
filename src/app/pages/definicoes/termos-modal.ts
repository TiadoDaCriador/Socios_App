// src/app/pages/definicoes/termos-modal.ts
import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonButton, IonIcon, ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, documentTextOutline } from 'ionicons/icons';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-termos-modal',
  templateUrl: './termos-modal.html',
  styleUrls: ['./modal-shared.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, TranslateModule, IonHeader, IonToolbar, IonTitle,
    IonContent, IonButtons, IonButton, IonIcon],
})
export class TermosModalComponent {
  constructor(private modalCtrl: ModalController) {
    addIcons({ closeOutline, documentTextOutline });
  }
  fechar() { this.modalCtrl.dismiss(); }
}