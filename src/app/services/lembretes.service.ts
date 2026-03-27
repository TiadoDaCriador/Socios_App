import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificacoesService } from '../pages/notificacoes/notificacoes.service';
import { EventosService, EventoLista } from './eventos.service';
import { QuotasService } from '../pages/quotas/quotas.service';
import { Quota } from '../pages/quotas/quotas.page';
import { labelDoTipo } from '../shared/tipos-eventos';

@Injectable({ providedIn: 'root' })
export class LembretesService implements OnDestroy {

  private intervalo?: ReturnType<typeof setInterval>;
  private subEventos?: Subscription;

  // Guarda IDs já notificados para não repetir na mesma sessão
  private notificadosEventos  = new Set<number>();
  private notificadasQuotas   = new Set<number>();

  constructor(
    private notifService:  NotificacoesService,
    private eventosService: EventosService,
    private quotasService:  QuotasService,
  ) {}

  // ── Iniciar verificação ───────────────────────────────────
  iniciar() {
    this.parar();

    // Verifica imediatamente ao iniciar
    this.verificar();

    // Verifica a cada hora
    this.intervalo = setInterval(() => {
      this.verificar();
    }, 60 * 60 * 1000);

    // Subscreve a novos eventos em tempo real
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
    this.notificadasQuotas.clear();
  }

  // ── Verificação principal ─────────────────────────────────
  private verificar() {
    this.verificarEventos(this.eventosService.eventos);
    // Quotas verificadas quando carregadas — ver verificarQuotasExternas()
  }

  // ── Verificar eventos ─────────────────────────────────────
  private verificarEventos(eventos: EventoLista[]) {
    const agora  = new Date();
    const amanha = new Date(agora.getTime() + 24 * 60 * 60 * 1000);

    for (const ev of eventos) {
      if (this.notificadosEventos.has(ev.id)) continue;

      const dataEvento = new Date(ev.dataInicio);

      if (dataEvento > agora && dataEvento <= amanha) {
        const horas = Math.round((dataEvento.getTime() - agora.getTime()) / (60 * 60 * 1000));
        const texto = horas <= 1 ? 'em menos de 1 hora' : `em ${horas} horas`;

        this.notifService.adicionar({
          titulo:    `⏰ Lembrete: ${ev.nome}`,
          mensagem:  `O evento "${ev.nome}" (${labelDoTipo(ev.tipo)}) começa ${texto}, às ${this.formatarHora(dataEvento)} em ${ev.local || 'local a definir'}.`,
          categoria: 'eventos',
        });

        this.notificadosEventos.add(ev.id);
      }
    }
  }

  // ── Verificar quotas (chamado quando a API devolver dados) ─
  // Chama este método no quotas.page.ts após carregar as quotas da API:
  // this.lembretesService.verificarQuotasExternas(this.quotas);
  verificarQuotasExternas(quotas: Quota[]) {
    // Atualiza o valor da dívida na Home
    this.quotasService.atualizarValorHome(quotas);

    if (!this.notifService.prefs.quotas) return;

    const hoje = new Date();

    for (const q of quotas) {
      if (this.notificadasQuotas.has(q.id)) continue;

      // Quota vencida
      if (q.estado === 'vencido') {
        this.notifService.adicionar({
          titulo:    `⚠️ Quota Vencida: ${q.descricao}`,
          mensagem:  `A tua quota de ${q.valor.toFixed(2)}€ está vencida desde ${q.dataVencimento.toLocaleDateString('pt-PT')}.`,
          categoria: 'quotas',
        });
        this.notificadasQuotas.add(q.id);
      }

      // Quota a vencer nos próximos 7 dias
      if (q.estado === 'pendente') {
        const dias = Math.ceil((q.dataVencimento.getTime() - hoje.getTime()) / 86400000);
        if (dias >= 0 && dias <= 7) {
          this.notifService.adicionar({
            titulo:    `📅 Quota a vencer em ${dias} dia(s)`,
            mensagem:  `A quota "${q.descricao}" de ${q.valor.toFixed(2)}€ vence a ${q.dataVencimento.toLocaleDateString('pt-PT')}.`,
            categoria: 'quotas',
          });
          this.notificadasQuotas.add(q.id);
        }
      }
    }
  }

  // ── Notificar pagamento confirmado ────────────────────────
  notificarPagamentoQuota(quota: Quota) {
    this.notifService.adicionar({
      titulo:    '✅ Pagamento Confirmado',
      mensagem:  `O pagamento da quota "${quota.descricao}" de ${quota.valor.toFixed(2)}€ foi confirmado.`,
      categoria: 'quotas',
    });
  }

  private formatarHora(d: Date): string {
    return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  }

  ngOnDestroy() {
    this.parar();
  }
}