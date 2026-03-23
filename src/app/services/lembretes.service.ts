// src/app/services/lembretes.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificacoesService } from '../pages/notificacoes/notificacoes.service';
import { EventosService, EventoLista } from './eventos.service';
import { Convocatoria } from '../pages/convocatorias/convocatorias.page';
import { labelDoTipo } from '../shared/tipos-eventos';

@Injectable({ providedIn: 'root' })
export class LembretesService implements OnDestroy {

  private intervalo?: ReturnType<typeof setInterval>;
  private subEventos?: Subscription;

  // Guarda IDs já notificados para não repetir
  private notificadosEventos    = new Set<number>();
  private notificadosConvocatorias = new Set<number>();

  constructor(
    private notifService:  NotificacoesService,
    private eventosService: EventosService,
  ) {}

  // ── Iniciar verificação ───────────────────────────────────
  // Chamar este método no login do utilizador
  iniciar(convocatorias: Convocatoria[]) {
    this.parar();

    // Verifica imediatamente ao iniciar
    this.verificar(convocatorias);

    // Verifica a cada hora
    this.intervalo = setInterval(() => {
      this.verificar(convocatorias);
    }, 60 * 60 * 1000); // 1 hora

    // Subscreve a novos eventos adicionados
    this.subEventos = this.eventosService.eventos$.subscribe(eventos => {
      this.verificarEventos(eventos);
    });
  }

  // ── Parar verificação ─────────────────────────────────────
  // Chamar este método no logout
  parar() {
    if (this.intervalo) {
      clearInterval(this.intervalo);
      this.intervalo = undefined;
    }
    this.subEventos?.unsubscribe();
    this.notificadosEventos.clear();
    this.notificadosConvocatorias.clear();
  }

  // ── Verificação principal ─────────────────────────────────
  private verificar(convocatorias: Convocatoria[]) {
    this.verificarEventos(this.eventosService.eventos);
    this.verificarConvocatorias(convocatorias);
  }

  // ── Verificar eventos ─────────────────────────────────────
  private verificarEventos(eventos: EventoLista[]) {
    const agora   = new Date();
    const amanha  = new Date(agora.getTime() + 24 * 60 * 60 * 1000);

    for (const ev of eventos) {
      if (this.notificadosEventos.has(ev.id)) continue;

      const dataEvento = new Date(ev.dataInicio);

      // Falta menos de 24h mas ainda não passou
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

  // ── Verificar convocatórias ───────────────────────────────
  private verificarConvocatorias(convocatorias: Convocatoria[]) {
    const agora  = new Date();
    const amanha = new Date(agora.getTime() + 24 * 60 * 60 * 1000);

    for (const conv of convocatorias) {
      if (this.notificadosConvocatorias.has(conv.id)) continue;

      const dataConv = new Date(conv.dia);

      // Falta menos de 24h mas ainda não passou
      if (dataConv > agora && dataConv <= amanha) {
        const horas = Math.round((dataConv.getTime() - agora.getTime()) / (60 * 60 * 1000));
        const texto = horas <= 1 ? 'em menos de 1 hora' : `em ${horas} horas`;

        this.notifService.adicionar({
          titulo:   `⏰ Lembrete: ${conv.titulo}`,
          mensagem: `A convocatória "${conv.titulo}" começa ${texto}, às ${conv.hora} em ${conv.local}.`,
          categoria: 'convocatorias',
        });

        this.notificadosConvocatorias.add(conv.id);
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