// src/app/pages/definicoes/acessibilidade-modal.ts
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonButton, IonIcon, IonToggle, ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline, moonOutline, sunnyOutline,
  textOutline, languageOutline,
} from 'ionicons/icons';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-acessibilidade-modal',
  templateUrl: './acessibilidade-modal.html',
  styleUrls: ['./acessibilidade-modal.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle,
    IonContent, IonButtons, IonButton, IonIcon, IonToggle, TranslateModule],
})
export class AcessibilidadeModalComponent implements OnInit {

  modoEscuro = false;
  tamanhoFonte: 'pequeno' | 'normal' | 'grande' | 'extra' = 'normal';
  idioma: 'pt' | 'en' | 'es' = 'pt';

  tamanhosFonte: { valor: 'pequeno' | 'normal' | 'grande' | 'extra'; label: string; size: string; px: string }[] = [
    { valor: 'pequeno', label: 'A', size: '13px', px: '13px' },
    { valor: 'normal',  label: 'A', size: '16px', px: '16px' },
    { valor: 'grande',  label: 'A', size: '20px', px: '20px' },
    { valor: 'extra',   label: 'A', size: '24px', px: '24px' },
  ];

  // ✅ Array de idiomas restaurado
  idiomas: { valor: 'pt' | 'en' | 'es'; label: string }[] = [
    { valor: 'pt', label: 'Português' },
    { valor: 'en', label: 'English'   },
    { valor: 'es', label: 'Español'   },
  ];

  constructor(
    private modalCtrl: ModalController,
    private translate: TranslateService,
  ) {
    addIcons({ closeOutline, moonOutline, sunnyOutline, textOutline, languageOutline });
  }

  ngOnInit() {
    this.modoEscuro = document.documentElement.classList.contains('dark');
    this.idioma = (localStorage.getItem('idioma') as any) ?? 'pt';

    const fonteGuardada = localStorage.getItem('tamanhoFonte') as any;
    if (fonteGuardada) this.tamanhoFonte = fonteGuardada;
  }

  toggleModoEscuro(ativo: boolean) {
    this.modoEscuro = ativo;
    document.documentElement.classList.toggle('dark', ativo);
    document.body.classList.toggle('dark', ativo);
    localStorage.setItem('modoEscuro', String(ativo));
  }

  setTamanhoFonte(valor: 'pequeno' | 'normal' | 'grande' | 'extra') {
    this.tamanhoFonte = valor;
    const fonte = this.tamanhosFonte.find(f => f.valor === valor);
    if (fonte) {
      document.documentElement.style.setProperty('--app-font-size', fonte.px);
      document.documentElement.style.fontSize = fonte.px;
    }
    localStorage.setItem('tamanhoFonte', valor);
  }

  // ✅ Método único sem duplicação, com log para debug
  setIdioma(valor: 'pt' | 'en' | 'es') {
    this.idioma = valor;
    this.translate.use(valor);
    localStorage.setItem('idioma', valor);
    console.log('Idioma mudado para:', valor, 'atual:', this.translate.currentLang);
  }

  fechar() { this.modalCtrl.dismiss(); }
}