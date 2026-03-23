// src/app/pages/notificacoes/notificacoes.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type CategoriaNotif = 'eventos' | 'quotas' | 'convocatorias' | 'noticias';

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
  convocatorias: boolean;
  noticias: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificacoesService {

  private _notificacoes = new BehaviorSubject<Notificacao[]>([]);
  notificacoes$ = this._notificacoes.asObservable();

  private _prefs = new BehaviorSubject<PrefsNotificacoes>({
    eventos:       true,
    quotas:        true,
    convocatorias: true,
    noticias:      true, // ✅ CORRIGIDO: era false, documentos usam esta categoria
  });
  prefs$ = this._prefs.asObservable();

  get notificacoes(): Notificacao[] {
    return this._notificacoes.getValue();
  }

  get prefs(): PrefsNotificacoes {
    return this._prefs.getValue();
  }

  get totalNaoLidas(): number {
    return this.notificacoes.filter(n => !n.lida).length;
  }

  guardarPrefs(prefs: PrefsNotificacoes) {
    this._prefs.next(prefs);
    // TODO: this.http.post(`${API_URL}/prefs/notificacoes`, prefs).subscribe()
  }

  adicionar(dados: { titulo: string; mensagem: string; categoria: CategoriaNotif }) {
    if (!this.prefs[dados.categoria]) return;

    const nova: Notificacao = {
      id:        Date.now(),
      titulo:    dados.titulo,
      mensagem:  dados.mensagem,
      categoria: dados.categoria,
      data:      new Date(),
      lida:      false,
    };
    this._notificacoes.next([nova, ...this.notificacoes]);
    // TODO: this.http.post(`${API_URL}/notificacoes`, nova).subscribe()
  }

  marcarLida(id: number) {
    const lista = this.notificacoes.map(n => n.id === id ? { ...n, lida: true } : n);
    this._notificacoes.next(lista);
  }

  marcarTodasLidas() {
    const lista = this.notificacoes.map(n => ({ ...n, lida: true }));
    this._notificacoes.next(lista);
  }

  eliminar(id: number) {
    this._notificacoes.next(this.notificacoes.filter(n => n.id !== id));
  }
}