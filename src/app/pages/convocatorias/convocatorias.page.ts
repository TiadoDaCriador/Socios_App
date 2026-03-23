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
  checkmarkCircleOutline, closeCircleOutline, createOutline,
} from 'ionicons/icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConvocatoriasService } from './convocatorias.service';
import { TIPOS_EVENTO } from '../../shared/tipos-eventos';

export type RespostaType = 'aceite' | 'recusado' | 'pendente';

export interface Convocatoria {
  id: number;
  titulo: string;
  descricao: string;
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
    CommonModule, FormsModule, TranslateModule,
    IonHeader, IonToolbar, IonButtons, IonMenuButton,
    IonTitle, IonContent, IonIcon,
  ],
})
export class ConvocatoriasPage implements OnInit {

  mostrarFiltros = false;
  ordemDesc = true;
  limite = 10;
  limitesDisponiveis = [5, 10, 20, 0];

  convocatorias: Convocatoria[] = [
    { id: 1, titulo: 'Concerto Municipal', descricao: 'Foste convocado para participar no concerto municipal no Estádio Municipal às 10:00H no dia 25 de março.', dia: new Date(2026, 2, 25, 10, 0), hora: '10:00', local: 'Estádio Municipal', tipologia: 'concertos', resposta: 'pendente' },
    { id: 2, titulo: 'Aula de Formação', descricao: 'Foste convocado para a aula de formação no Campo de Treinos às 09:00H no dia 20 de março.', dia: new Date(2026, 2, 20, 9, 0), hora: '09:00', local: 'Campo de Treinos', tipologia: 'aulas', resposta: 'pendente' },
    { id: 3, titulo: 'Ensaio Geral', descricao: 'Foste convocado para o ensaio geral na Sede do Clube às 18:00H no dia 18 de março.', dia: new Date(2026, 2, 18, 18, 0), hora: '18:00', local: 'Sede do Clube', tipologia: 'ensaio-geral', resposta: 'pendente' },
    { id: 4, titulo: 'Desfile de Abril', descricao: 'Foste convocado para o desfile no Pavilhão Norte às 14:00H no dia 5 de abril.', dia: new Date(2026, 3, 5, 14, 0), hora: '14:00', local: 'Pavilhão Norte', tipologia: 'desfile', resposta: 'pendente' },
  ];

  constructor(
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private convocatoriasService: ConvocatoriasService,
    private translate: TranslateService,
  ) {
    addIcons({ filterOutline, chevronDownOutline, chevronUpOutline, locationOutline, timeOutline, calendarOutline, checkmarkCircleOutline, closeCircleOutline, createOutline });
  }

  ngOnInit() { }

  get convocatoriasFiltradas(): Convocatoria[] {
    let lista = [...this.convocatorias];
    lista.sort((a, b) => this.ordemDesc ? b.dia.getTime() - a.dia.getTime() : a.dia.getTime() - b.dia.getTime());
    if (this.limite > 0) lista = lista.slice(0, this.limite);
    return lista;
  }

  async responder(conv: Convocatoria, resposta: RespostaType, event: MouseEvent) {
    event.stopPropagation();
    if (conv.resposta === resposta && !conv.emEdicao) return;

    const msgKey = resposta === 'aceite' ? 'CONVOCATORIAS.CONFIRMAR_ACEITAR' : 'CONVOCATORIAS.CONFIRMAR_RECUSAR';
    const alert = await this.alertCtrl.create({
      header: this.translate.instant('CONVOCATORIAS.CONFIRMAR_HEADER'),
      message: this.translate.instant(msgKey),
      buttons: [
        { text: this.translate.instant('CONVOCATORIAS.CANCELAR'), role: 'cancel' },
        {
          text: this.translate.instant('CONVOCATORIAS.CONFIRMAR'),
          handler: async () => {
            conv.resposta = resposta;
            conv.emEdicao = false;
            this.convocatoriasService.responder(conv, resposta);
            const msgToast = resposta === 'aceite' ? 'CONVOCATORIAS.TOAST_ACEITE' : 'CONVOCATORIAS.TOAST_RECUSADO';
            const color = resposta === 'aceite' ? 'success' : 'danger';
            const toast = await this.toastCtrl.create({ message: this.translate.instant(msgToast), duration: 2500, position: 'bottom', color });
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
  toggleOrdem() { this.ordemDesc = !this.ordemDesc; }

  corTipologia(t: string): string {
    const tipo = TIPOS_EVENTO.find(e => e.valor === t);
    return tipo ? `cor-${tipo.cor}` : 'cor-blue';
  }

  labelTipologia(t: string): string {
    const tipo = TIPOS_EVENTO.find(e => e.valor === t);
    return tipo ? tipo.label : t;
  }
}