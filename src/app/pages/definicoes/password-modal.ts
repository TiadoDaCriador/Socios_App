import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastController } from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-password-modal',
  templateUrl: './password-modal.html',
  styleUrls: ['./password-modal.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CommonModule, FormsModule, TranslateModule],
})
export class PasswordModalComponent {

  passwordAtual   = '';
  passwordNova    = '';
  passwordConfirm = '';
  mostrarAtual    = false;
  mostrarNova     = false;
  mostrarConfirm  = false;
  erroMsg         = '';

  constructor(
    private toastCtrl: ToastController,
    private translate: TranslateService,
  ) {}

  async guardar() {
    this.erroMsg = '';

    if (!this.passwordAtual) {
      this.erroMsg = this.translate.instant('PASSWORD.ERROR_CURRENT');
      return;
    }
    if (!this.passwordNova || this.passwordNova !== this.passwordConfirm) {
      this.erroMsg = this.translate.instant('REGISTER.ERRO_PASSWORDS');
      return;
    }

    const t = await this.toastCtrl.create({
      message: this.translate.instant('PERFIL.SUCESSO'),
      duration: 2000,
      position: 'bottom',
      color: 'success',
    });
    await t.present();

    this.passwordAtual   = '';
    this.passwordNova    = '';
    this.passwordConfirm = '';
  }
}