// src/app/pages/convocatorias/convocatorias.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonButtons, IonMenuButton,
  IonTitle, IonContent, IonIcon, ModalController, ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  filterOutline, chevronDownOutline, chevronUpOutline,
  locationOutline, timeOutline, calendarOutline,
  checkmarkCircleOutline, closeCircleOutline, helpCircleOutline,
  pricetagOutline,
} from 'ionicons/icons';
import { ConvocatoriasService } from './convocatorias.service';

export type RespostaType = 'aceite' | 'recusado' | 'pendente';

export interface Convocatoria {
  id: number;
  dia: Date;
  hora: string;
  local: string;
  tipologia: string;
  resposta: RespostaType;
}

@Component({
  selector: 'app-convocatorias',
  templateUrl: './convocatorias.page.html',
  styleUrls: ['./convocatorias.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonButtons, IonMenuButton,
    IonTitle, IonContent, IonIcon,
  ],
})
export class ConvocatoriasPage implements OnInit {

  filtroTipologia = '';
  mostrarFiltros = false;
  ordemDesc = true;
  limite = 10;
  limitesDisponiveis = [5, 10, 20, 0];

  // TODO: carregar tipologias do API → this.convocatoriaService.getTipologias()
  tipologias: string[] = [];

  // TODO: substituir por chamada ao API → this.convocatoriaService.getConvocatorias()
  convocatorias: Convocatoria[] = [
    { id: 1, dia: new Date(2026, 2, 25, 10, 0), hora: '10:00', local: 'Estádio Municipal', tipologia: 'Jogo', resposta: 'pendente' },
    { id: 2, dia: new Date(2026, 2, 20, 9, 0),  hora: '09:00', local: 'Campo de Treinos',  tipologia: 'Treino', resposta: 'aceite' },
    { id: 3, dia: new Date(2026, 2, 18, 18, 0), hora: '18:00', local: 'Sede do Clube',     tipologia: 'Reunião', resposta: 'recusado' },
    { id: 4, dia: new Date(2026, 3, 5, 14, 0),  hora: '14:00', local: 'Pavilhão Norte',    tipologia: 'Torneio', resposta: 'pendente' },
  ];

  constructor(
    private toastCtrl: ToastController,
    private convocatoriasService: ConvocatoriasService,
  ) {
    addIcons({
      filterOutline, chevronDownOutline, chevronUpOutline,
      locationOutline, timeOutline, calendarOutline,
      checkmarkCircleOutline, closeCircleOutline, helpCircleOutline,
      pricetagOutline,
    });
  }

  ngOnInit() {
    // TODO: Carregar tipologias do API
    // this.convocatoriaService.getTipologias().subscribe(t => this.tipologias = t);

    // Extrai tipologias únicas dos dados mock por agora
    this.tipologias = [...new Set(this.convocatorias.map(c => c.tipologia))];
  }

  get convocatoriasFiltradas(): Convocatoria[] {
    let lista = [...this.convocatorias];

    if (this.filtroTipologia) {
      lista = lista.filter(c => c.tipologia === this.filtroTipologia);
    }

    lista.sort((a, b) => this.ordemDesc
      ? b.dia.getTime() - a.dia.getTime()
      : a.dia.getTime() - b.dia.getTime()
    );

    // Limite
    if (this.limite > 0) {
      lista = lista.slice(0, this.limite);
    }

    return lista;
  }

  async responder(conv: Convocatoria, resposta: RespostaType, event: MouseEvent) {
    event.stopPropagation();

    conv.resposta = resposta;

    // Cria notificação e envia resposta
    this.convocatoriasService.responder(conv, resposta);

    const msg   = resposta === 'aceite' ? 'Convocatória aceite!' : 'Convocatória recusada.';
    const color = resposta === 'aceite' ? 'success' : 'danger';

    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2500,
      position: 'bottom',
      color,
    });
    await toast.present();
  }

  setLimite(n: number) { this.limite = n; }

  setFiltroTipologia(t: string) {
    this.filtroTipologia = this.filtroTipologia === t ? '' : t;
  }

  toggleOrdem() { this.ordemDesc = !this.ordemDesc; }

  formatarDia(d: Date): string {
    return d.toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: '2-digit', year: '2-digit' });
  }

  corTipologia(t: string): string {
    const mapa: Record<string, string> = {
      'Jogo':    'cor-red',
      'Treino':  'cor-green',
      'Reunião': 'cor-blue',
      'Torneio': 'cor-orange',
    };
    return mapa[t] ?? 'cor-blue';
  }
}