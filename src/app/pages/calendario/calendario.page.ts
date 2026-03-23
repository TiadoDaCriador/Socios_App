import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  IonHeader, IonToolbar, IonButtons, IonMenuButton,
  IonTitle, IonContent, IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { EventosService } from '../../services/eventos.service';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.page.html',
  styleUrls: ['./calendario.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    TranslateModule, 
    IonHeader, 
    IonToolbar, 
    IonButtons, 
    IonMenuButton, 
    IonTitle, 
    IonContent, 
    IonIcon
  ],
})
export class CalendarioPage implements OnInit, OnDestroy {
  vista: 'mes' | 'semana' | 'dia' = 'mes';
  dataAtual = new Date();
  hoje = new Date();
  diasSemana: string[] = [];
  meses: string[] = [];
  eventos: any[] = [];
  celulas: any[] = [];
  horas = Array.from({ length: 14 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`);

  private sub?: Subscription;
  private langSub?: Subscription;

  constructor(
    private eventosService: EventosService, 
    private translate: TranslateService
  ) {
    addIcons({ chevronBackOutline, chevronForwardOutline });
  }

  ngOnInit() {
    this.langSub = this.translate.onLangChange.subscribe(() => this.carregarTraducoes());
    this.carregarTraducoes();
    this.gerarCelulas();

    this.sub = this.eventosService.eventos$.subscribe(lista => {
      this.eventos = lista.map(e => {
        const d = new Date(e.dataInicio);
        return { 
          ...e, 
          titulo: e.nome, 
          data: d, 
          hora: `${String(d.getHours()).padStart(2, '0')}:00` 
        };
      });
    });
  }

  private carregarTraducoes() {
    this.translate.get(['CALENDARIO.MESES', 'CALENDARIO.DIAS_CURTO']).subscribe(res => {
      this.meses = res['CALENDARIO.MESES'];
      this.diasSemana = res['CALENDARIO.DIAS_CURTO'];
    });
  }

  setVista(v: 'mes' | 'semana' | 'dia') { 
    this.vista = v; 
    this.gerarCelulas(); 
  }

  irParaHoje() { 
    this.dataAtual = new Date(); 
    this.gerarCelulas(); 
  }

  anterior() { this.navegar(-1); }
  proximo() { this.navegar(1); }

  private navegar(dir: number) {
    const d = new Date(this.dataAtual);
    if (this.vista === 'mes') d.setMonth(d.getMonth() + dir);
    else if (this.vista === 'semana') d.setDate(d.getDate() + (dir * 7));
    else d.setDate(d.getDate() + dir);
    this.dataAtual = d; 
    this.gerarCelulas();
  }

  get tituloNavegacao(): string {
    if (!this.meses || this.meses.length === 0) return '';
    const ano = this.dataAtual.getFullYear();
    if (this.vista === 'mes') return `${this.meses[this.dataAtual.getMonth()]} ${ano}`;
    const dias = this.diasDaSemana;
    return `${dias[0].getDate()} – ${dias[6].getDate()} ${this.meses[dias[6].getMonth()]} ${ano}`;
  }

  get diasDaSemana(): Date[] {
    const d = new Date(this.dataAtual);
    const dow = d.getDay() === 0 ? 6 : d.getDay() - 1;
    d.setDate(d.getDate() - dow);
    return Array.from({ length: 7 }, (_, i) => {
      const dia = new Date(d); 
      dia.setDate(d.getDate() + i); 
      return dia;
    });
  }

  // ✅ Função restaurada para corrigir o erro do Template
  isHoraPassada = (dia: Date, hora: string) => {
    const agora = new Date();
    const d = new Date(dia);
    const h = parseInt(hora.split(':')[0]);
    d.setHours(h, 0, 0, 0);
    return d < agora;
  };

  isHoje = (d: Date) => this.mesmoDia(d, this.hoje);
  
  isPassado = (d: Date) => {
    const h = new Date(); h.setHours(0,0,0,0);
    const temp = new Date(d); temp.setHours(0,0,0,0);
    return temp < h;
  };

  eventosNoDia = (d: Date) => this.eventos.filter(e => this.mesmoDia(e.data, d));
  
  eventoNaHora = (dia: Date, hora: string) => 
    this.eventosNoDia(dia).find(e => e.hora.startsWith(hora.split(':')[0]));

  private mesmoDia = (a: Date, b: Date) => 
    a.getDate() === b.getDate() && 
    a.getMonth() === b.getMonth() && 
    a.getFullYear() === b.getFullYear();

  gerarCelulas() {
    this.celulas = [];
    const ano = this.dataAtual.getFullYear();
    const mes = this.dataAtual.getMonth();
    const primeiroDiaMes = new Date(ano, mes, 1);
    let inicioSemana = primeiroDiaMes.getDay();
    inicioSemana = inicioSemana === 0 ? 6 : inicioSemana - 1;

    for (let i = inicioSemana; i > 0; i--) {
      this.celulas.push({ data: new Date(ano, mes, 1 - i), mesAtual: false });
    }
    const ultimoDiaMes = new Date(ano, mes + 1, 0).getDate();
    for (let i = 1; i <= ultimoDiaMes; i++) {
      this.celulas.push({ data: new Date(ano, mes, i), mesAtual: true });
    }
    while (this.celulas.length < 42) {
      const d = new Date(this.celulas[this.celulas.length - 1].data);
      d.setDate(d.getDate() + 1);
      this.celulas.push({ data: d, mesAtual: false });
    }
  }

  ngOnDestroy() { 
    this.sub?.unsubscribe(); 
    this.langSub?.unsubscribe(); 
  }
}