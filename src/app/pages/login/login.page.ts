import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonIcon, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { LembretesService } from '../../services/lembretes.service';
import { MOCK_USERS, MockUser } from '../../mocks/mock-users';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, IonContent, IonIcon],
})
export class LoginPage {

  nif = '';
  password = '';
  mostrarPassword = false;
  carregando = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private lembretesService: LembretesService,
    private translate: TranslateService,
  ) {
    addIcons({ eyeOutline, eyeOffOutline });
  }

  async entrar() {
    if (!this.nif.trim() || !this.password.trim()) {
      await this.showToast(this.translate.instant('LOGIN.ERRO_CAMPOS'), 'warning');
      return;
    }
    this.carregando = true;
    await new Promise(r => setTimeout(r, 800));
    const user = MOCK_USERS.find((u: MockUser) => u.nif === this.nif.trim() && u.password === this.password);
    this.carregando = false;
    if (user) {
      this.auth.setSession(user.token, user.id);
      this.router.navigateByUrl('/tabs/home', { replaceUrl: true });
    } else {
      await this.showToast(this.translate.instant('LOGIN.ERRO_CREDENCIAIS'), 'danger');
    }
  }

  irParaRegisto() { this.router.navigateByUrl('/register'); }

  private async showToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2500, position: 'bottom', color });
    await t.present();
  }
}