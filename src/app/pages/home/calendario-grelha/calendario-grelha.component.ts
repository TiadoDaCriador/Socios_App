import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { EventosService } from '../../../services/eventos.service';

@Component({
  selector: 'app-calendario-grelha',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
  templateUrl: './calendario-grelha.component.html',
  styleUrls: ['./calendario-grelha.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class CalendarioGrelhaComponent implements OnInit, OnDestroy {
  dataAtual = new Date();
  celulas: any[] = [];
  vista: 'mes' | 'semana' | 'dia' = 'mes';
  meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  diasSemana = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
  private sub = new Subscription();

  constructor(private eventosService: EventosService) {
    addIcons({ chevronBackOutline, chevronForwardOutline });
  }

  ngOnInit() {
    this.sub.add(this.eventosService.dataSelecionada$.subscribe(d => {
      this.dataAtual = d;
      this.gerarGrelha();
    }));
  }

  gerarGrelha() {
    this.celulas = [];
    const ano = this.dataAtual.getFullYear();
    const mes = this.dataAtual.getMonth();
    const pDia = new Date(ano, mes, 1);
    let ini = pDia.getDay();
    ini = (ini === 0) ? 6 : ini - 1;

    for (let i = ini - 1; i >= 0; i--) this.celulas.push({ d: new Date(ano, mes, -i), m: false });
    const uDia = new Date(ano, mes + 1, 0).getDate();
    for (let i = 1; i <= uDia; i++) this.celulas.push({ d: new Date(ano, mes, i), m: true });
    while (this.celulas.length < 42) {
      const d = new Date(this.celulas[this.celulas.length - 1].d);
      d.setDate(d.getDate() + 1);
      this.celulas.push({ d, m: false });
    }
  }

  selecionar(d: Date) { this.eventosService.setDataSelecionada(d); }
  navegar(n: number) {
    const d = new Date(this.dataAtual);
    d.setMonth(d.getMonth() + n);
    this.eventosService.setDataSelecionada(d);
  }

  isHoje = (d: Date) => d.toDateString() === new Date().toDateString();
  isSel = (d: Date) => d.toDateString() === this.dataAtual.toDateString();
  ngOnDestroy() { this.sub.unsubscribe(); }
}