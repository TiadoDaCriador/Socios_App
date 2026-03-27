import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, map, tap, catchError, of } from 'rxjs';
import { environment } from '../environment/environment';

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

// ─── Formato que a API devolve (ajusta conforme necessário) ───
interface EventoAPI {
  id: number;
  nome: string;
  tipo: string;
  cor: string;
  dataInicio: string;  // a API devolve string ISO
  dataFim: string;
  local: string;
  descricao?: string;
  pdfUrl?: string;
}

// ─── Dados de mock enquanto não há API ───
const MOCK_EVENTOS: EventoLista[] = [
  {
    id: 1,
    nome: 'Ensaio Geral - Maestro',
    tipo: 'Ensaio',
    cor: '#f1b44c',
    dataInicio: new Date(),
    dataFim: new Date(),
    local: 'Auditório Principal',
    descricao: 'Ensaio de preparação para o evento de Gala.',
  },
];

@Injectable({ providedIn: 'root' })
export class EventosService {

  private _eventos = new BehaviorSubject<EventoLista[]>([]);
  private _dataSelecionada = new BehaviorSubject<Date>(new Date());
  private _loading = new BehaviorSubject<boolean>(false);
  private _erro = new BehaviorSubject<string | null>(null);

  eventos$ = this._eventos.asObservable().pipe(
    map(eventos => [...eventos].sort((a, b) => a.dataInicio.getTime() - b.dataInicio.getTime()))
  );
  dataSelecionada$ = this._dataSelecionada.asObservable();
  loading$ = this._loading.asObservable();
  erro$ = this._erro.asObservable();

  // ─── Muda para false quando tiveres a API pronta ───
  private readonly USE_MOCK = true;

  // ─── Endpoints — preenche quando tiveres acesso ───
  private readonly API_URL = environment.apiUrl;
  private readonly ENDPOINTS = {
    listar:    `${this.API_URL}/eventos`,
    criar:     `${this.API_URL}/eventos`,
    atualizar: (id: number) => `${this.API_URL}/eventos/${id}`,
    eliminar:  (id: number) => `${this.API_URL}/eventos/${id}`,
  };

  constructor(private http: HttpClient) {
    this.carregarEventos();
  }

  // ─── CARREGAR ───────────────────────────────────────────
  carregarEventos(): void {
    if (this.USE_MOCK) {
      this._eventos.next(MOCK_EVENTOS);
      return;
    }

    this._loading.next(true);
    this._erro.next(null);

    this.http.get<EventoAPI[]>(this.ENDPOINTS.listar, this.getHeaders())
      .pipe(
        map(lista => lista.map(e => this.mapearEvento(e))),
        tap(lista => {
          this._eventos.next(lista);
          this._loading.next(false);
        }),
        catchError(err => {
          this._erro.next('Erro ao carregar eventos.');
          this._loading.next(false);
          console.error('[EventosService] Erro ao carregar:', err);
          return of([]);
        }),
      )
      .subscribe();
  }

  // ─── ADICIONAR ──────────────────────────────────────────
  adicionar(evento: Omit<EventoLista, 'id'>): void {
    if (this.USE_MOCK) {
      const novo: EventoLista = { ...evento, id: Date.now() };
      this._eventos.next([...this._eventos.getValue(), novo]);
      return;
    }

    this.http.post<EventoAPI>(this.ENDPOINTS.criar, this.desmapearEvento(evento as EventoLista), this.getHeaders())
      .pipe(
        map(e => this.mapearEvento(e)),
        tap(novo => this._eventos.next([...this._eventos.getValue(), novo])),
        catchError(err => {
          console.error('[EventosService] Erro ao adicionar:', err);
          return of(null);
        }),
      )
      .subscribe();
  }

  // ─── ATUALIZAR ──────────────────────────────────────────
  atualizar(id: number, dados: Partial<EventoLista>): void {
    if (this.USE_MOCK) {
      this._eventos.next(
        this._eventos.getValue().map(e => e.id === id ? { ...e, ...dados } : e)
      );
      return;
    }

    this.http.put<EventoAPI>(this.ENDPOINTS.atualizar(id), this.desmapearEvento(dados as EventoLista), this.getHeaders())
      .pipe(
        map(e => this.mapearEvento(e)),
        tap(atualizado => {
          this._eventos.next(
            this._eventos.getValue().map(e => e.id === id ? atualizado : e)
          );
        }),
        catchError(err => {
          console.error('[EventosService] Erro ao atualizar:', err);
          return of(null);
        }),
      )
      .subscribe();
  }

  // ─── ELIMINAR ───────────────────────────────────────────
  eliminar(id: number): void {
    if (this.USE_MOCK) {
      this._eventos.next(this._eventos.getValue().filter(e => e.id !== id));
      return;
    }

    this.http.delete(this.ENDPOINTS.eliminar(id), this.getHeaders())
      .pipe(
        tap(() => this._eventos.next(this._eventos.getValue().filter(e => e.id !== id))),
        catchError(err => {
          console.error('[EventosService] Erro ao eliminar:', err);
          return of(null);
        }),
      )
      .subscribe();
  }

  // ─── UTILITÁRIOS ────────────────────────────────────────
  setDataSelecionada(data: Date) { this._dataSelecionada.next(data); }

  get eventos(): EventoLista[] { return this._eventos.getValue(); }

  getEventosDoDia(data: Date) {
    return this.eventos$.pipe(
      map(eventos => eventos.filter(e =>
        e.dataInicio.getDate()     === data.getDate()   &&
        e.dataInicio.getMonth()    === data.getMonth()  &&
        e.dataInicio.getFullYear() === data.getFullYear()
      ))
    );
  }

  // ─── MAPEAMENTO API ↔ MODELO ────────────────────────────
  private mapearEvento(e: EventoAPI): EventoLista {
    return {
      ...e,
      dataInicio: new Date(e.dataInicio),
      dataFim:    new Date(e.dataFim),
    };
  }

  private desmapearEvento(e: EventoLista): EventoAPI {
    return {
      ...e,
      dataInicio: e.dataInicio.toISOString(),
      dataFim:    e.dataFim.toISOString(),
    };
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