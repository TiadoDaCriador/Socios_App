import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

export interface EventoLista {
  id: number;
  nome: string;
  tipo: string;
  cor: string;
  dataInicio: Date;
  dataFim: Date;
  local: string;
  descricao?: string;
  pdfUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class EventosService {
  // Inicializamos com um evento de teste para a tua Home não estar vazia
  private _eventos = new BehaviorSubject<EventoLista[]>([
    {
      id: 1,
      nome: 'Ensaio Geral - Maestro',
      tipo: 'Ensaio',
      cor: '#f1b44c',
      dataInicio: new Date(), // Hoje
      dataFim: new Date(),
      local: 'Auditório Principal',
      descricao: 'Ensaio de preparação para o evento de Gala.'
    }
  ]);
  
  // Observable que a Home usa para o "Card Amarelo" (sempre ordenado por data)
  eventos$ = this._eventos.asObservable().pipe(
    map(eventos => eventos.sort((a, b) => a.dataInicio.getTime() - b.dataInicio.getTime()))
  );

  private _dataSelecionada = new BehaviorSubject<Date>(new Date());
  dataSelecionada$ = this._dataSelecionada.asObservable();

  constructor() { }

  // --- MÉTODOS DE DATA ---
  setDataSelecionada(data: Date) {
    this._dataSelecionada.next(data);
  }

  // --- MÉTODOS DE EVENTOS ---
  get eventos(): EventoLista[] {
    return this._eventos.getValue();
  }

  // Novo método: Filtra eventos para um dia específico (usado na lista da Home)
  getEventosDoDia(data: Date) {
    return this.eventos$.pipe(
      map(eventos => eventos.filter(e => 
        e.dataInicio.getDate() === data.getDate() &&
        e.dataInicio.getMonth() === data.getMonth() &&
        e.dataInicio.getFullYear() === data.getFullYear()
      ))
    );
  }

  adicionar(evento: Omit<EventoLista, 'id'>): EventoLista {
    const novo: EventoLista = { ...evento, id: Date.now() };
    this._eventos.next([...this.eventos, novo]);
    return novo;
  }

  atualizar(id: number, dados: Partial<EventoLista>): void {
    this._eventos.next(this.eventos.map(e => e.id === id ? { ...e, ...dados } : e));
  }

  eliminar(id: number): void {
    this._eventos.next(this.eventos.filter(e => e.id !== id));
  }
}