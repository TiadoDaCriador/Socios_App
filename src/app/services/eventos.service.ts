// src/app/services/eventos.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { NotificacoesService } from '../pages/notificacoes/notificacoes.service';
import { labelDoTipo } from '../shared/tipos-eventos'; // ✅ ADICIONADO

export interface EventoLista {
  id: number;
  nome: string;
  tipo: string;
  cor: string;
  dataInicio: Date;
  dataFim: Date;
  local: string;
  descricao?: string;
}

@Injectable({ providedIn: 'root' })
export class EventosService {

  private _eventos = new BehaviorSubject<EventoLista[]>([]);
  eventos$: Observable<EventoLista[]> = this._eventos.asObservable();

  constructor(private notifService: NotificacoesService) {}

  get eventos(): EventoLista[] {
    return this._eventos.getValue();
  }

  adicionar(evento: Omit<EventoLista, 'id'>): EventoLista {
    const novo: EventoLista = { ...evento, id: Date.now() };
    this._eventos.next([...this.eventos, novo]);

  
    this.notifService.adicionar({
      titulo:    `Novo Evento: ${novo.nome}`,
      mensagem:  `${labelDoTipo(novo.tipo)} marcado para ${novo.dataInicio.toLocaleDateString('pt-PT')} em ${novo.local || 'local a definir'}.`,
      categoria: 'eventos',
    });

    return novo;
  }

  atualizar(id: number, dados: Partial<EventoLista>): void {
    const lista = this.eventos.map(e => e.id === id ? { ...e, ...dados } : e);
    this._eventos.next(lista);
  }

  eliminar(id: number): void {
    this._eventos.next(this.eventos.filter(e => e.id !== id));
  }

  adicionarDoCalendario(dados: {
    titulo: string;
    tipo:   string; 
    data:   Date;
    hora:   string;
    cor:    string;
    local?: string;
  }): EventoLista {
    const [horas, minutos] = dados.hora.split(':').map(Number);
    const dataInicio = new Date(dados.data);
    dataInicio.setHours(horas, minutos || 0, 0, 0);
    const dataFim = new Date(dataInicio);
    dataFim.setHours(horas + 1, minutos || 0, 0, 0);

    return this.adicionar({
      nome:      dados.titulo,
      tipo:      dados.tipo, 
      cor:       dados.cor,
      dataInicio,
      dataFim,
      local:     dados.local ?? '',
    });
  }


}