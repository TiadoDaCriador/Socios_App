// src/app/pages/login/login.page.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonIcon, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline, lockClosedOutline, cardOutline } from 'ionicons/icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { LembretesService } from '../../services/lembretes.service';
import { MOCK_USERS, MockUser } from '../../mocks/mock-users';
import { Convocatoria } from '../convocatorias/convocatorias.page';

const CONVOCATORIAS_MOCK: Convocatoria[] = [
  { id: 1, titulo: 'Concerto Municipal', descricao: 'Foste convocado para participar no concerto municipal.', dia: new Date(2026, 2, 25, 10, 0), hora: '10:00', local: 'Estádio Municipal', tipologia: 'concertos', resposta: 'pendente' },
  { id: 2, titulo: 'Aula de Formação', descricao: 'Foste convocado para a aula de formação.', dia: new Date(2026, 2, 20, 9, 0), hora: '09:00', local: 'Campo de Treinos', tipologia: 'aulas', resposta: 'pendente' },
  { id: 3, titulo: 'Ensaio Geral', descricao: 'Foste convocado para o ensaio geral.', dia: new Date(2026, 2, 18, 18, 0), hora: '18:00', local: 'Sede do Clube', tipologia: 'ensaio-geral', resposta: 'pendente' },
  { id: 4, titulo: 'Desfile de Abril', descricao: 'Foste convocado para o desfile.', dia: new Date(2026, 3, 5, 14, 0), hora: '14:00', local: 'Pavilhão Norte', tipologia: 'desfile', resposta: 'pendente' },
];

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, IonContent, IonIcon],
})
export class LoginPage {

  nif = ''; password = ''; mostrarPassword = false; carregando = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private lembretesService: LembretesService,
    private translate: TranslateService,
  ) {
    addIcons({ eyeOutline, eyeOffOutline, lockClosedOutline, cardOutline });
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
      this.lembretesService.iniciar(CONVOCATORIAS_MOCK);
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