import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, tap, catchError, of } from 'rxjs';
import { environment } from '../../environment/environment';
import { EventosService, EventoLista } from '../../services/eventos.service';

export type CategoriaNotif = 'eventos' | 'quotas' | 'noticias';

export interface Notificacao {
  id: number;
  titulo: string;
  mensagem: string;
  categoria: CategoriaNotif;
  data: Date;
  lida: boolean;
}

export interface PrefsNotificacoes {
  eventos: boolean;
  quotas: boolean;
  noticias: boolean;
}

// ─── Formato que a API devolve (ajusta conforme necessário) ───
interface NotificacaoAPI {
  id: number;
  titulo: string;
  mensagem: string;
  categoria: CategoriaNotif;
  data: string; // ISO string
  lida: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificacoesService {

  private _notificacoes = new BehaviorSubject<Notificacao[]>([]);
  private _prefs = new BehaviorSubject<PrefsNotificacoes>({
    eventos: true,
    quotas: true,
    noticias: true,
  });
  private _loading = new BehaviorSubject<boolean>(false);
  private _erro = new BehaviorSubject<string | null>(null);

  notificacoes$ = this._notificacoes.asObservable();
  prefs$ = this._prefs.asObservable();
  loading$ = this._loading.asObservable();
  erro$ = this._erro.asObservable();

  // ─── Muda para false quando tiveres a API pronta ───
  private readonly USE_MOCK = true;

  // ─── Endpoints — preenche quando tiveres acesso ───
  private readonly API_URL = environment.apiUrl;
  private readonly ENDPOINTS = {
    listar:      `${this.API_URL}/notificacoes`,
    marcarLida:  (id: number) => `${this.API_URL}/notificacoes/${id}/lida`,
    marcarTodas: `${this.API_URL}/notificacoes/lidas`,
    eliminar:    (id: number) => `${this.API_URL}/notificacoes/${id}`,
  };

  get notificacoes(): Notificacao[] { return this._notificacoes.getValue(); }
  get prefs(): PrefsNotificacoes { return this._prefs.getValue(); }
  get totalNaoLidas(): number { return this.notificacoes.filter(n => !n.lida).length; }

  constructor(
    private http: HttpClient,
    private eventosService: EventosService,
  ) {
    this.carregarNotificacoes();
    this.observarEventos();
  }

  // ─── CARREGAR ───────────────────────────────────────────
  carregarNotificacoes(): void {
    if (this.USE_MOCK) return;

    this._loading.next(true);
    this._erro.next(null);

    this.http.get<NotificacaoAPI[]>(this.ENDPOINTS.listar, this.getHeaders())
      .pipe(
        tap(lista => {
          this._notificacoes.next(lista.map(n => this.mapearNotificacao(n)));
          this._loading.next(false);
        }),
        catchError(err => {
          this._erro.next('Erro ao carregar notificações.');
          this._loading.next(false);
          console.error('[NotificacoesService] Erro ao carregar:', err);
          return of([]);
        }),
      )
      .subscribe();
  }

  // ─── OBSERVAR EVENTOS → gera notificações automáticas ───
  private observarEventos(): void {
    this.eventosService.eventos$.subscribe((eventos: EventoLista[]) => {
      if (!this.prefs.eventos) return;

      const agora = new Date();

      eventos.forEach((ev: EventoLista) => {
        const diffMs = ev.dataInicio.getTime() - agora.getTime();
        const diffHoras = diffMs / (1000 * 60 * 60);

        // Notifica se o evento começa nas próximas 24 horas
        if (diffHoras > 0 && diffHoras <= 24) {
          const jaExiste = this.notificacoes.some(
            n => n.categoria === 'eventos' && n.titulo.includes(ev.nome)
          );
          if (!jaExiste) {
            this.adicionar({
              titulo: `Evento amanhã: ${ev.nome}`,
              mensagem: `${ev.nome} começa em ${Math.round(diffHoras)}h em ${ev.local}.`,
              categoria: 'eventos',
            });
          }
        }

        // Notifica se o evento está a começar agora (próximos 30 min)
        if (diffMs >= 0 && diffMs <= 30 * 60 * 1000) {
          const jaExiste = this.notificacoes.some(
            n => n.categoria === 'eventos' && n.mensagem.includes('está a começar')
          );
          if (!jaExiste) {
            this.adicionar({
              titulo: `A começar agora: ${ev.nome}`,
              mensagem: `O evento "${ev.nome}" está a começar em ${ev.local}.`,
              categoria: 'eventos',
            });
          }
        }
      });
    });
  }

  // ─── ADICIONAR ──────────────────────────────────────────
  adicionar(dados: { titulo: string; mensagem: string; categoria: CategoriaNotif }) {
    if (!this.prefs[dados.categoria]) return;

    const nova: Notificacao = {
      id: Date.now(),
      titulo: dados.titulo,
      mensagem: dados.mensagem,
      categoria: dados.categoria,
      data: new Date(),
      lida: false,
    };
    this._notificacoes.next([nova, ...this.notificacoes]);
  }

  // ─── MARCAR LIDA ─────────────────────────────────────────
  marcarLida(id: number): void {
    this._notificacoes.next(
      this.notificacoes.map(n => n.id === id ? { ...n, lida: true } : n)
    );

    if (this.USE_MOCK) return;

    this.http.patch(this.ENDPOINTS.marcarLida(id), {}, this.getHeaders())
      .pipe(catchError(err => { console.error('[NotificacoesService] Erro marcarLida:', err); return of(null); }))
      .subscribe();
  }

  // ─── MARCAR TODAS LIDAS ──────────────────────────────────
  marcarTodasLidas(): void {
    this._notificacoes.next(this.notificacoes.map(n => ({ ...n, lida: true })));

    if (this.USE_MOCK) return;

    this.http.patch(this.ENDPOINTS.marcarTodas, {}, this.getHeaders())
      .pipe(catchError(err => { console.error('[NotificacoesService] Erro marcarTodas:', err); return of(null); }))
      .subscribe();
  }

  // ─── ELIMINAR ────────────────────────────────────────────
  eliminar(id: number): void {
    this._notificacoes.next(this.notificacoes.filter(n => n.id !== id));

    if (this.USE_MOCK) return;

    this.http.delete(this.ENDPOINTS.eliminar(id), this.getHeaders())
      .pipe(catchError(err => { console.error('[NotificacoesService] Erro eliminar:', err); return of(null); }))
      .subscribe();
  }

  // ─── PREFERÊNCIAS ────────────────────────────────────────
  guardarPrefs(prefs: PrefsNotificacoes): void {
    this._prefs.next(prefs);
    // TODO: persistir prefs na API ou em @capacitor/preferences
  }

  // ─── MAPEAMENTO API ↔ MODELO ────────────────────────────
  private mapearNotificacao(n: NotificacaoAPI): Notificacao {
    return { ...n, data: new Date(n.data) };
  }

  private getHeaders() {
    // TODO: adiciona o token de autenticação quando tiveres acesso à API
    // const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}`,
      }),
    };
  }
}