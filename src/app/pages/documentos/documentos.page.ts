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
  searchOutline, addOutline, documentOutline,
  downloadOutline, trashOutline, shareOutline,
  eyeOutline, filterOutline,
} from 'ionicons/icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Browser } from '@capacitor/browser';
import { NotificacoesService } from '../notificacoes/notificacoes.service';

export interface Documento {
  id: number; nomeDocumento: string; nomeFicheiro: string;
  dataUpload: Date; tamanho?: string; caminhoLocal?: string; url?: string;
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
    private notifService: NotificacoesService,
    private translate: TranslateService,
  ) {
    addIcons({ searchOutline, addOutline, documentOutline, downloadOutline, trashOutline, shareOutline, eyeOutline, filterOutline });
  }

  ngOnInit() { }

  get documentosFiltrados(): Documento[] {
    let lista = [...this.documentos];
    if (this.pesquisa.trim()) {
      const p = this.pesquisa.toLowerCase();
      lista = lista.filter(d => d.nomeDocumento.toLowerCase().includes(p) || d.nomeFicheiro.toLowerCase().includes(p));
    }
    if (this.dataInicio) lista = lista.filter(d => d.dataUpload >= new Date(this.dataInicio));
    if (this.dataFim) { const df = new Date(this.dataFim); df.setHours(23, 59, 59); lista = lista.filter(d => d.dataUpload <= df); }
    lista.sort((a, b) => {
      switch (this.ordem) {
        case 'data-desc': return b.dataUpload.getTime() - a.dataUpload.getTime();
        case 'data-asc': return a.dataUpload.getTime() - b.dataUpload.getTime();
        case 'nome-asc': return a.nomeDocumento.localeCompare(b.nomeDocumento);
        case 'nome-desc': return b.nomeDocumento.localeCompare(a.nomeDocumento);
      }
    });
    return lista;
  }

  async verPDF(doc: Documento) {
    try {
      if (doc.caminhoLocal) await Browser.open({ url: doc.caminhoLocal });
      else if (doc.url) await Browser.open({ url: doc.url });
      else await this.showToast('Documento não disponível', 'warning');
    } catch (e) { await this.showToast('Não foi possível abrir o documento', 'danger'); }
  }

  async downloadPDF(doc: Documento) {
    try {
      if (doc.caminhoLocal) {
        const conteudo = await Filesystem.readFile({ path: doc.caminhoLocal });
        await Filesystem.writeFile({ path: `Download/${doc.nomeFicheiro}`, data: conteudo.data, directory: Directory.Documents, recursive: true });
        await this.showToast(`"${doc.nomeFicheiro}" guardado em Documentos`, 'success');
      } else if (doc.url) {
        const blob = await (await fetch(doc.url)).blob();
        const base64 = await this.blobToBase64(blob);
        await Filesystem.writeFile({ path: doc.nomeFicheiro, data: base64, directory: Directory.Documents, recursive: true });
        await this.showToast(`"${doc.nomeFicheiro}" guardado em Documentos`, 'success');
      } else await this.showToast('Download não disponível', 'warning');
    } catch (e) { await this.showToast('Erro ao fazer download', 'danger'); }
  }

  async partilhar(doc: Documento) {
    try {
      const url = doc.caminhoLocal ?? doc.url;
      if (url) await Share.share({ title: doc.nomeDocumento, url, dialogTitle: `Partilhar ${doc.nomeDocumento}` });
      else await this.showToast('Não é possível partilhar este documento', 'warning');
    } catch (e: any) { if (e?.message !== 'Share canceled') await this.showToast('Erro ao partilhar', 'danger'); }
  }

  async eliminar(doc: Documento) {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant('DOCUMENTOS.ELIMINAR_HEADER'),
      message: `${this.translate.instant('DOCUMENTOS.ELIMINAR_MSG')} "${doc.nomeDocumento}"?`,
      buttons: [
        { text: this.translate.instant('DOCUMENTOS.CANCELAR'), role: 'cancel' },
        {
          text: this.translate.instant('DOCUMENTOS.ELIMINAR'), role: 'destructive', handler: async () => {
            if (doc.caminhoLocal) { try { await Filesystem.deleteFile({ path: doc.caminhoLocal }); } catch (e) { } }
            this.documentos = this.documentos.filter(d => d.id !== doc.id);
            await this.showToast(this.translate.instant('DOCUMENTOS.ELIMINAR_HEADER'), 'danger');
          }
        },
      ],
    });
    await alert.present();
  }

  triggerUpload() {
    const input = window.document.createElement('input');
    input.type = 'file'; input.accept = 'application/pdf';
    input.onchange = async (e: any) => {
      const file: File = e.target.files[0];
      if (!file) return;
      if (file.type !== 'application/pdf') { await this.showToast('Apenas ficheiros PDF são aceites', 'danger'); return; }
      await this.processarUpload(file);
    };
    input.click();
  }

  private async processarUpload(file: File) {
    const alert = await this.alertCtrl.create({
      header: 'Nome do Documento',
      inputs: [{ name: 'nome', type: 'text', placeholder: 'Ex: Ata Reunião Janeiro', value: file.name.replace('.pdf', '') }],
      buttons: [
        { text: this.translate.instant('COMUM.CANCELAR'), role: 'cancel' },
        {
          text: this.translate.instant('COMUM.GUARDAR'), handler: async (data) => {
            if (!data.nome?.trim()) return false;
            try {
              const base64 = await this.fileToBase64(file);
              const resultado = await Filesystem.writeFile({ path: file.name, data: base64, directory: Directory.Documents, recursive: true });
              const novoDoc: Documento = { id: Date.now(), nomeDocumento: data.nome.trim(), nomeFicheiro: file.name, dataUpload: new Date(), tamanho: `${Math.round(file.size / 1024)} KB`, caminhoLocal: resultado.uri };
              this.documentos = [novoDoc, ...this.documentos];
              this.notifService.adicionar({ titulo: `Novo Documento: ${data.nome.trim()}`, mensagem: `O ficheiro "${file.name}" foi carregado com sucesso.`, categoria: 'noticias' });
              await this.showToast(this.translate.instant('DOCUMENTOS.UPLOAD_SUCESSO'), 'success');
            } catch (e) { await this.showToast('Erro ao guardar documento', 'danger'); }
            return true;
          }
        },
      ],
    });
    await alert.present();
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve((r.result as string).split(',')[1]); r.onerror = reject; r.readAsDataURL(file); });
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve((r.result as string).split(',')[1]); r.onerror = reject; r.readAsDataURL(blob); });
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