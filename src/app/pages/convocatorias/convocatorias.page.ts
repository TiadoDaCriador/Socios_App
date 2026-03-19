// src/app/pages/convocatorias/convocatorias.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonButtons, IonMenuButton,
  IonTitle, IonContent, IonIcon, AlertController, ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  filterOutline, chevronDownOutline, chevronUpOutline,
  locationOutline, timeOutline, calendarOutline,
  checkmarkCircleOutline, closeCircleOutline, helpCircleOutline,
  pricetagOutline, createOutline,
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
  emEdicao?: boolean;
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
  tipologias: string[] = [];

  convocatorias: Convocatoria[] = [
    { id: 1, dia: new Date(2026, 2, 25, 10, 0), hora: '10:00', local: 'Estádio Municipal', tipologia: 'Jogo',    resposta: 'pendente' },
    { id: 2, dia: new Date(2026, 2, 20, 9, 0),  hora: '09:00', local: 'Campo de Treinos',  tipologia: 'Treino',  resposta: 'pendente' },
    { id: 3, dia: new Date(2026, 2, 18, 18, 0), hora: '18:00', local: 'Sede do Clube',     tipologia: 'Reunião', resposta: 'pendente' },
    { id: 4, dia: new Date(2026, 3, 5, 14, 0),  hora: '14:00', local: 'Pavilhão Norte',    tipologia: 'Torneio', resposta: 'pendente' },
  ];

  constructor(
    private toastCtrl:          ToastController,
    private alertCtrl:          AlertController,
    private convocatoriasService: ConvocatoriasService,
  ) {
    addIcons({
      filterOutline, chevronDownOutline, chevronUpOutline,
      locationOutline, timeOutline, calendarOutline,
      checkmarkCircleOutline, closeCircleOutline, helpCircleOutline,
      pricetagOutline, createOutline,
    });
  }

  ngOnInit() {
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
    if (this.limite > 0) lista = lista.slice(0, this.limite);
    return lista;
  }

  async responder(conv: Convocatoria, resposta: RespostaType, event: MouseEvent) {
    event.stopPropagation();

    // Não fazer nada se já está selecionada (e não está em edição)
    if (conv.resposta === resposta && !conv.emEdicao) return;

    const label = resposta === 'aceite' ? 'aceitar' : 'recusar';
    const alert = await this.alertCtrl.create({
      header: 'Confirmar resposta',
      message: `Tens a certeza que queres <strong>${label}</strong> esta convocatória?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: async () => {
            conv.resposta = resposta;
            conv.emEdicao = false;
            this.convocatoriasService.responder(conv, resposta);

            const msg   = resposta === 'aceite' ? 'Convocatória aceite!' : 'Convocatória recusada.';
            const color = resposta === 'aceite' ? 'success' : 'danger';
            const toast = await this.toastCtrl.create({ message: msg, duration: 2500, position: 'bottom', color });
            await toast.present();
          },
        },
      ],
    });
    await alert.present();
  }

  editarResposta(conv: Convocatoria, event: MouseEvent) {
    event.stopPropagation();
    conv.emEdicao = true;
  }

  setLimite(n: number) { this.limite = n; }
  setFiltroTipologia(t: string) { this.filtroTipologia = this.filtroTipologia === t ? '' : t; }
  toggleOrdem() { this.ordemDesc = !this.ordemDesc; }

  formatarDia(d: Date): string {
    return d.toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: '2-digit', year: '2-digit' });
  }

  corTipologia(t: string): string {
    const mapa: Record<string, string> = {
      'Jogo': 'cor-red', 'Treino': 'cor-green', 'Reunião': 'cor-blue', 'Torneio': 'cor-orange',
    };
    return mapa[t] ?? 'cor-blue';
  }
}