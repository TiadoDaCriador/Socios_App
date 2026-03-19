import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonButtons, IonMenuButton,
  IonTitle, IonContent, IonSkeletonText, IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { walletOutline } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { ContaCorrenteService, Account } from '../../services/conta-corrente.service';
import { CalendarioGrelhaComponent } from './calendario-grelha/calendario-grelha.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonButtons, IonMenuButton,
    IonTitle, IonContent, IonSkeletonText, IonIcon,
    CalendarioGrelhaComponent,
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  account: Account | null = null;
  private sub?: Subscription;

  constructor(private contaService: ContaCorrenteService) {
    addIcons({ walletOutline });
  }

  ngOnInit() {
    this.sub = this.contaService.account$.subscribe(acc => (this.account = acc));
    this.contaService.loadFromAssets().subscribe({ error: () => {} });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}