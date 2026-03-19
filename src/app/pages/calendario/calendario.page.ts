// src/app/pages/calendario/calendario.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonButtons, IonMenuButton,
  IonTitle, IonContent, IonIcon, ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { EventoModalComponent } from './eventomodal/eventomodal.component';
import { EventosService } from '../../services/eventos.service';

export interface Evento {
  id: number;
  titulo: string;
  data: Date;
  hora: string;
  cor: string;
}

type VistaType = 'mes' | 'semana' | 'dia';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.page.html',
  styleUrls: ['./calendario.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonButtons, IonMenuButton,
    IonTitle, IonContent, IonIcon,
  ],
})
export class CalendarioPage implements OnInit {

  vista: VistaType = 'mes';
  dataAtual = new Date();
  hoje = new Date();

  diasSemana = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
  meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // TODO: substituir por chamada ao serviço quando tiveres o API
  eventos: Evento[] = [];

  celulas: { data: Date; mesAtual: boolean }[] = [];
  horas = Array.from({ length: 14 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`);

  constructor(
    private modalCtrl: ModalController,
    private eventosService: EventosService,
  ) {
    addIcons({ chevronBackOutline, chevronForwardOutline });
  }

  ngOnInit() {
    this.gerarCelulas();
  }

  // ─── Abrir modal para novo evento ────────────────────────
  async abrirModalNovoEvento(data: Date) {
    const modal = await this.modalCtrl.create({
      component: EventoModalComponent,
      componentProps: { dataInicial: data },
      initialBreakpoint: 0.95,
      breakpoints: [0, 0.95],
      handleBehavior: 'cycle',
    });

    await modal.present();

    const { data: resultado, role } = await modal.onWillDismiss();

    if (role === 'guardar' && resultado) {
      // Adiciona ao serviço partilhado → aparece automaticamente na página de Eventos
      const novoEvento = this.eventosService.adicionarDoCalendario({
        titulo: resultado.titulo,
        data:   resultado.data,
        hora:   resultado.hora,
        cor:    resultado.cor,
        local:  resultado.local,
      });

      // Adiciona também à lista local do calendário
      this.eventos = [...this.eventos, {
        id:     novoEvento.id,
        titulo: novoEvento.nome,
        data:   resultado.data,
        hora:   resultado.hora,
        cor:    resultado.cor,
      }];
    }

    if (role === 'eliminar' && resultado?.id) {
      this.eventos = this.eventos.filter(e => e.id !== resultado.id);
      this.eventosService.eliminar(resultado.id);
    }
  }

  // ─── Abrir modal para editar evento existente ────────────
  async abrirModalEditar(evento: Evento, $event: MouseEvent) {
    $event.stopPropagation(); // evita abrir o modal de novo evento por baixo

    const modal = await this.modalCtrl.create({
      component: EventoModalComponent,
      componentProps: { dataInicial: evento.data, evento },
      initialBreakpoint: 0.95,
      breakpoints: [0, 0.95],
      handleBehavior: 'cycle',
    });

    await modal.present();

    const { data: resultado, role } = await modal.onWillDismiss();

    if (role === 'guardar' && resultado) {
      this.eventos = this.eventos.map(e =>
        e.id === evento.id ? { ...e, ...resultado } : e
      );
      this.eventosService.atualizar(evento.id, {
        nome: resultado.titulo,
        cor:  resultado.cor,
      });
    }

    if (role === 'eliminar') {
      this.eventos = this.eventos.filter(e => e.id !== evento.id);
      this.eventosService.eliminar(evento.id);
    }
  }

  // ─── Navegação ────────────────────────────────────────────
  anterior() {
    const d = new Date(this.dataAtual);
    if (this.vista === 'mes')    d.setMonth(d.getMonth() - 1);
    else if (this.vista === 'semana') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    this.dataAtual = d;
    this.gerarCelulas();
  }

  proximo() {
    const d = new Date(this.dataAtual);
    if (this.vista === 'mes')    d.setMonth(d.getMonth() + 1);
    else if (this.vista === 'semana') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    this.dataAtual = d;
    this.gerarCelulas();
  }

  irParaHoje() {
    this.dataAtual = new Date();
    this.gerarCelulas();
  }

  setVista(v: VistaType) {
    this.vista = v;
    this.gerarCelulas();
  }

  // ─── Geração de células ───────────────────────────────────
  gerarCelulas() {
    this.celulas = [];
    const ano = this.dataAtual.getFullYear();
    const mes = this.dataAtual.getMonth();

    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia   = new Date(ano, mes + 1, 0);

    let inicioSemana = primeiroDia.getDay();
    inicioSemana = inicioSemana === 0 ? 6 : inicioSemana - 1;

    for (let i = inicioSemana - 1; i >= 0; i--) {
      this.celulas.push({ data: new Date(ano, mes, -i), mesAtual: false });
    }
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      this.celulas.push({ data: new Date(ano, mes, i), mesAtual: true });
    }
    const resto = 42 - this.celulas.length;
    for (let i = 1; i <= resto; i++) {
      this.celulas.push({ data: new Date(ano, mes + 1, i), mesAtual: false });
    }
  }

  // ─── Helpers ──────────────────────────────────────────────
  get diasDaSemana(): Date[] {
    const d = new Date(this.dataAtual);
    const diaSemana = d.getDay() === 0 ? 6 : d.getDay() - 1;
    d.setDate(d.getDate() - diaSemana);
    return Array.from({ length: 7 }, (_, i) => {
      const dia = new Date(d);
      dia.setDate(d.getDate() + i);
      return dia;
    });
  }

  eventosNoDia(data: Date): Evento[] {
    return this.eventos.filter(e =>
      e.data.getFullYear() === data.getFullYear() &&
      e.data.getMonth()    === data.getMonth()    &&
      e.data.getDate()     === data.getDate()
    );
  }

  eventoNaHora(data: Date, hora: string): Evento | null {
    return this.eventos.find(e =>
      e.data.getFullYear() === data.getFullYear() &&
      e.data.getMonth()    === data.getMonth()    &&
      e.data.getDate()     === data.getDate()     &&
      e.hora === hora.replace(':00', 'h')
    ) ?? null;
  }

  isHoje(data: Date): boolean {
    return data.getFullYear() === this.hoje.getFullYear() &&
           data.getMonth()    === this.hoje.getMonth()    &&
           data.getDate()     === this.hoje.getDate();
  }

  get tituloNavegacao(): string {
    const m = this.meses[this.dataAtual.getMonth()];
    const a = this.dataAtual.getFullYear();
    if (this.vista === 'mes') return `${m.toUpperCase()} ${a}`;
    if (this.vista === 'dia') return `${this.dataAtual.getDate()} ${m} ${a}`;
    const dias = this.diasDaSemana;
    return `${dias[0].getDate()} - ${dias[6].getDate()} ${m} ${a}`;
  }
}