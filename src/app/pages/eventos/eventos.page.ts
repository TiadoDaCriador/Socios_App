// src/app/pages/eventos/eventos.page.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonButtons, IonMenuButton,
  IonTitle, IonContent, IonIcon,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  searchOutline, calendarOutline, timeOutline,
  locationOutline, filterOutline, ellipsisVertical,
  chevronDownOutline, chevronUpOutline,
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { EventosService, EventoLista } from '../../services/eventos.service';
import { EventoDetalheModalComponent } from './evento-detalhe-modal';

export { EventoLista };

type OrdemTipo = 'data-asc' | 'data-desc' | 'nome-asc' | 'nome-desc';

@Component({
  selector: 'app-eventos',
  templateUrl: './eventos.page.html',
  styleUrls: ['./eventos.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonButtons, IonMenuButton,
    IonTitle, IonContent, IonIcon,
  ],
})
export class EventosPage implements OnInit, OnDestroy {

  pesquisa = '';
  ordem: OrdemTipo = 'data-desc';
  mostrarFiltros = false;
  filtroTipo = '';
  eventos: EventoLista[] = [];
  tiposDisponiveis: string[] = [];

  private sub!: Subscription;

  constructor(
    private modalCtrl:     ModalController,
    private eventosService: EventosService,
  ) {
    addIcons({
      searchOutline, calendarOutline, timeOutline,
      locationOutline, filterOutline, ellipsisVertical,
      chevronDownOutline, chevronUpOutline,
    });
  }

  ngOnInit() {
    // Subscreve ao serviço — atualiza automaticamente quando o calendário adicionar eventos
    this.sub = this.eventosService.eventos$.subscribe(eventos => {
      this.eventos = eventos;
      this.tiposDisponiveis = [...new Set(eventos.map(e => e.tipo))];
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  get eventosFiltrados(): EventoLista[] {
    let lista = [...this.eventos];

    if (this.pesquisa.trim()) {
      const p = this.pesquisa.toLowerCase();
      lista = lista.filter(e =>
        e.nome.toLowerCase().includes(p) ||
        e.local.toLowerCase().includes(p) ||
        e.tipo.toLowerCase().includes(p)
      );
    }

    if (this.filtroTipo) {
      lista = lista.filter(e => e.tipo === this.filtroTipo);
    }

    lista.sort((a, b) => {
      switch (this.ordem) {
        case 'data-asc':  return a.dataInicio.getTime() - b.dataInicio.getTime();
        case 'data-desc': return b.dataInicio.getTime() - a.dataInicio.getTime();
        case 'nome-asc':  return a.nome.localeCompare(b.nome);
        case 'nome-desc': return b.nome.localeCompare(a.nome);
      }
    });

    return lista;
  }

  async abrirDetalhe(evento: EventoLista) {
    const modal = await this.modalCtrl.create({
      component: EventoDetalheModalComponent,
      componentProps: { evento },
      initialBreakpoint: 0.75,
      breakpoints: [0, 0.75, 1],
      handleBehavior: 'cycle',
    });
    await modal.present();
  }

  setOrdem(o: OrdemTipo)      { this.ordem = o; }
  setFiltroTipo(tipo: string) { this.filtroTipo = this.filtroTipo === tipo ? '' : tipo; }

  formatarData(d: Date): string {
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }

  formatarHora(d: Date): string {
    return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  }
}