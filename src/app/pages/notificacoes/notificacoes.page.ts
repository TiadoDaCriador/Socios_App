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
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NotificacoesService, Notificacao, CategoriaNotif } from './notificacoes.service';

export { Notificacao, CategoriaNotif };

@Component({
  selector: 'app-notificacoes',
  templateUrl: './notificacoes.page.html',
  styleUrls: ['./notificacoes.page.scss'],
  standalone: true,
  imports: [
    CommonModule, TranslateModule,
    IonHeader, IonToolbar, IonButtons, IonMenuButton,
    IonTitle, IonContent, IonIcon, IonBadge,
  ],
})
export class NotificacoesPage implements OnInit, OnDestroy {

  filtroCategoria: CategoriaNotif | '' = '';
  mostrarFiltros = false;
  notificacoes: Notificacao[] = [];
  private sub!: Subscription;

  categorias: { valor: CategoriaNotif; label: string; icone: string; chave: string }[] = [
    { valor: 'eventos', label: 'Eventos', icone: 'calendar-outline', chave: 'NOTIFICACOES.EVENTOS' },
    { valor: 'quotas', label: 'Quotas', icone: 'wallet-outline', chave: 'NOTIFICACOES.QUOTAS' },
    { valor: 'convocatorias', label: 'Convocatórias', icone: 'megaphone-outline', chave: 'NOTIFICACOES.CONVOCATORIAS' },
    { valor: 'noticias', label: 'Notícias', icone: 'newspaper-outline', chave: 'NOTIFICACOES.NOTICIAS' },
  ];

  private rotasPorCategoria: Record<CategoriaNotif, string> = {
    eventos: '/tabs/eventos',
    quotas: '/tabs/quotas',
    convocatorias: '/tabs/convocatorias',
    noticias: '/tabs/documentos',
  };

  constructor(
    private notifService: NotificacoesService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private router: Router,
    private translate: TranslateService,
  ) {
    addIcons({ notificationsOutline, calendarOutline, walletOutline, megaphoneOutline, newspaperOutline, filterOutline, trashOutline, checkmarkDoneOutline });
  }

  ngOnInit() {
    this.sub = this.notifService.notificacoes$.subscribe(n => this.notificacoes = n);
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  get notificacoesFiltradas(): Notificacao[] {
    let lista = [...this.notificacoes];
    if (this.filtroCategoria) lista = lista.filter(n => n.categoria === this.filtroCategoria);
    return lista.sort((a, b) => b.data.getTime() - a.data.getTime());
  }

  get totalNaoLidas(): number { return this.notifService.totalNaoLidas; }

  abrirNotificacao(notif: Notificacao) {
    this.notifService.marcarLida(notif.id);
    const rota = this.rotasPorCategoria[notif.categoria];
    if (rota) this.router.navigateByUrl(rota);
  }

  marcarLida(notif: Notificacao) {
    if (!notif.lida) this.notifService.marcarLida(notif.id);
  }

  async eliminar(notif: Notificacao) {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant('NOTIFICACOES.ELIMINAR_HEADER'),
      message: this.translate.instant('NOTIFICACOES.ELIMINAR_MSG'),
      buttons: [
        { text: this.translate.instant('NOTIFICACOES.CANCELAR'), role: 'cancel' },
        { text: this.translate.instant('NOTIFICACOES.ELIMINAR'), role: 'destructive', handler: () => this.notifService.eliminar(notif.id) },
      ],
    });
    await alert.present();
  }

  async marcarTodasLidas() {
    this.notifService.marcarTodasLidas();
    const t = await this.toastCtrl.create({ message: this.translate.instant('NOTIFICACOES.MARCAR_LIDAS'), duration: 2000, position: 'bottom', color: 'success' });
    await t.present();
  }

  setFiltro(c: CategoriaNotif | '') { this.filtroCategoria = this.filtroCategoria === c ? '' : c; }

  labelCategoria(c: CategoriaNotif): string {
    const cat = this.categorias.find(x => x.valor === c);
    return cat ? this.translate.instant(cat.chave) : c;
  }

  iconeCategoria(c: CategoriaNotif): string {
    return this.categorias.find(x => x.valor === c)?.icone ?? 'notifications-outline';
  }

  corCategoria(c: CategoriaNotif): string {
    const mapa: Record<CategoriaNotif, string> = { eventos: 'cor-blue', quotas: 'cor-orange', convocatorias: 'cor-green', noticias: 'cor-red' };
    return mapa[c];
  }

  formatarTempo(d: Date): string {
    const diff = Math.floor((new Date().getTime() - d.getTime()) / 60000);
    if (diff < 60) return `${diff}m atrás`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h atrás`;
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
  }
}