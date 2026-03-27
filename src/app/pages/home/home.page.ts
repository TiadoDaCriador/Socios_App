import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, 
  IonContent, IonIcon 
} from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { EventosService, EventoLista } from '../../services/eventos.service';
import { QuotasService } from '../quotas/quotas.service';
import { PerfilService } from '../../services/perfil.service';
import { addIcons } from 'ionicons';
import { 
  alertCircleOutline, calculatorOutline, checkmarkCircleOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, IonHeader, IonToolbar, IonButtons, IonMenuButton, 
    IonTitle, IonContent, IonIcon
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  diasScroll: Date[] = [];
  dataAtiva: Date = new Date();
  hoje: Date = new Date();
  listaEventos: EventoLista[] = [];
  valorDivida: number = 0;
  usuario = { nome: '', numeroSocio: '' };
  
  private subs = new Subscription();

  constructor(
    private eventosService: EventosService,
    private quotasService: QuotasService,
    private perfilService: PerfilService,
    private router: Router,
  ) {
    addIcons({ 
      alertCircleOutline, 
      calculatorOutline, 
      checkmarkCircleOutline 
    });
  }

  ngOnInit() {
    this.gerarDias();
    this.subs.add(this.perfilService.getPerfil().subscribe(perfil => {
      if (perfil) {
        const nomes = perfil.nomeCompleto.trim().split(' ');
        this.usuario.nome = `${nomes[0]} ${nomes[nomes.length - 1]}`;
        this.usuario.numeroSocio = perfil.numeroSocio;
      }
    }));
    this.subs.add(this.eventosService.eventos$.subscribe(lista => this.listaEventos = lista));
    this.subs.add(this.quotasService.totalDivida$.subscribe(v => this.valorDivida = v));
    this.subs.add(this.eventosService.dataSelecionada$.subscribe(d => this.dataAtiva = d));
  }

  gerarDias() {
    const start = new Date();
    this.diasScroll = []; // Limpa antes de gerar
    for (let i = 0; i <= 30; i++) {
      const d = new Date();
      d.setDate(start.getDate() + i);
      this.diasScroll.push(d);
    }
  }

  irParaQuotas() { this.router.navigate(['/tabs/quotas']); }
  irParaEventos() { this.router.navigate(['/tabs/eventos']); }
  selecionarDia(dia: Date) { this.eventosService.setDataSelecionada(dia); }
  isMesmoDia = (d1: Date, d2: Date) => d1.toDateString() === d2.toDateString();
  
  ngOnDestroy() { 
    this.subs.unsubscribe(); 
  }
}