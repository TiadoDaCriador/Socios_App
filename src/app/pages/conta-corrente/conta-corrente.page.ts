// src/app/pages/conta-corrente/conta-corrente.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonButtons, IonMenuButton,
  IonTitle, IonContent, IonIcon, ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  searchOutline, filterOutline, chevronDownOutline,
  chevronUpOutline, trendingDownOutline, walletOutline,
} from 'ionicons/icons';
import { MovimentoDetalheModalComponent } from './movimento-detalhe-modal';

export interface Movimento {
  id: number;
  descricao: string;
  data: Date;
  valor: number;
  conta: string;
}

@Component({
  selector: 'app-conta-corrente',
  templateUrl: './conta-corrente.page.html',
  styleUrls: ['./conta-corrente.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonButtons, IonMenuButton,
    IonTitle, IonContent, IonIcon,
  ],
})
export class ContaCorrentePage implements OnInit {

  pesquisa = '';
  dataInicio = '';
  dataFim = '';
  mostrarFiltros = false;
  ordemDesc = true;
  limite = 10; // últimas N despesas
  limitesDisponiveis = [5, 10, 20, 50, 0]; // 0 = todas

  // TODO: substituir por chamada ao API
  movimentos: Movimento[] = [];

  constructor(private modalCtrl: ModalController) {
    addIcons({
      searchOutline, filterOutline, chevronDownOutline,
      chevronUpOutline, trendingDownOutline, walletOutline,
    });
  }

  ngOnInit() {
    // Dados de teste — apagar quando ligar ao API
    this.movimentos = [
      { id: 1, descricao: 'Pagamento Quotas - Rui Puga (sócio n.º 1) - Taxa MB', data: new Date(2026, 2, 18, 9, 30), valor: 0.52, conta: 'CA' },
      { id: 2, descricao: 'Pagamento Quotas - Alexandre Fernandes (sócio n.º 9004) - Taxa', data: new Date(2026, 2, 18, 9, 21), valor: 1.35, conta: 'CA' },
      { id: 3, descricao: 'Transferência bancária - Taxa processamento', data: new Date(2026, 2, 15, 10, 0), valor: 2.50, conta: 'CA' },
    ];
  }

  get movimentosFiltrados(): Movimento[] {
    let lista = [...this.movimentos];

    // Pesquisa por descrição
    if (this.pesquisa.trim()) {
      const p = this.pesquisa.toLowerCase();
      lista = lista.filter(m => m.descricao.toLowerCase().includes(p));
    }

    // Filtro por período
    if (this.dataInicio) {
      const di = new Date(this.dataInicio);
      lista = lista.filter(m => m.data >= di);
    }
    if (this.dataFim) {
      const df = new Date(this.dataFim);
      df.setHours(23, 59, 59);
      lista = lista.filter(m => m.data <= df);
    }

    // Ordenação
    lista.sort((a, b) => this.ordemDesc
      ? b.data.getTime() - a.data.getTime()
      : a.data.getTime() - b.data.getTime()
    );

    // Limite de resultados (0 = todas)
    if (this.limite > 0) {
      lista = lista.slice(0, this.limite);
    }

    return lista;
  }

  get saldoTotal(): number {
    return this.movimentos.reduce((acc, m) => acc - m.valor, 0);
  }

  get valorPeriodo(): number {
    return this.movimentosFiltrados.reduce((acc, m) => acc - m.valor, 0);
  }

  async abrirDetalhe(mov: Movimento) {
    const modal = await this.modalCtrl.create({
      component: MovimentoDetalheModalComponent,
      componentProps: { movimento: mov },
      initialBreakpoint: 0.85,
      breakpoints: [0, 0.85],
      handleBehavior: 'cycle',
    });
    await modal.present();
  }

  toggleOrdem() { this.ordemDesc = !this.ordemDesc; }

  formatarData(d: Date): string {
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }

  formatarHora(d: Date): string {
    return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  }

  formatarValor(v: number): string {
    return v.toFixed(2).replace('.', ',') + ' €';
  }
}