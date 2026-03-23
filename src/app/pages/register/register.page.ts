// src/app/pages/register/register.page.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonIcon, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline, lockClosedOutline, cardOutline, mailOutline, chevronBackOutline } from 'ionicons/icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { MOCK_USERS, MockUser } from '../../mocks/mock-users';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, IonContent, IonIcon],
})
export class RegisterPage {

  email = ''; nif = ''; password = ''; confirmarPassword = '';
  mostrarPassword = false; mostrarConfirmar = false; carregando = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private translate: TranslateService,
  ) {
    addIcons({ eyeOutline, eyeOffOutline, lockClosedOutline, cardOutline, mailOutline, chevronBackOutline });
  }

  async registar() {
    if (!this.email.trim() || !this.nif.trim() || !this.password.trim()) {
      await this.showToast(this.translate.instant('REGISTER.ERRO_CAMPOS'), 'warning'); return;
    }
    if (this.nif.length !== 9 || !/^\d+$/.test(this.nif)) {
      await this.showToast(this.translate.instant('REGISTER.ERRO_NIF'), 'warning'); return;
    }
    if (this.password !== this.confirmarPassword) {
      await this.showToast(this.translate.instant('REGISTER.ERRO_PASSWORDS'), 'warning'); return;
    }
    if (this.password.length < 6) {
      await this.showToast(this.translate.instant('REGISTER.ERRO_PASSWORD_CURTA'), 'warning'); return;
    }
    this.carregando = true;
    await new Promise(r => setTimeout(r, 800));
    const existe = MOCK_USERS.find((u: MockUser) => u.nif === this.nif.trim() || u.email === this.email.trim());
    if (existe) {
      this.carregando = false;
      await this.showToast(this.translate.instant('REGISTER.ERRO_JA_REGISTADO'), 'danger'); return;
    }
    const novoUser: MockUser = { id: String(Date.now()), email: this.email.trim(), nif: this.nif.trim(), password: this.password, role: 'socio', token: `mock-token-${Date.now()}` };
    MOCK_USERS.push(novoUser);
    this.auth.setSession(novoUser.token, novoUser.id);
    this.carregando = false;
    await this.showToast(this.translate.instant('REGISTER.SUCESSO'), 'success');
    this.router.navigateByUrl('/tabs/home', { replaceUrl: true });
  }

  voltar() { this.router.navigateByUrl('/login'); }

  private async showToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2500, position: 'bottom', color });
    await t.present();
  }
}