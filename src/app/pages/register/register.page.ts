import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
// Adicionado IonItem para o alinhamento dos termos
import { IonContent, IonIcon, IonCheckbox, IonItem, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline, lockClosedOutline, cardOutline, mailOutline, chevronBackOutline } from 'ionicons/icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  // IonItem e IonCheckbox adicionados aqui para o HTML reconhecer
  imports: [
    CommonModule, 
    FormsModule, 
    TranslateModule, 
    IonContent, 
    IonIcon, 
    IonCheckbox, 
    IonItem
  ],
})
export class RegisterPage {
  email = ''; 
  nif = ''; 
  password = ''; 
  confirmarPassword = '';
  mostrarPassword = false; 
  mostrarConfirmar = false; 
  carregando = false; 
  aceitaTermos = false; 

  constructor(
    private auth: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private translate: TranslateService,
  ) {
    addIcons({ 
      eyeOutline, 
      eyeOffOutline, 
      lockClosedOutline, 
      cardOutline, 
      mailOutline, 
      chevronBackOutline 
    });
  }

  // Mantém a tua função registar() igual
  async registar() {
    // Teu código de validação e lógica de registo aqui
  }

  voltar() { 
    this.router.navigateByUrl('/login'); 
  }
}