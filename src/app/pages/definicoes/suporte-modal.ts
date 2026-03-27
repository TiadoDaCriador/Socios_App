import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mailOutline, sendOutline, informationCircleOutline } from 'ionicons/icons';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-suporte-modal',
    templateUrl: './suporte-modal.html',
    styleUrls: ['./suporte-modal.scss'],
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    imports: [CommonModule, IonIcon, TranslateModule],
})
export class SuporteModalComponent {

    constructor() {
        addIcons({ mailOutline, sendOutline, informationCircleOutline });
    }

    enviarEmail() {
        window.open('mailto:suporte@associacao.pt?subject=Suporte App Socios', '_blank');
    }
}