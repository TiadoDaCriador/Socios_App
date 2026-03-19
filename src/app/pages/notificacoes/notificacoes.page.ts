// src/app/pages/notificacoes/notificacoes.page.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonButtons, IonMenuButton,
  IonTitle, IonContent, IonIcon, IonBadge,
  AlertController, ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  notificationsOutline, calendarOutline, walletOutline,
  megaphoneOutline, newspaperOutline, filterOutline,
  trashOutline, checkmarkDoneOutline,
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { NotificacoesService, Notificacao, CategoriaNotif } from './notificacoes.service';

export { Notificacao, CategoriaNotif };

@Component({
  selector: 'app-notificacoes',
  templateUrl: './notificacoes.page.html',
  styleUrls: ['./notificacoes.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonButtons, IonMenuButton,
    IonTitle, IonContent, IonIcon, IonBadge,
  ],
})
export class NotificacoesPage implements OnInit, OnDestroy {

  filtroCategoria: CategoriaNotif | '' = '';
  mostrarFiltros = false;
  notificacoes: Notificacao[] = [];
  private sub!: Subscription;

  categorias: { valor: CategoriaNotif; label: string; icone: string }[] = [
    { valor: 'eventos',       label: 'Eventos',       icone: 'calendar-outline'  },
    { valor: 'quotas',        label: 'Quotas',        icone: 'wallet-outline'    },
    { valor: 'convocatorias', label: 'Convocatórias', icone: 'megaphone-outline' },
    { valor: 'noticias',      label: 'Notícias',      icone: 'newspaper-outline' },
  ];

  constructor(
    private notifService: NotificacoesService,
    private alertCtrl:    AlertController,
    private toastCtrl:    ToastController,
  ) {
    addIcons({
      notificationsOutline, calendarOutline, walletOutline,
      megaphoneOutline, newspaperOutline, filterOutline,
      trashOutline, checkmarkDoneOutline,
    });
  }

  ngOnInit() {
    this.sub = this.notifService.notificacoes$.subscribe(n => this.notificacoes = n);
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  get notificacoesFiltradas(): Notificacao[] {
    let lista = [...this.notificacoes];
    if (this.filtroCategoria) {
      lista = lista.filter(n => n.categoria === this.filtroCategoria);
    }
    return lista.sort((a, b) => b.data.getTime() - a.data.getTime());
  }

  get totalNaoLidas(): number { return this.notifService.totalNaoLidas; }

  marcarLida(notif: Notificacao) {
    if (!notif.lida) this.notifService.marcarLida(notif.id);
  }

  async eliminar(notif: Notificacao) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar notificação',
      message: 'Tens a certeza?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => this.notifService.eliminar(notif.id) },
      ],
    });
    await alert.present();
  }

  async marcarTodasLidas() {
    this.notifService.marcarTodasLidas();
    const t = await this.toastCtrl.create({ message: 'Todas marcadas como lidas', duration: 2000, position: 'bottom', color: 'success' });
    await t.present();
  }

  setFiltro(c: CategoriaNotif | '') { this.filtroCategoria = this.filtroCategoria === c ? '' : c; }

  labelCategoria(c: CategoriaNotif): string {
    return this.categorias.find(x => x.valor === c)?.label ?? c;
  }

  iconeCategoria(c: CategoriaNotif): string {
    return this.categorias.find(x => x.valor === c)?.icone ?? 'notifications-outline';
  }

  corCategoria(c: CategoriaNotif): string {
    const mapa: Record<CategoriaNotif, string> = {
      eventos: 'cor-blue', quotas: 'cor-orange', convocatorias: 'cor-green', noticias: 'cor-purple',
    };
    return mapa[c];
  }

  formatarTempo(d: Date): string {
    const diff = Math.floor((new Date().getTime() - d.getTime()) / 60000);
    if (diff < 60)   return `${diff}m atrás`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h atrás`;
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
  }
}