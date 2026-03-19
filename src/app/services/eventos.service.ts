// src/app/services/eventos.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { NotificacoesService } from '../pages/notificacoes/notificacoes.service';

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

    // Cria notificação automática
    this.notifService.adicionar({
      titulo:    `Novo Evento: ${novo.nome}`,
      mensagem:  `${novo.tipo} marcado para ${novo.dataInicio.toLocaleDateString('pt-PT')} em ${novo.local || 'local a definir'}.`,
      categoria: 'eventos',
    });

    // TODO: Guardar no API
    // this.http.post(`${API_URL}/eventos`, novo).subscribe()

    return novo;
  }

  atualizar(id: number, dados: Partial<EventoLista>): void {
    const lista = this.eventos.map(e => e.id === id ? { ...e, ...dados } : e);
    this._eventos.next(lista);
    // TODO: this.http.put(`${API_URL}/eventos/${id}`, dados).subscribe()
  }

  eliminar(id: number): void {
    this._eventos.next(this.eventos.filter(e => e.id !== id));
    // TODO: this.http.delete(`${API_URL}/eventos/${id}`).subscribe()
  }

  adicionarDoCalendario(dados: {
    titulo: string;
    data: Date;
    hora: string;
    cor: string;
    local?: string;
  }): EventoLista {
    const [horas] = dados.hora.replace('h', ':00').split(':').map(Number);
    const dataInicio = new Date(dados.data);
    dataInicio.setHours(horas, 0, 0, 0);
    const dataFim = new Date(dataInicio);
    dataFim.setHours(horas + 1, 0, 0, 0);

    return this.adicionar({
      nome:      dados.titulo,
      tipo:      this.corParaTipo(dados.cor),
      cor:       dados.cor,
      dataInicio,
      dataFim,
      local:     dados.local ?? '',
    });
  }

  private corParaTipo(cor: string): string {
    const mapa: Record<string, string> = {
      green: 'Treino', red: 'Jogo', blue: 'Reunião', orange: 'Torneio',
    };
    return mapa[cor] ?? 'Outro';
  }
}