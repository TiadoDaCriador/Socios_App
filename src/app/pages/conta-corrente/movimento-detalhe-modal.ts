// src/app/pages/conta-corrente/movimento-detalhe-modal.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonButton, IonIcon, ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
    closeOutline, documentTextOutline, calendarOutline,
    timeOutline, cashOutline, cardOutline, downloadOutline,
} from 'ionicons/icons';
import { Movimento } from './conta-corrente.page';

@Component({
    selector: 'app-movimento-detalhe-modal',
    templateUrl: './movimento-detalhe.modal.html',
    styleUrls: ['./movimento-detalhe-modal.scss'],
    standalone: true,
    imports: [
        CommonModule,
        IonHeader, IonToolbar, IonTitle, IonContent,
        IonButtons, IonButton, IonIcon,
    ],
})
export class MovimentoDetalheModalComponent {

    @Input() movimento!: Movimento;
    exportando = false;

    constructor(private modalCtrl: ModalController) {
        addIcons({
            closeOutline, documentTextOutline, calendarOutline,
            timeOutline, cashOutline, cardOutline, downloadOutline,
        });
    }

    fechar() {
        this.modalCtrl.dismiss();
    }

    async exportarPDF() {
        this.exportando = true;

        // TODO: Implementar exportação PDF quando tiveres o API
        // Opção 1 — PDF gerado no servidor:
        // const pdf = await this.movimentosService.exportarPDF(this.movimento.id);
        // this.fileService.download(pdf, `movimento-${this.movimento.id}.pdf`);

        // Opção 2 — PDF gerado no cliente com jsPDF:
        // import('jspdf').then(({ jsPDF }) => {
        //   const doc = new jsPDF();
        //   doc.text(`Tipo: ${this.movimento.tipo}`, 10, 10);
        //   doc.text(`Descrição: ${this.movimento.descricao}`, 10, 20);
        //   doc.text(`Data: ${this.formatarData(this.movimento.data)}`, 10, 30);
        //   doc.text(`Valor: ${this.formatarValor(this.movimento.valor)}`, 10, 40);
        //   doc.save(`movimento-${this.movimento.id}.pdf`);
        // });

        // Simulação por agora
        setTimeout(() => { this.exportando = false; }, 1500);
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
}