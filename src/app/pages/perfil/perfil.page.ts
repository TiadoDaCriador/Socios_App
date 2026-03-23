import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonButtons, IonMenuButton,
  IonTitle, IonContent, IonButton, IonIcon, IonSpinner,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  createOutline, closeOutline, cameraOutline, personOutline,
  personCircleOutline, transgenderOutline, calendarOutline,
  idCardOutline, documentTextOutline, mapOutline, homeOutline,
  businessOutline, globeOutline, callOutline, phonePortraitOutline,
  mailOutline, cardOutline, lockClosedOutline,
  checkmarkCircleOutline, chevronDownOutline, locationOutline,
  alertCircleOutline,
} from 'ionicons/icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PerfilService, PerfilLocal } from '../../services/perfil.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, TranslateModule,
    IonHeader, IonToolbar, IonButtons, IonMenuButton,
    IonTitle, IonContent, IonButton, IonIcon, IonSpinner,
  ],
})
export class PerfilPage implements OnInit {
  profileForm!: FormGroup;
  profileImagePreview: string | null = null;
  isEditing = false;
  isLoading = false;
  isSaving = false;
  loadError = false;

  paisList = ['Portugal', 'Brasil', 'Espanha', 'França', 'Alemanha', 'Reino Unido', 'Itália', 'Angola', 'Moçambique', 'Cabo Verde', 'Outro'];

  constructor(
    private fb: FormBuilder,
    private perfilService: PerfilService,
    private toastCtrl: ToastController,
    private translate: TranslateService
  ) {
    addIcons({
      createOutline, closeOutline, cameraOutline, personOutline,
      personCircleOutline, transgenderOutline, calendarOutline,
      idCardOutline, documentTextOutline, mapOutline, homeOutline,
      businessOutline, globeOutline, callOutline, phonePortraitOutline,
      mailOutline, cardOutline, lockClosedOutline,
      checkmarkCircleOutline, chevronDownOutline, locationOutline,
      alertCircleOutline,
    });
  }

  ngOnInit() {
    this.buildForm();
    this.loadPerfil();
  }

  buildForm() {
    this.profileForm = this.fb.group({
      nomeCompleto: [{ value: '', disabled: true }],
      genero: [{ value: '', disabled: true }],
      dataNascimento: [{ value: '', disabled: true }],
      cartaoCidadao: [{ value: '', disabled: true }],
      nif: [{ value: '', disabled: true }],
      numeroSocio: [{ value: '', disabled: true }],
      codigoPostal: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{3}$/)]],
      morada: ['', Validators.required],
      localidade: ['', Validators.required],
      pais: ['Portugal', Validators.required],
      telemovel1: ['', [Validators.required, Validators.pattern(/^[29]\d{8}$/)]],
      telemovel2: ['', Validators.pattern(/^[29]\d{8}$/)],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  loadPerfil() {
    this.isLoading = true;
    this.loadError = false;
    this.perfilService.getPerfil().subscribe({
      next: (perfil) => {
        this.applyPerfil(perfil);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.loadError = true;
      },
    });
  }

  applyPerfil(perfil: PerfilLocal) {
    this.profileForm.patchValue(perfil);
    this.profileImagePreview = perfil.fotoPerfil;
  }

  toggleEdit() {
    if (this.isEditing) this.loadPerfil();
    this.isEditing = !this.isEditing;
  }

  onPhotoChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profileImagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  async saveProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const dados: PerfilLocal = {
      ...this.profileForm.getRawValue(),
      fotoPerfil: this.profileImagePreview
    };

    this.perfilService.updatePerfil(dados).subscribe({
      next: async (perfil) => {
        this.applyPerfil(perfil);
        this.isSaving = false;
        this.isEditing = false;
        const msg = await firstValueFrom(this.translate.get('PERFIL.SUCESSO'));
        await this.showToast(msg, 'success');
      },
      error: async () => {
        this.isSaving = false;
        const msg = await firstValueFrom(this.translate.get('PERFIL.ERRO_SAVE'));
        await this.showToast(msg, 'danger');
      },
    });
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
      color
    });
    await toast.present();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (!field) return '';

    if (field.hasError('required')) return 'Campo obrigatório';
    if (field.hasError('email')) return 'Email inválido';

    if (field.hasError('pattern')) {
      if (fieldName === 'codigoPostal') return 'Formato: 0000-000';
      if (fieldName.startsWith('telemovel')) return 'Número inválido (9 dígitos)';
    }
    return '';
  }

  get initials(): string {
    const name: string = this.profileForm.get('nomeCompleto')?.value || '';
    if (!name) return '??';
    return name.split(' ')
      .filter(n => n.length > 0)
      .slice(0, 2)
      .map((n: string) => n[0])
      .join('')
      .toUpperCase();
  }
}