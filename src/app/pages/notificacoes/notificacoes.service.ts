import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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

@Injectable({ providedIn: 'root' })
export class NotificacoesService {

  private _notificacoes = new BehaviorSubject<Notificacao[]>([]);
  notificacoes$ = this._notificacoes.asObservable();

  private _prefs = new BehaviorSubject<PrefsNotificacoes>({
    eventos: true,
    quotas: true,
    noticias: true,
  });
  prefs$ = this._prefs.asObservable();

  get notificacoes(): Notificacao[] { return this._notificacoes.getValue(); }
  get prefs(): PrefsNotificacoes { return this._prefs.getValue(); }
  get totalNaoLidas(): number { return this.notificacoes.filter(n => !n.lida).length; }

  guardarPrefs(prefs: PrefsNotificacoes) {
    this._prefs.next(prefs);
  }

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

  marcarLida(id: number) {
    this._notificacoes.next(this.notificacoes.map(n => n.id === id ? { ...n, lida: true } : n));
  }

  marcarTodasLidas() {
    this._notificacoes.next(this.notificacoes.map(n => ({ ...n, lida: true })));
  }

  eliminar(id: number) {
    this._notificacoes.next(this.notificacoes.filter(n => n.id !== id));
  }
}