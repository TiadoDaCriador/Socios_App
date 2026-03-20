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
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Browser } from '@capacitor/browser';
import { NotificacoesService } from '../notificacoes/notificacoes.service';

export interface Documento {
  id: number;
  nomeDocumento: string;
  nomeFicheiro: string;
  dataUpload: Date;
  tamanho?: string;
  caminhoLocal?: string; // caminho no dispositivo
  url?: string;          // URL do servidor (quando disponível)
}

type OrdemTipo = 'data-desc' | 'data-asc' | 'nome-asc' | 'nome-desc';

@Component({
  selector: 'app-documentos',
  templateUrl: './documentos.page.html',
  styleUrls: ['./documentos.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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

  // TODO: substituir por chamada ao API
  documentos: Documento[] = [];

  constructor(
    private alertCtrl:    AlertController,
    private toastCtrl:    ToastController,
    private notifService: NotificacoesService,
  ) {
    addIcons({
      searchOutline, addOutline, documentOutline,
      downloadOutline, trashOutline, shareOutline,
      eyeOutline, filterOutline,
    });
  }

  ngOnInit() {}

  get documentosFiltrados(): Documento[] {
    let lista = [...this.documentos];

    if (this.pesquisa.trim()) {
      const p = this.pesquisa.toLowerCase();
      lista = lista.filter(d =>
        d.nomeDocumento.toLowerCase().includes(p) ||
        d.nomeFicheiro.toLowerCase().includes(p)
      );
    }

    if (this.dataInicio) {
      const di = new Date(this.dataInicio);
      lista = lista.filter(d => d.dataUpload >= di);
    }

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

  // ─── Pré-visualização ─────────────────────────────────────
  async verPDF(doc: Documento) {
    try {
      if (doc.caminhoLocal) {
        // Abre ficheiro local com o browser nativo do dispositivo
        await Browser.open({ url: doc.caminhoLocal });
      } else if (doc.url) {
        await Browser.open({ url: doc.url });
      } else {
        // TODO: this.documentosService.getUrl(doc.id).subscribe(url => Browser.open({ url }))
        await this.showToast('Documento não disponível', 'warning');
      }
    } catch (e) {
      console.error('Erro ao abrir PDF:', e);
      await this.showToast('Não foi possível abrir o documento', 'danger');
    }
  }

  // ─── Download ─────────────────────────────────────────────
  async downloadPDF(doc: Documento) {
    try {
      if (doc.caminhoLocal) {
        // Ficheiro já está no dispositivo — copia para Downloads
        const conteudo = await Filesystem.readFile({
          path: doc.caminhoLocal,
        });

        await Filesystem.writeFile({
          path:      `Download/${doc.nomeFicheiro}`,
          data:      conteudo.data,
          directory: Directory.Documents,
          recursive: true,
        });

        await this.showToast(`"${doc.nomeFicheiro}" guardado em Documentos`, 'success');

      } else if (doc.url) {
        // Faz download da URL e guarda no dispositivo
        const response = await fetch(doc.url);
        const blob     = await response.blob();
        const base64   = await this.blobToBase64(blob);

        await Filesystem.writeFile({
          path:      doc.nomeFicheiro,
          data:      base64,
          directory: Directory.Documents,
          recursive: true,
        });

        await this.showToast(`"${doc.nomeFicheiro}" guardado em Documentos`, 'success');

      } else {
        // TODO: this.documentosService.download(doc.id)
        await this.showToast('Download não disponível', 'warning');
      }
    } catch (e) {
      console.error('Erro no download:', e);
      await this.showToast('Erro ao fazer download', 'danger');
    }
  }

  // ─── Partilhar ────────────────────────────────────────────
  async partilhar(doc: Documento) {
    try {
      if (doc.caminhoLocal) {
        await Share.share({
          title: doc.nomeDocumento,
          url:   doc.caminhoLocal,
          dialogTitle: `Partilhar ${doc.nomeDocumento}`,
        });
      } else if (doc.url) {
        await Share.share({
          title: doc.nomeDocumento,
          url:   doc.url,
          dialogTitle: `Partilhar ${doc.nomeDocumento}`,
        });
      } else {
        await this.showToast('Não é possível partilhar este documento', 'warning');
      }
    } catch (e: any) {
      if (e?.message !== 'Share canceled') {
        await this.showToast('Erro ao partilhar', 'danger');
      }
    }
  }

  // ─── Eliminar ─────────────────────────────────────────────
  async eliminar(doc: Documento) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar Documento',
      message: `Tens a certeza que queres eliminar "${doc.nomeDocumento}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            // Remove ficheiro local se existir
            if (doc.caminhoLocal) {
              try {
                await Filesystem.deleteFile({ path: doc.caminhoLocal });
              } catch (e) {
                console.warn('Ficheiro local não encontrado:', e);
              }
            }
            this.documentos = this.documentos.filter(d => d.id !== doc.id);
            // TODO: this.documentosService.eliminar(doc.id).subscribe()
            await this.showToast('Documento eliminado', 'danger');
          },
        },
      ],
    });
    await alert.present();
  }

  // ─── Upload ───────────────────────────────────────────────
  triggerUpload() {
    const input = window.document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.onchange = async (e: any) => {
      const file: File = e.target.files[0];
      if (!file) return;
      if (file.type !== 'application/pdf') {
        await this.showToast('Apenas ficheiros PDF são aceites', 'danger');
        return;
      }
      await this.processarUpload(file);
    };
    input.click();
  }

  private async processarUpload(file: File) {
    const alert = await this.alertCtrl.create({
      header: 'Nome do Documento',
      inputs: [{ name: 'nome', type: 'text', placeholder: 'Ex: Ata Reunião Janeiro', value: file.name.replace('.pdf', '') }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (!data.nome?.trim()) return false;

            try {
              // Guarda o ficheiro no dispositivo
              const base64 = await this.fileToBase64(file);
              const resultado = await Filesystem.writeFile({
                path:      file.name,
                data:      base64,
                directory: Directory.Documents,
                recursive: true,
              });

              const novoDoc: Documento = {
                id:            Date.now(),
                nomeDocumento: data.nome.trim(),
                nomeFicheiro:  file.name,
                dataUpload:    new Date(),
                tamanho:       `${Math.round(file.size / 1024)} KB`,
                caminhoLocal:  resultado.uri,
              };

              this.documentos = [novoDoc, ...this.documentos];

              // Cria notificação
              this.notifService.adicionar({
                titulo:    `Novo Documento: ${data.nome.trim()}`,
                mensagem:  `O ficheiro "${file.name}" foi carregado com sucesso.`,
                categoria: 'noticias',
              });

              // TODO: this.documentosService.upload(novoDoc).subscribe()
              await this.showToast('Documento carregado com sucesso!', 'success');

            } catch (e) {
              console.error('Erro no upload:', e);
              await this.showToast('Erro ao guardar documento', 'danger');
            }
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  // ─── Helpers ──────────────────────────────────────────────
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  toggleOrdem(campo: 'data' | 'nome') {
    if (campo === 'data') {
      this.ordem = this.ordem === 'data-desc' ? 'data-asc' : 'data-desc';
    } else {
      this.ordem = this.ordem === 'nome-asc' ? 'nome-desc' : 'nome-asc';
    }
  }

  formatarData(d: Date): string {
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }

  formatarHora(d: Date): string {
    return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  }

  private async showToast(msg: string, color = 'medium') {
    const t = await this.toastCtrl.create({ message: msg, duration: 2500, position: 'bottom', color });
    await t.present();
  }
}