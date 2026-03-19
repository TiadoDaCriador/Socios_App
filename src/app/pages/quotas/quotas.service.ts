// src/app/pages/quotas/quotas.service.ts
// NOTA: Este ficheiro vai em src/app/pages/quotas/ (não em services/)
import { Injectable } from '@angular/core';
import { Quota } from './quotas.page';
import { NotificacoesService } from '../notificacoes/notificacoes.service';

@Injectable({ providedIn: 'root' })
export class QuotasService {

  constructor(private notifService: NotificacoesService) {}

  verificarQuotas(quotas: Quota[]) {
    const hoje = new Date();
    quotas.forEach(q => {
      if (q.estado === 'vencido') {
        this.notifService.adicionar({
          titulo:    `Quota Vencida: ${q.descricao}`,
          mensagem:  `A tua quota no valor de ${q.valor.toFixed(2)}€ está vencida desde ${q.dataVencimento.toLocaleDateString('pt-PT')}.`,
          categoria: 'quotas',
        });
      }
      if (q.estado === 'pendente') {
        const dias = Math.ceil((q.dataVencimento.getTime() - hoje.getTime()) / 86400000);
        if (dias <= 7 && dias >= 0) {
          this.notifService.adicionar({
            titulo:    `Quota a Vencer em ${dias} dia(s)`,
            mensagem:  `A tua quota "${q.descricao}" no valor de ${q.valor.toFixed(2)}€ vence a ${q.dataVencimento.toLocaleDateString('pt-PT')}.`,
            categoria: 'quotas',
          });
        }
      }
    });
  }

  notificarPagamento(quota: Quota) {
    this.notifService.adicionar({
      titulo:    'Pagamento Confirmado',
      mensagem:  `O pagamento da quota "${quota.descricao}" no valor de ${quota.valor.toFixed(2)}€ foi confirmado. Obrigado!`,
      categoria: 'quotas',
    });
  }
}