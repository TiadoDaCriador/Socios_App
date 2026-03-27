import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIcon, IonToggle } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { moonOutline, sunnyOutline, textOutline, languageOutline } from 'ionicons/icons';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-acessibilidade-modal',
  templateUrl: './acessibilidade-modal.html',
  styleUrls: ['./acessibilidade-modal.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, FormsModule, IonIcon, IonToggle, TranslateModule],
})
export class AcessibilidadeModalComponent implements OnInit {

  modoEscuro = false;
  tamanhoFonte: 'pequeno' | 'normal' | 'grande' | 'extra' = 'normal';
  idioma: 'pt' | 'en' | 'es' = 'pt';

  tamanhosFonte = [
    { valor: 'pequeno' as const, label: 'A', size: '13px', px: '13px' },
    { valor: 'normal'  as const, label: 'A', size: '16px', px: '16px' },
    { valor: 'grande'  as const, label: 'A', size: '20px', px: '20px' },
    { valor: 'extra'   as const, label: 'A', size: '24px', px: '24px' },
  ];

  idiomas = [
    { valor: 'pt' as const, label: 'PT' },
    { valor: 'en' as const, label: 'EN' },
    { valor: 'es' as const, label: 'ES' },
  ];

  constructor(private translate: TranslateService) {
    addIcons({ moonOutline, sunnyOutline, textOutline, languageOutline });
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

  setIdioma(valor: 'pt' | 'en' | 'es') {
    this.idioma = valor;
    this.translate.use(valor);
    localStorage.setItem('idioma', valor);
  }
}