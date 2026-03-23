import { Component, OnInit, OnDestroy, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { EventosService, EventoLista } from '../../../services/eventos.service';

interface Evento {
  id: number;
  titulo: string;
  data: Date;
  hora: string;
  cor: string;
  tipo: string;
  local?: string;
}

@Component({
  selector: 'app-calendario-grelha',
  templateUrl: './calendario-grelha.component.html',
  styleUrls: ['./calendario-grelha.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule, IonIcon],
  encapsulation: ViewEncapsulation.None
})
export class CalendarioGrelhaComponent implements OnInit, OnDestroy {
  vista: 'mes' | 'semana' | 'dia' = 'mes';
  dataAtual = new Date();
  hoje = new Date();

  diasSemana: string[] = [];
  meses: string[] = [];
  eventos: Evento[] = [];
  celulas: { data: Date; mesAtual: boolean }[] = [];
  horas = Array.from({ length: 14 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`);

  private subs = new Subscription();

  constructor(
    private eventosService: EventosService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ chevronBackOutline, chevronForwardOutline });
  }

  ngOnInit() {
    this.gerarCelulas();

    // 1. ESCUTA O IDIOMA VIA STREAM
    // Usa stream() para garantir que apanha a tradução mesmo que o ficheiro JSON demore a carregar
    this.subs.add(
      this.translate.stream('CALENDARIO').subscribe(res => {
        if (res && res.MESES && res.DIAS_CURTO) {
          this.meses = res.MESES;
          this.diasSemana = res.DIAS_CURTO;
          this.cdr.detectChanges(); // Força atualização do título e cabeçalhos
        }
      })
    );

    // 2. ESCUTA OS EVENTOS DO SERVIÇO
    this.subs.add(
      this.eventosService.eventos$.subscribe((lista: EventoLista[]) => {
        this.eventos = lista.map(e => ({
          id: e.id,
          titulo: e.nome,
          data: new Date(e.dataInicio),
          hora: `${String(new Date(e.dataInicio).getHours()).padStart(2, '0')}:00`,
          cor: e.cor,
          tipo: e.tipo,
          local: e.local
        }));
        this.cdr.detectChanges();
      })
    );
  }

  // --- NAVEGAÇÃO ---
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

  // --- GETTERS PARA O TEMPLATE ---
  get tituloNavegacao(): string {
    if (!this.meses || this.meses.length === 0) return '';
    const mesIdx = this.dataAtual.getMonth();
    const ano = this.dataAtual.getFullYear();
    
    if (this.vista === 'mes') {
      return `${this.meses[mesIdx]} ${ano}`;
    }
    
    const dias = this.diasDaSemana;
    const mesFimIdx = dias[6].getMonth();
    return `${dias[0].getDate()}–${dias[6].getDate()} ${this.meses[mesFimIdx]} ${ano}`;
  }

  get diasDaSemana(): Date[] {
    const d = new Date(this.dataAtual);
    const dow = d.getDay() === 0 ? 6 : d.getDay() - 1; // Ajuste para Segunda-feira
    d.setDate(d.getDate() - dow);
    return Array.from({ length: 7 }, (_, i) => {
      const dia = new Date(d);
      dia.setDate(d.getDate() + i);
      return dia;
    });
  }

  // --- MÉTODOS DE COMPARAÇÃO E FILTRO ---
  isHoje = (d: Date) => this.mesmoDia(d, this.hoje);

  isPassado = (d: Date) => {
    const h = new Date(); h.setHours(0, 0, 0, 0);
    const temp = new Date(d); temp.setHours(0, 0, 0, 0);
    return temp < h;
  };

  isHoraPassada = (dia: Date, hora: string) => {
    const agora = new Date();
    const d = new Date(dia);
    d.setHours(parseInt(hora.split(':')[0], 10), 0, 0, 0);
    return d < agora;
  };

  eventosNoDia = (d: Date) => this.eventos.filter(e => this.mesmoDia(e.data, d));

  eventoNaHora = (dia: Date, hora: string) => 
    this.eventosNoDia(dia).find(e => e.hora.startsWith(hora.split(':')[0]));

  private mesmoDia = (a: Date, b: Date) => 
    a.getDate() === b.getDate() && 
    a.getMonth() === b.getMonth() && 
    a.getFullYear() === b.getFullYear();

  // --- LÓGICA DA GRELHA ---
  gerarCelulas() {
    this.celulas = [];
    const ano = this.dataAtual.getFullYear();
    const mes = this.dataAtual.getMonth();
    const pDia = new Date(ano, mes, 1);
    
    let ini = pDia.getDay(); 
    ini = ini === 0 ? 6 : ini - 1;

    for (let i = ini - 1; i >= 0; i--) {
      this.celulas.push({ data: new Date(ano, mes, -i), mesAtual: false });
    }

    const uDia = new Date(ano, mes + 1, 0).getDate();
    for (let i = 1; i <= uDia; i++) {
      this.celulas.push({ data: new Date(ano, mes, i), mesAtual: true });
    }

    while (this.celulas.length < 42) {
      const d = new Date(this.celulas[this.celulas.length - 1].data);
      d.setDate(d.getDate() + 1);
      this.celulas.push({ data: d, mesAtual: false });
    }
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}