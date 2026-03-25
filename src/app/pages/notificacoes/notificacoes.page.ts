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
  newspaperOutline, trashOutline, checkmarkDoneOutline, filterOutline,
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NotificacoesService, Notificacao, CategoriaNotif } from './notificacoes.service';

@Component({
  selector: 'app-notificacoes',
  templateUrl: './notificacoes.page.html',
  styleUrls: ['./notificacoes.page.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonIcon, IonBadge],
})
export class NotificacoesPage implements OnInit, OnDestroy {
  filtroCategoria: CategoriaNotif | '' = '';
  mostrarFiltros = false;
  notificacoes: Notificacao[] = [];
  private sub!: Subscription;

  categorias: { valor: CategoriaNotif; label: string; icone: string; chave: string }[] = [
    { valor: 'eventos',    label: 'Eventos',  icone: 'calendar-outline',  chave: 'NOTIFICACOES.EVENTOS' },
    { valor: 'quotas',     label: 'Quotas',   icone: 'wallet-outline',    chave: 'NOTIFICACOES.QUOTAS' },
    { valor: 'noticias',   label: 'Notícias', icone: 'newspaper-outline', chave: 'NOTIFICACOES.NOTICIAS' },
  ];

  private rotasPorCategoria: Record<CategoriaNotif, string> = {
    eventos:  '/tabs/eventos',
    quotas:   '/tabs/quotas',
    noticias: '/tabs/documentos',
  };

  constructor(
    private notifService: NotificacoesService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private router: Router,
    private translate: TranslateService,
  ) {
    addIcons({ notificationsOutline, calendarOutline, walletOutline, newspaperOutline, trashOutline, checkmarkDoneOutline, filterOutline });
  }

  ngOnInit() {
    this.sub = this.notifService.notificacoes$.subscribe(n => this.notificacoes = n);
  }

  ngOnDestroy() { if (this.sub) this.sub.unsubscribe(); }

  get notificacoesFiltradas(): Notificacao[] {
    let lista = [...this.notificacoes];
    if (this.filtroCategoria) lista = lista.filter(n => n.categoria === this.filtroCategoria);
    return lista.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }

  get totalNaoLidas(): number { return this.notifService.totalNaoLidas; }

  abrirNotificacao(notif: Notificacao) {
    this.notifService.marcarLida(notif.id);
    const rota = this.rotasPorCategoria[notif.categoria];
    if (rota) this.router.navigateByUrl(rota);
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

  iconeCategoria(c: CategoriaNotif): string { return this.categorias.find(x => x.valor === c)?.icone ?? 'notifications-outline'; }

  corCategoria(c: CategoriaNotif): string {
    const mapa: Record<CategoriaNotif, string> = {
      eventos:  'primary',
      quotas:   'warning',
      noticias: 'tertiary',
    };
    return mapa[c] || 'medium';
  }

  labelCategoria(c: CategoriaNotif): string {
    const mapa: Record<CategoriaNotif, string> = {
      eventos:  'Eventos',
      quotas:   'Quotas',
      noticias: 'Notícias',
    };
    return mapa[c] ?? c;
  }

  formatarTempo(dataInput: any): string {
    const d = new Date(dataInput);
    const diff = Math.floor((new Date().getTime() - d.getTime()) / 60000);
    if (diff < 1) return 'Agora mesmo';
    if (diff < 60) return `${diff}m atrás`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h atrás`;
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
  }
}