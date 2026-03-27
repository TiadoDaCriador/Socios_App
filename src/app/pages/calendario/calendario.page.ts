import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  IonHeader, IonToolbar, IonButtons, IonMenuButton,
  IonTitle, IonContent, IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { EventosService, EventoLista } from '../../services/eventos.service';

// IMPORT CORRIGIDO: Certifica-te que o ficheiro se chama tipos-eventos.ts na pasta shared
import { corDoTipo, labelDoTipo, TIPOS_EVENTO } from '../../shared/tipos-eventos';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.page.html',
  styleUrls: ['./calendario.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule, TranslateModule,
    IonHeader, IonToolbar, IonButtons, IonMenuButton,
    IonTitle, IonContent, IonIcon
  ],
})
export class CalendarioPage implements OnInit, OnDestroy {
  vista: 'mes' | 'semana' = 'mes';
  dataAtual = new Date();
  hoje = new Date();
  diasSemana: string[] = [];
  celulas: any[] = [];
  diasDaSemana: Date[] = [];
  diaSelecionadoSemana: Date = new Date();
  eventosDoDia: EventoLista[] = [];
  todosEventos: EventoLista[] = [];

  readonly COR_MULTIPLOS = '#FF6B35';
  private sub?: Subscription;

  constructor(
    private eventosService: EventosService,
    private translate: TranslateService
  ) {
    addIcons({ chevronBackOutline, chevronForwardOutline });
  }

  ngOnInit() {
    this.carregarTraducoes();
    this.gerarCelulas();

    this.sub = this.eventosService.eventos$.subscribe((eventos: EventoLista[]) => {
      this.todosEventos = eventos;
      this.gerarCelulas();
      this.atualizarEventosDoDia(this.dataAtual);
    });
  }

  private carregarTraducoes() {
    this.translate.get(['CALENDARIO.DIAS_CURTO']).subscribe(res => {
      this.diasSemana = res['CALENDARIO.DIAS_CURTO'];
    });
  }

  // --- Lógica de Seleção Unificada ---
  
  // Quando clicas num dia no MÊS
  selecionarDiaMes(dia: Date) {
    this.dataAtual = new Date(dia);
    this.diaSelecionadoSemana = dia; // Sincroniza a bolinha da semana
    this.atualizarEventosDoDia(dia);
  }

  // Quando clicas num dia na SEMANA
  selecionarDiaSemana(dia: Date) {
    this.dataAtual = new Date(dia); // Atualiza o cabeçalho (26 Março...)
    this.diaSelecionadoSemana = dia;
    this.atualizarEventosDoDia(dia);
  }

  atualizarEventosDoDia(dia: Date) {
    this.eventosDoDia = this.eventosNaData(dia)
      .sort((a, b) => {
        const hA = new Date(a.dataInicio).getTime();
        const hB = new Date(b.dataInicio).getTime();
        return hA - hB;
      });
  }

  // --- Helpers de Cores e Labels ---

  corDaCelula(data: Date): string | null {
    const eventos = this.eventosNaData(data);
    if (eventos.length === 0) return null;
    const tiposUnicos = [...new Set(eventos.map(e => e.tipo))];
    if (tiposUnicos.length === 1) return corDoTipo(eventos[0].tipo);
    return this.COR_MULTIPLOS;
  }

  eventosNaData(data: Date): EventoLista[] {
    const d = new Date(data); d.setHours(0, 0, 0, 0);
    return this.todosEventos.filter(e => {
      const inicio = new Date(e.dataInicio); inicio.setHours(0, 0, 0, 0);
      const fim = new Date(e.dataFim); fim.setHours(0, 0, 0, 0);
      return d >= inicio && d <= fim;
    });
  }

  corDoEvento(tipo: string): string { return corDoTipo(tipo); }
  labelDoEvento(tipo: string): string { return labelDoTipo(tipo); }
  formatarHora(data: any): string {
    const d = new Date(data);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + 'h';
  }

  // --- Geração de Calendário ---

  gerarCelulas() {
    this.celulas = [];
    const ano = this.dataAtual.getFullYear();
    const mes = this.dataAtual.getMonth();
    const primeiro = new Date(ano, mes, 1);
    let inicio = primeiro.getDay();
    inicio = (inicio === 0) ? 6 : inicio - 1;

    for (let i = inicio; i > 0; i--)
      this.celulas.push({ data: new Date(ano, mes, 1 - i), mesAtual: false });

    const ultimo = new Date(ano, mes + 1, 0).getDate();
    for (let i = 1; i <= ultimo; i++)
      this.celulas.push({ data: new Date(ano, mes, i), mesAtual: true });

    while (this.celulas.length < 42) {
      const d = new Date(this.celulas[this.celulas.length - 1].data);
      d.setDate(d.getDate() + 1);
      this.celulas.push({ data: d, mesAtual: false });
    }

    if (this.vista === 'semana') this.gerarDiasSemana();
  }

  gerarDiasSemana() {
    const d = new Date(this.dataAtual);
    const diaSemana = d.getDay();
    const diff = (diaSemana === 0) ? -6 : 1 - diaSemana;
    d.setDate(d.getDate() + diff);

    this.diasDaSemana = [];
    for (let i = 0; i < 7; i++) {
      this.diasDaSemana.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    this.diaSelecionadoSemana = new Date(this.dataAtual);
    this.atualizarEventosDoDia(this.diaSelecionadoSemana);
  }

  setVista(v: 'mes' | 'semana') {
    this.vista = v;
    this.gerarCelulas();
  }

  // --- Navegação ---

  anterior() { this.navegar(-1); }
  proximo() { this.navegar(1); }

  private navegar(dir: number) {
    const d = new Date(this.dataAtual);
    if (this.vista === 'mes') d.setMonth(d.getMonth() + dir);
    else d.setDate(d.getDate() + dir * 7);
    this.dataAtual = d;
    this.gerarCelulas();
    this.atualizarEventosDoDia(this.dataAtual);
  }

  onSlideChange(event: any) {
    const swiper = event.target.swiper;
    if (swiper.activeIndex > 1) this.proximo();
    else if (swiper.activeIndex < 1) this.anterior();
    setTimeout(() => swiper.slideTo(1, 0), 100);
  }

  // --- Utilitários ---
  mesmoDia = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  isHoje = (d: Date) => this.mesmoDia(d, this.hoje);
  isPassado = (d: Date) => {
    const h = new Date(); h.setHours(0, 0, 0, 0);
    return d < h && !this.isHoje(d);
  };

  ngOnDestroy() { this.sub?.unsubscribe(); }
}