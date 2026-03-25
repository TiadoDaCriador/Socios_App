// src/app/pages/documentos/documentos.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonButtons, IonMenuButton,
  IonTitle, IonContent, IonIcon,
  AlertController, ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  searchOutline, documentOutline,
  downloadOutline, trashOutline, shareOutline,
  eyeOutline, filterOutline,
} from 'ionicons/icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Browser } from '@capacitor/browser';

export interface Documento {
  id: number;
  nomeDocumento: string;
  nomeFicheiro: string;
  dataUpload: Date;
  tamanho?: string;
  url?: string; // URL pública vinda do servidor externo
}

type OrdemTipo = 'data-desc' | 'data-asc' | 'nome-asc' | 'nome-desc';

@Component({
  selector: 'app-documentos',
  templateUrl: './documentos.page.html',
  styleUrls: ['./documentos.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, TranslateModule,
    IonHeader, IonToolbar, IonButtons, IonMenuButton,
    IonTitle, IonContent, IonIcon,
  ],
})
export class DocumentosPage implements OnInit {

  pesquisa = '';
  ordem: OrdemTipo = 'data-desc';
  dataInicio = '';
  dataFim = '';
  mostrarFiltros = false;
  documentos: Documento[] = [];

  constructor(
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private translate: TranslateService,
  ) {
    addIcons({ searchOutline, documentOutline, downloadOutline, trashOutline, shareOutline, eyeOutline, filterOutline });
  }

  ngOnInit() {
    // Aqui no futuro: carregar documentos do servidor externo
    // Ex: this.documentosService.listar().subscribe(docs => this.documentos = docs);
  }

  get documentosFiltrados(): Documento[] {
    let lista = [...this.documentos];
    if (this.pesquisa.trim()) {
      const p = this.pesquisa.toLowerCase();
      lista = lista.filter(d =>
        d.nomeDocumento.toLowerCase().includes(p) ||
        d.nomeFicheiro.toLowerCase().includes(p)
      );
    }
    if (this.dataInicio) lista = lista.filter(d => d.dataUpload >= new Date(this.dataInicio));
    if (this.dataFim) {
      const df = new Date(this.dataFim);
      df.setHours(23, 59, 59);
      lista = lista.filter(d => d.dataUpload <= df);
    }
    lista.sort((a, b) => {
      switch (this.ordem) {
        case 'data-desc': return b.dataUpload.getTime() - a.dataUpload.getTime();
        case 'data-asc':  return a.dataUpload.getTime() - b.dataUpload.getTime();
        case 'nome-asc':  return a.nomeDocumento.localeCompare(b.nomeDocumento);
        case 'nome-desc': return b.nomeDocumento.localeCompare(a.nomeDocumento);
      }
    });
    return lista;
  }

  // Abre o PDF no browser do dispositivo
  async verPDF(doc: Documento) {
    if (!doc.url) { await this.showToast('Documento não disponível', 'warning'); return; }
    try {
      await Browser.open({ url: doc.url });
    } catch (e) {
      await this.showToast('Não foi possível abrir o documento', 'danger');
    }
  }

  // Faz download do PDF via URL pública e guarda em Documentos
  async downloadPDF(doc: Documento) {
    if (!doc.url) { await this.showToast('Download não disponível', 'warning'); return; }
    try {
      const blob = await (await fetch(doc.url)).blob();
      const base64 = await this.blobToBase64(blob);
      await Filesystem.writeFile({
        path: doc.nomeFicheiro,
        data: base64,
        directory: Directory.Documents,
        recursive: true,
      });
      await this.showToast(`"${doc.nomeFicheiro}" guardado em Documentos`, 'success');
    } catch (e) {
      await this.showToast('Erro ao fazer download', 'danger');
    }
  }

  // Partilha o documento via URL pública
  async partilhar(doc: Documento) {
    if (!doc.url) { await this.showToast('Não é possível partilhar este documento', 'warning'); return; }
    try {
      await Share.share({
        title: doc.nomeDocumento,
        url: doc.url,
        dialogTitle: `Partilhar ${doc.nomeDocumento}`,
      });
    } catch (e: any) {
      if (e?.message !== 'Share canceled') await this.showToast('Erro ao partilhar', 'danger');
    }
  }

  async eliminar(doc: Documento) {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant('DOCUMENTOS.ELIMINAR_HEADER'),
      message: `${this.translate.instant('DOCUMENTOS.ELIMINAR_MSG')} "${doc.nomeDocumento}"?`,
      buttons: [
        { text: this.translate.instant('DOCUMENTOS.CANCELAR'), role: 'cancel' },
        {
          text: this.translate.instant('DOCUMENTOS.ELIMINAR'),
          role: 'destructive',
          handler: async () => {
            this.documentos = this.documentos.filter(d => d.id !== doc.id);
            await this.showToast(this.translate.instant('DOCUMENTOS.ELIMINAR_SUCESSO'), 'danger');
          }
        },
      ],
    });
    await alert.present();
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve((r.result as string).split(',')[1]);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  }

  toggleOrdem(campo: 'data' | 'nome') {
    if (campo === 'data') this.ordem = this.ordem === 'data-desc' ? 'data-asc' : 'data-desc';
    else this.ordem = this.ordem === 'nome-asc' ? 'nome-desc' : 'nome-asc';
  }

  formatarData(d: Date): string { return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: '2-digit' }); }
  formatarHora(d: Date): string { return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }); }

  private async showToast(msg: string, color = 'medium') {
    const t = await this.toastCtrl.create({ message: msg, duration: 2500, position: 'bottom', color });
    await t.present();
  }
}