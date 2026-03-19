// src/app/pages/definicoes/acessibilidade-modal.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonButton, IonIcon, IonToggle, ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline, moonOutline, sunnyOutline, contrastOutline,
  textOutline, languageOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-acessibilidade-modal',
  templateUrl: './acessibilidade-modal.html',
  styleUrls: ['./acessibilidade-modal.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle,
    IonContent, IonButtons, IonButton, IonIcon, IonToggle],
})
export class AcessibilidadeModalComponent {
  modoEscuro = false;
  altoContraste = false;
  tamanhoFonte: 'pequeno' | 'normal' | 'grande' | 'extra' = 'normal';
  idioma: 'pt' | 'en' | 'es' = 'pt';

  tamanhosFonte: { valor: 'pequeno'|'normal'|'grande'|'extra'; label: string; size: string }[] = [
    { valor: 'pequeno', label: 'A', size: '13px' },
    { valor: 'normal',  label: 'A', size: '16px' },
    { valor: 'grande',  label: 'A', size: '20px' },
    { valor: 'extra',   label: 'A', size: '24px' },
  ];

  idiomas: { valor: 'pt'|'en'|'es'; label: string }[] = [
    { valor: 'pt', label: 'Português' },
    { valor: 'en', label: 'English'   },
    { valor: 'es', label: 'Español'   },
  ];

  constructor(private modalCtrl: ModalController) {
    addIcons({ closeOutline, moonOutline, sunnyOutline, contrastOutline, textOutline, languageOutline });
  }

  fechar() { this.modalCtrl.dismiss(); }
}