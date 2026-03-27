import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { documentTextOutline, openOutline, informationCircleOutline } from 'ionicons/icons';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-termos-modal',
  templateUrl: './termos-modal.html',
  styleUrls: ['./termos-modal.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, IonIcon, TranslateModule],
})
export class TermosModalComponent {

  constructor() {
    addIcons({ documentTextOutline, openOutline, informationCircleOutline });
  }

  abrirTermos() {
    window.open('https://associacao.pt/termos-e-condicoes', '_blank');
  }
}