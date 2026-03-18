// src/app/pages/perfil/perfil.page.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastController } from '@ionic/angular/standalone';
import { of, throwError } from 'rxjs';
import { PerfilPage } from './perfil.page';
import { PerfilService } from '../../services/perfil.service';

const mockPerfil = {
  fotoPerfil: null,
  nomeCompleto: 'João Silva',
  genero: 'masculino',
  dataNascimento: '1990-05-15',
  cartaoCidadao: '',
  nif: '',
  codigoPostal: '4000-123',
  morada: 'Rua das Flores, 45',
  localidade: 'Porto',
  pais: 'Portugal',
  telemovel1: '912345678',
  telemovel2: '',
  email: 'joao@email.com',
  numeroSocio: 'SC-00423',
};

const perfilServiceMock = {
  getPerfil:    () => of(mockPerfil),
  updatePerfil: (dados: any) => of(dados),
};

const toastMock = {
  create: () => Promise.resolve({ present: () => Promise.resolve() }),
};

describe('PerfilPage', () => {
  let component: PerfilPage;
  let fixture: ComponentFixture<PerfilPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilPage, ReactiveFormsModule],
      providers: [
        { provide: PerfilService,    useValue: perfilServiceMock },
        { provide: ToastController, useValue: toastMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar o perfil ao iniciar', () => {
    expect(component.profileForm.get('nomeCompleto')?.value).toBe('João Silva');
    expect(component.profileForm.get('email')?.value).toBe('joao@email.com');
    expect(component.isLoading).toBeFalse();
    expect(component.loadError).toBeFalse();
  });

  it('deve calcular as iniciais corretamente', () => {
    expect(component.initials).toBe('JS');
  });

  it('deve entrar em modo de edição', () => {
    expect(component.isEditing).toBeFalse();
    component.toggleEdit();
    expect(component.isEditing).toBeTrue();
  });

  it('deve marcar campos inválidos ao guardar com formulário vazio', () => {
    component.isEditing = true;
    component.profileForm.reset();
    component.saveProfile();
    expect(component.profileForm.touched).toBeTrue();
  });

  it('deve mostrar erro se o API falhar ao carregar', () => {
    spyOn(perfilServiceMock, 'getPerfil').and.returnValue(
      throwError(() => new Error('API error'))
    );
    component.loadPerfil();
    expect(component.loadError).toBeTrue();
    expect(component.isLoading).toBeFalse();
  });

  it('deve validar formato do NIF', () => {
    const nif = component.profileForm.get('nif');
    nif?.setValue('123');
    expect(nif?.hasError('pattern')).toBeTrue();
    nif?.setValue('123456789');
    expect(nif?.valid).toBeTrue();
  });

  it('deve validar formato do código postal', () => {
    const cp = component.profileForm.get('codigoPostal');
    cp?.setValue('4000');
    expect(cp?.hasError('pattern')).toBeTrue();
    cp?.setValue('4000-123');
    expect(cp?.valid).toBeTrue();
  });
});