import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonButtons, IonMenuButton,
  IonTitle, IonContent, IonIcon, ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { EventoModalComponent } from './eventomodal/eventomodal.component';
import { EventosService, EventoLista } from '../../services/eventos.service';

export interface Evento {
  id: number;
  titulo: string;
  data: Date;
  hora: string;
  cor: string;
  local?: string;
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
export class CalendarioPage implements OnInit, OnDestroy {

  @Output() dateSelected = new EventEmitter<Date>();

  vista: VistaType = 'mes';
  dataAtual = new Date();
  hoje = new Date();

  diasSemana = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
  meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  eventos: Evento[] = [];
  celulas: { data: Date; mesAtual: boolean }[] = [];
  horas = Array.from({ length: 14 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`);

  private sub?: Subscription;

  constructor(
    private modalCtrl: ModalController,
    private eventosService: EventosService,
  ) {
    addIcons({ chevronBackOutline, chevronForwardOutline });
  }

  ngOnInit() {
    this.gerarCelulas();

    this.sub = this.eventosService.eventos$.subscribe((lista: EventoLista[]) => {
      this.eventos = lista.map(e => this.eventoListaParaEvento(e));
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  // ── Título da barra de navegação ────────────────────────────
  get tituloNavegacao(): string {
    const ano = this.dataAtual.getFullYear();
    const mes = this.meses[this.dataAtual.getMonth()];

    if (this.vista === 'mes') return `${mes} ${ano}`;

    if (this.vista === 'semana') {
      const dias = this.diasDaSemana;
      const inicio = dias[0];
      const fim = dias[dias.length - 1];
      const dI = inicio.getDate();
      const dF = fim.getDate();
      const mI = this.meses[inicio.getMonth()];
      const mF = this.meses[fim.getMonth()];
      return mI === mF
        ? `${dI}–${dF} ${mI} ${ano}`
        : `${dI} ${mI} – ${dF} ${mF} ${ano}`;
    }

    return `${this.dataAtual.getDate()} ${mes} ${ano}`;
  }

  // ── Dias da semana atual ─────────────────────────────────────
  get diasDaSemana(): Date[] {
    const d = new Date(this.dataAtual);
    const dow = d.getDay() === 0 ? 6 : d.getDay() - 1;
    d.setDate(d.getDate() - dow);
    return Array.from({ length: 7 }, (_, i) => {
      const dia = new Date(d);
      dia.setDate(d.getDate() + i);
      return dia;
    });
  }

  // ── Comparação de datas ──────────────────────────────────────
  isHoje(data: Date): boolean {
    return (
      data.getDate() === this.hoje.getDate() &&
      data.getMonth() === this.hoje.getMonth() &&
      data.getFullYear() === this.hoje.getFullYear()
    );
  }

  isPassado(data: Date): boolean {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const d = new Date(data);
    d.setHours(0, 0, 0, 0);
    return d < hoje;
  }

  private mesmoDia(a: Date, b: Date): boolean {
    return (
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear()
    );
  }

  // ── Eventos por dia / hora ───────────────────────────────────
  eventosNoDia(data: Date): Evento[] {
    return this.eventos.filter(ev => this.mesmoDia(new Date(ev.data), data));
  }

  eventoNaHora(dia: Date, hora: string): Evento | undefined {
    return this.eventosNoDia(dia).find(ev => ev.hora?.startsWith(hora.slice(0, 2)));
  }

  // ── Modais ───────────────────────────────────────────────────
  async abrirModalNovoEvento(data: Date) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataClicada = new Date(data);
    dataClicada.setHours(0, 0, 0, 0);
    if (dataClicada < hoje) return; // 👈 bloqueia dias passados

    const modal = await this.modalCtrl.create({
      component: EventoModalComponent,
      componentProps: { dataInicial: data },
    });
    await modal.present();

    const { data: resultado } = await modal.onWillDismiss();
    if (resultado) {
      this.eventosService.adicionarDoCalendario({
        titulo: resultado.titulo,
        data:   resultado.data,
        hora:   resultado.hora,
        cor:    resultado.cor,
        local:  resultado.local,
      });
    }
  }

  async abrirModalEditar(ev: Evento, $event: Event) {
    $event.stopPropagation();

    const modal = await this.modalCtrl.create({
      component: EventoModalComponent,
      componentProps: { evento: ev, modoEdicao: true },
    });
    await modal.present();

    const { data: resultado, role } = await modal.onWillDismiss();

    if (role === 'eliminar') {
      this.eventosService.eliminar(ev.id);
      return;
    }
    if (resultado) {
      this.eventosService.atualizar(ev.id, {
        nome:       resultado.titulo,
        tipo:       resultado.tipo ?? ev.cor,
        cor:        resultado.cor,
        dataInicio: resultado.data,
        dataFim:    resultado.data,
        local:      resultado.local ?? '',
      });
    }
  }

  // ── Navegação ────────────────────────────────────────────────
  selecionarDia(celula: { data: Date }) {
    this.dateSelected.emit(celula.data);
  }

  anterior() {
    const d = new Date(this.dataAtual);
    if (this.vista === 'mes') d.setMonth(d.getMonth() - 1);
    else if (this.vista === 'semana') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    this.dataAtual = d;
    this.gerarCelulas();
  }

  proximo() {
    const d = new Date(this.dataAtual);
    if (this.vista === 'mes') d.setMonth(d.getMonth() + 1);
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

  // ── Geração de células do mês ────────────────────────────────
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

  // ── Conversão EventoLista → Evento local ────────────────────
  private eventoListaParaEvento(e: EventoLista): Evento {
    const dataInicio = new Date(e.dataInicio);
    const hh = String(dataInicio.getHours()).padStart(2, '0');
    const mm = String(dataInicio.getMinutes()).padStart(2, '0');
    return {
      id:     e.id as unknown as number,
      titulo: e.nome,
      data:   dataInicio,
      hora:   `${hh}h${mm}`,
      cor:    e.cor,
      local:  e.local,
    };
  }
}