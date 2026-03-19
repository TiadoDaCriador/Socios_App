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

@Injectable({ providedIn: 'root' })
export class NotificacoesService {

  private _notificacoes = new BehaviorSubject<Notificacao[]>([]);
  notificacoes$ = this._notificacoes.asObservable();

  get notificacoes(): Notificacao[] {
    return this._notificacoes.getValue();
  }

  get totalNaoLidas(): number {
    return this.notificacoes.filter(n => !n.lida).length;
  }

  adicionar(dados: { titulo: string; mensagem: string; categoria: CategoriaNotif }) {
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