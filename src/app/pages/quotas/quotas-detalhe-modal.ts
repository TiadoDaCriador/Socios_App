// src/app/pages/quotas/quota-detalhe-modal.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonButton, IonIcon, ModalController, ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline, calendarOutline, cashOutline, timeOutline,
  checkmarkCircleOutline, alertCircleOutline, downloadOutline,
  phonePortraitOutline, cardOutline, swapHorizontalOutline, buildOutline,
  receiptOutline,
} from 'ionicons/icons';
import { Quota, MetodoPagamento, MovimentoQuota } from './quotas.page';
import { QuotasService } from './quotas.service';

@Component({
  selector: 'app-quota-detalhe-modal',
templateUrl: './quotas-detalhe-modal.html',
styleUrls: ['./quotas-detalhe-modal.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonButton, IonIcon,
  ],
})
export class QuotaDetalheModalComponent implements OnInit {

  @Input() quota!: Quota;

  mostrarPagamento = false;
  metodoPagamento: MetodoPagamento | '' = '';
  isSaving = false;
  isExporting = false;

  metodos: { valor: MetodoPagamento; label: string; icone: string }[] = [
    { valor: 'mbway',        label: 'MB Way',               icone: 'phone-portrait-outline' },
    { valor: 'multibanco',   label: 'Referência Multibanco', icone: 'card-outline'           },
    { valor: 'transferencia',label: 'Transferência Bancária', icone: 'swap-horizontal-outline'},
    { valor: 'cartao',       label: 'Cartão de Crédito',    icone: 'card-outline'           },
  ];

  constructor(
    private modalCtrl:    ModalController,
    private toastCtrl:    ToastController,
    private quotasService: QuotasService,
  ) {
    addIcons({
      closeOutline, calendarOutline, cashOutline, timeOutline,
      checkmarkCircleOutline, alertCircleOutline, downloadOutline,
      phonePortraitOutline, cardOutline, swapHorizontalOutline, buildOutline,
      receiptOutline,
    });
  }

  ngOnInit() {}

  fechar() { this.modalCtrl.dismiss(); }

  async pagar() {
    if (!this.metodoPagamento) return;

    this.isSaving = true;

    // TODO: Chamar API de pagamento
    // this.quotaService.pagar(this.quota.id, this.metodoPagamento).subscribe(...)

    // Simula o pagamento
    await new Promise(r => setTimeout(r, 1000));

    const novoMovimento: MovimentoQuota = {
      id: Date.now(),
      data: new Date(),
      valor: this.quota.valor,
      metodo: this.metodoPagamento as MetodoPagamento,
    };

    this.isSaving = false;

    // Cria notificação de pagamento confirmado
    this.quotasService.notificarPagamento(this.quota);

    const toast = await this.toastCtrl.create({
      message: 'Pagamento efetuado com sucesso!',
      duration: 2500,
      position: 'bottom',
      color: 'success',
    });
    await toast.present();

    this.modalCtrl.dismiss(novoMovimento, 'pago');
  }

  async exportarPDF() {
    this.isExporting = true;

    // TODO: Exportar PDF via API ou jsPDF
    // const pdf = await this.quotaService.exportarRecibo(this.quota.id);

    await new Promise(r => setTimeout(r, 1000));
    this.isExporting = false;

    const toast = await this.toastCtrl.create({
      message: 'PDF exportado!',
      duration: 2000,
      position: 'bottom',
      color: 'success',
    });
    await toast.present();
  }

  labelMetodo(m: MetodoPagamento): string {
    return this.metodos.find(x => x.valor === m)?.label ?? m;
  }

  formatarData(d: Date): string {
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  formatarHora(d: Date): string {
    return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  }

  formatarValor(v: number): string {
    return v.toFixed(2).replace('.', ',') + ' €';
  }

  get podePagar(): boolean {
    return this.quota.estado !== 'pago';
  }
}