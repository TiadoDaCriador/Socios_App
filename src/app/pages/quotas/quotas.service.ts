import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'; // 👈 Adicionado para a ligação
import { Quota } from './quotas.page';
import { NotificacoesService } from '../notificacoes/notificacoes.service';

@Injectable({ providedIn: 'root' })
export class QuotasService {

  // ✅ Criamos este Subject para a Home "ouvir" o valor da dívida
  private _totalDivida = new BehaviorSubject<number>(0);
  totalDivida$ = this._totalDivida.asObservable();

  constructor(private notifService: NotificacoesService) {}

  // ✅ Método para calcular e atualizar o valor que aparece na Home
  atualizarValorHome(quotas: Quota[]) {
    const total = quotas
      .filter(q => q.estado === 'vencido' || q.estado === 'pendente')
      .reduce((acc, q) => acc + q.valor, 0);
    
    this._totalDivida.next(total);
  }

  verificarQuotas(quotas: Quota[]) {
    // Primeiro, atualizamos o valor global da dívida para a Home
    this.atualizarValorHome(quotas);

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