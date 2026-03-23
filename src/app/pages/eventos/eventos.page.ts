// src/app/pages/eventos/eventos.page.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonButtons, IonMenuButton,
  IonTitle, IonContent, IonIcon, AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  searchOutline, calendarOutline, timeOutline,
  locationOutline, filterOutline, trashOutline,
  chevronDownOutline, chevronUpOutline, pricetagOutline,
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { EventosService, EventoLista } from '../../services/eventos.service';
import { TIPOS_EVENTO } from '../../shared/tipos-eventos';

export { EventoLista };
type OrdemTipo = 'data-asc' | 'data-desc' | 'nome-asc' | 'nome-desc';

@Component({
  selector: 'app-eventos',
  templateUrl: './eventos.page.html',
  styleUrls: ['./eventos.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, TranslateModule,
    IonHeader, IonToolbar, IonButtons, IonMenuButton,
    IonTitle, IonContent, IonIcon,
  ],
})
export class EventosPage implements OnInit, OnDestroy {

  pesquisa = '';
  ordem: OrdemTipo = 'data-desc';
  mostrarFiltros = false;
  eventos: EventoLista[] = [];
  private sub!: Subscription;

  constructor(
    private eventosService: EventosService,
    private alertCtrl: AlertController,
    private translate: TranslateService,
  ) {
    addIcons({
      searchOutline, calendarOutline, timeOutline,
      locationOutline, filterOutline, trashOutline,
      chevronDownOutline, chevronUpOutline, pricetagOutline,
    });
  }

  ngOnInit() {
    this.sub = this.eventosService.eventos$.subscribe(eventos => {
      this.eventos = eventos;
    });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

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
    lista.sort((a, b) => {
      switch (this.ordem) {
        case 'data-asc': return a.dataInicio.getTime() - b.dataInicio.getTime();
        case 'data-desc': return b.dataInicio.getTime() - a.dataInicio.getTime();
        case 'nome-asc': return a.nome.localeCompare(b.nome);
        case 'nome-desc': return b.nome.localeCompare(a.nome);
      }
    });
    return lista;
  }

  async eliminar(evento: EventoLista) {
    const header = this.translate.instant('EVENTOS.ELIMINAR');
    const message = `${this.translate.instant('EVENTOS.ELIMINAR_CONFIRM')} "${evento.nome}"?`;
    const alert = await this.alertCtrl.create({
      header, message,
      buttons: [
        { text: this.translate.instant('COMUM.CANCELAR'), role: 'cancel' },
        {
          text: this.translate.instant('COMUM.ELIMINAR'), role: 'destructive',
          cssClass: 'alert-btn-danger', handler: () => this.eventosService.eliminar(evento.id)
        },
      ],
    });
    await alert.present();
  }

  labelTipo(valor: string): string {
    return TIPOS_EVENTO.find(t => t.valor === valor)?.label ?? valor;
  }

  setOrdem(o: OrdemTipo) { this.ordem = o; }

  formatarData(d: Date): string {
    return d.toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: '2-digit', year: '2-digit' });
  }

  formatarHora(d: Date): string {
    return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  }
}