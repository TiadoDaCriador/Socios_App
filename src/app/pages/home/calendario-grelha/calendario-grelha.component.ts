import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { EventoModalComponent } from '../../calendario/eventomodal/eventomodal.component';
import { EventosService, EventoLista } from '../../../services/eventos.service';

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
  selector: 'app-calendario-grelha',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './calendario-grelha.component.html',
  styleUrls: ['./calendario-grelha.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CalendarioGrelhaComponent implements OnInit, OnDestroy {

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

  get tituloNavegacao(): string {
    const ano = this.dataAtual.getFullYear();
    const mes = this.meses[this.dataAtual.getMonth()];
    if (this.vista === 'mes') return `${mes} ${ano}`;
    if (this.vista === 'semana') {
      const dias = this.diasDaSemana;
      const ini = dias[0], fim = dias[6];
      const mI = this.meses[ini.getMonth()], mF = this.meses[fim.getMonth()];
      return mI === mF
        ? `${ini.getDate()}–${fim.getDate()} ${mI} ${ano}`
        : `${ini.getDate()} ${mI} – ${fim.getDate()} ${mF} ${ano}`;
    }
    return `${this.dataAtual.getDate()} ${mes} ${ano}`;
  }

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

  isHoje(data: Date): boolean {
    return data.getDate() === this.hoje.getDate() &&
           data.getMonth() === this.hoje.getMonth() &&
           data.getFullYear() === this.hoje.getFullYear();
  }

  private mesmoDia(a: Date, b: Date): boolean {
    return a.getDate() === b.getDate() &&
           a.getMonth() === b.getMonth() &&
           a.getFullYear() === b.getFullYear();
  }

  eventosNoDia(data: Date): Evento[] {
    return this.eventos.filter(ev => this.mesmoDia(new Date(ev.data), data));
  }

  eventoNaHora(dia: Date, hora: string): Evento | undefined {
    return this.eventosNoDia(dia).find(ev => ev.hora?.startsWith(hora.slice(0, 2)));
  }

  async abrirModalNovoEvento(data: Date) {
    const modal = await this.modalCtrl.create({
      component: EventoModalComponent,
      componentProps: { data },
    });
    await modal.present();
    const { data: res } = await modal.onWillDismiss();
    if (res) {
      this.eventosService.adicionarDoCalendario({
        titulo: res.titulo, data: res.data,
        hora: res.hora, cor: res.cor, local: res.local,
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
    const { data: res, role } = await modal.onWillDismiss();
    if (role === 'eliminar') { this.eventosService.eliminar(ev.id); return; }
    if (res) {
      this.eventosService.atualizar(ev.id, {
        nome: res.titulo, cor: res.cor,
        dataInicio: res.data, dataFim: res.data, local: res.local ?? '',
      });
    }
  }

  anterior() {
    const d = new Date(this.dataAtual);
    if (this.vista === 'mes') d.setMonth(d.getMonth() - 1);
    else if (this.vista === 'semana') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    this.dataAtual = d; this.gerarCelulas();
  }

  proximo() {
    const d = new Date(this.dataAtual);
    if (this.vista === 'mes') d.setMonth(d.getMonth() + 1);
    else if (this.vista === 'semana') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    this.dataAtual = d; this.gerarCelulas();
  }

  irParaHoje() { this.dataAtual = new Date(); this.gerarCelulas(); }

  setVista(v: VistaType) { this.vista = v; this.gerarCelulas(); }

  gerarCelulas() {
    this.celulas = [];
    const ano = this.dataAtual.getFullYear();
    const mes = this.dataAtual.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    let ini = primeiroDia.getDay();
    ini = ini === 0 ? 6 : ini - 1;
    for (let i = ini - 1; i >= 0; i--)
      this.celulas.push({ data: new Date(ano, mes, -i), mesAtual: false });
    for (let i = 1; i <= ultimoDia.getDate(); i++)
      this.celulas.push({ data: new Date(ano, mes, i), mesAtual: true });
    const resto = 42 - this.celulas.length;
    for (let i = 1; i <= resto; i++)
      this.celulas.push({ data: new Date(ano, mes + 1, i), mesAtual: false });
  }

  private eventoListaParaEvento(e: EventoLista): Evento {
    const d = new Date(e.dataInicio);
    return {
      id: e.id as unknown as number,
      titulo: e.nome,
      data: d,
      hora: `${String(d.getHours()).padStart(2, '0')}h${String(d.getMinutes()).padStart(2, '0')}`,
      cor: e.cor,
      local: e.local,
    };
  }
}