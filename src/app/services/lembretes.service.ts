import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificacoesService } from '../pages/notificacoes/notificacoes.service';
import { EventosService, EventoLista } from './eventos.service';
import { labelDoTipo } from '../shared/tipos-eventos';

@Injectable({ providedIn: 'root' })
export class LembretesService implements OnDestroy {

  private intervalo?: ReturnType<typeof setInterval>;
  private subEventos?: Subscription;

  // Guarda IDs já notificados para não repetir
  private notificadosEventos = new Set<number>();

  constructor(
    private notifService: NotificacoesService,
    private eventosService: EventosService,
  ) {}

  // ── Iniciar verificação ───────────────────────────────────
  iniciar() { // 👈 Removido o parâmetro convocatorias
    this.parar();

    // Verifica imediatamente ao iniciar
    this.verificar();

    // Verifica a cada hora
    this.intervalo = setInterval(() => {
      this.verificar();
    }, 60 * 60 * 1000); 

    // Subscreve a novos eventos
    this.subEventos = this.eventosService.eventos$.subscribe(eventos => {
      this.verificarEventos(eventos);
    });
  }

  // ── Parar verificação ─────────────────────────────────────
  parar() {
    if (this.intervalo) {
      clearInterval(this.intervalo);
      this.intervalo = undefined;
    }
    this.subEventos?.unsubscribe();
    this.notificadosEventos.clear();
  }

  // ── Verificação principal ─────────────────────────────────
  private verificar() {
    this.verificarEventos(this.eventosService.eventos);
  }

  // ── Verificar eventos ─────────────────────────────────────
  private verificarEventos(eventos: EventoLista[]) {
    const agora   = new Date();
    const amanha  = new Date(agora.getTime() + 24 * 60 * 60 * 1000);

    for (const ev of eventos) {
      if (this.notificadosEventos.has(ev.id)) continue;

      const dataEvento = new Date(ev.dataInicio);

      if (dataEvento > agora && dataEvento <= amanha) {
        const horas = Math.round((dataEvento.getTime() - agora.getTime()) / (60 * 60 * 1000));
        const texto = horas <= 1 ? 'em menos de 1 hora' : `em ${horas} horas`;

        this.notifService.adicionar({
          titulo:   `⏰ Lembrete: ${ev.nome}`,
          mensagem: `O evento "${ev.nome}" (${labelDoTipo(ev.tipo)}) começa ${texto}, às ${this.formatarHora(dataEvento)} em ${ev.local || 'local a definir'}.`,
          categoria: 'eventos',
        });

        this.notificadosEventos.add(ev.id);
      }
    }
  }

  private formatarHora(d: Date): string {
    return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  }

  ngOnDestroy() {
    this.parar();
  }
}