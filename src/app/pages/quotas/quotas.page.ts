// src/app/pages/quotas/quotas.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonButtons, IonMenuButton,
  IonTitle, IonContent, IonIcon, ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  filterOutline, chevronDownOutline, chevronUpOutline,
  walletOutline, checkmarkCircleOutline, alertCircleOutline,
  closeCircleOutline, timeOutline, calendarOutline,
  cashOutline, receiptOutline,
} from 'ionicons/icons';
import { QuotaDetalheModalComponent } from './quotas-detalhe-modal';

export type EstadoQuota = 'pago' | 'pendente' | 'vencido';
export type MetodoPagamento = 'mbway' | 'multibanco' | 'transferencia' | 'cartao';

export interface MovimentoQuota {
  id: number;
  data: Date;
  valor: number;
  metodo: MetodoPagamento;
  referencia?: string;
}

export interface Quota {
  id: number;
  descricao: string;
  valor: number;
  periodicidade: string;
  dataVencimento: Date;
  estado: EstadoQuota;
  movimentos: MovimentoQuota[];
}

@Component({
  selector: 'app-quotas',
  templateUrl: './quotas.page.html',
  styleUrls: ['./quotas.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonButtons, IonMenuButton,
    IonTitle, IonContent, IonIcon,
  ],
})
export class QuotasPage implements OnInit {

  filtroEstado: EstadoQuota | '' = '';
  mostrarFiltros = false;
  ordemDesc = true;

  // TODO: substituir por chamada ao API
  quotas: Quota[] = [
    {
      id: 1,
      descricao: 'Quota Mensal - Janeiro 2026',
      valor: 15.00,
      periodicidade: 'Mensal',
      dataVencimento: new Date(2026, 0, 31),
      estado: 'pago',
      movimentos: [
        { id: 1, data: new Date(2026, 0, 10), valor: 15.00, metodo: 'mbway', referencia: '912345678' },
      ],
    },
    {
      id: 2,
      descricao: 'Quota Mensal - Fevereiro 2026',
      valor: 15.00,
      periodicidade: 'Mensal',
      dataVencimento: new Date(2026, 1, 28),
      estado: 'pago',
      movimentos: [
        { id: 2, data: new Date(2026, 1, 5), valor: 15.00, metodo: 'multibanco', referencia: '123 456 789' },
      ],
    },
    {
      id: 3,
      descricao: 'Quota Mensal - Março 2026',
      valor: 15.00,
      periodicidade: 'Mensal',
      dataVencimento: new Date(2026, 2, 31),
      estado: 'pendente',
      movimentos: [],
    },
    {
      id: 4,
      descricao: 'Quota Anual 2025',
      valor: 120.00,
      periodicidade: 'Anual',
      dataVencimento: new Date(2025, 11, 31),
      estado: 'vencido',
      movimentos: [],
    },
  ];

  constructor(private modalCtrl: ModalController) {
    addIcons({
      filterOutline, chevronDownOutline, chevronUpOutline,
      walletOutline, checkmarkCircleOutline, alertCircleOutline,
      closeCircleOutline, timeOutline, calendarOutline,
      cashOutline, receiptOutline,
    });
  }

  ngOnInit() {}

  get quotasFiltradas(): Quota[] {
    let lista = [...this.quotas];

    if (this.filtroEstado) {
      lista = lista.filter(q => q.estado === this.filtroEstado);
    }

    lista.sort((a, b) => this.ordemDesc
      ? b.dataVencimento.getTime() - a.dataVencimento.getTime()
      : a.dataVencimento.getTime() - b.dataVencimento.getTime()
    );

    return lista;
  }

  get totalPendente(): number {
    return this.quotas
      .filter(q => q.estado !== 'pago')
      .reduce((acc, q) => acc + q.valor, 0);
  }

  get totalPago(): number {
    return this.quotas
      .filter(q => q.estado === 'pago')
      .reduce((acc, q) => acc + q.valor, 0);
  }

  async abrirDetalhe(quota: Quota) {
    const modal = await this.modalCtrl.create({
      component: QuotaDetalheModalComponent,
      componentProps: { quota },
      initialBreakpoint: 0.9,
      breakpoints: [0, 0.9],
      handleBehavior: 'cycle',
    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'pago') {
      // Atualiza o estado da quota após pagamento
      const q = this.quotas.find(q => q.id === quota.id);
      if (q) {
        q.estado = 'pago';
        q.movimentos = [...q.movimentos, data];
      }
      // TODO: Recarregar do API
    }
  }

  setFiltroEstado(e: EstadoQuota | '') {
    this.filtroEstado = this.filtroEstado === e ? '' : e;
  }

  toggleOrdem() { this.ordemDesc = !this.ordemDesc; }

  formatarData(d: Date): string {
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  formatarValor(v: number): string {
    return v.toFixed(2).replace('.', ',') + ' €';
  }

  iconEstado(e: EstadoQuota): string {
    return { pago: 'checkmark-circle-outline', pendente: 'time-outline', vencido: 'alert-circle-outline' }[e];
  }
}