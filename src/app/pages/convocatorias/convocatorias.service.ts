// src/app/pages/convocatorias/convocatorias.service.ts
// NOTA: Este ficheiro vai em src/app/pages/convocatorias/ (não em services/)
import { Injectable } from '@angular/core';
import { Convocatoria, RespostaType } from './convocatorias.page';
import { NotificacoesService } from '../notificacoes/notificacoes.service';

@Injectable({ providedIn: 'root' })
export class ConvocatoriasService {

  constructor(private notifService: NotificacoesService) {}

  responder(conv: Convocatoria, resposta: RespostaType) {
    const msg = resposta === 'aceite'
      ? `Aceitaste a convocatória de ${conv.tipologia} a ${conv.dia.toLocaleDateString('pt-PT')}.`
      : `Recusaste a convocatória de ${conv.tipologia} a ${conv.dia.toLocaleDateString('pt-PT')}.`;

    this.notifService.adicionar({
      titulo:    `Resposta: ${resposta === 'aceite' ? 'Aceite ✓' : 'Recusado ✗'}`,
      mensagem:  msg,
      categoria: 'convocatorias',
    });

    // TODO: this.http.patch(`${API_URL}/convocatorias/${conv.id}/resposta`, { resposta }).subscribe()
  }
}