// src/app/pages/calendario/evento-modal/evento-modal.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonButton, IonIcon, ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline, calendarOutline, locationOutline,
  timeOutline, pricetagOutline, logoGoogle, checkmarkCircleOutline,
} from 'ionicons/icons';
import { Evento } from '../calendario.page';

export const TIPOS_EVENTO = [
  { valor: 'treino', label: 'Treino', cor: 'green' },
  { valor: 'jogo', label: 'Jogo', cor: 'red' },
  { valor: 'reuniao', label: 'Reunião', cor: 'blue' },
  { valor: 'torneio', label: 'Torneio', cor: 'orange' },
  { valor: 'convoc', label: 'Convocatória', cor: 'blue' },
  { valor: 'outro', label: 'Outro', cor: 'green' },
];

// ── Validator fora da classe ───────────────────────────────
function dataNaoPassada(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const selecionada = new Date(control.value);
  selecionada.setHours(0, 0, 0, 0);
  return selecionada < hoje ? { dataPassada: true } : null;
}

@Component({
  selector: 'app-evento-modal',
  templateUrl: './eventomodal.component.html',
  styleUrls: ['./eventomodal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonButton, IonIcon,
  ],
})
export class EventoModalComponent implements OnInit {

  @Input() dataInicial: Date = new Date();
  @Input() evento: Evento | null = null;

  form!: FormGroup;
  tiposEvento = TIPOS_EVENTO;
  isSaving = false;
  modoEdicao = false;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
  ) {
    addIcons({
      closeOutline, calendarOutline, locationOutline,
      timeOutline, pricetagOutline, logoGoogle, checkmarkCircleOutline,
    });
  }

  ngOnInit() {
    this.modoEdicao = !!this.evento;
    this.buildForm();
  }

  buildForm() {
    const dataStr = this.formatarData(this.dataInicial);

    this.form = this.fb.group({
      tipo: [this.evento?.cor ?? '', Validators.required],
      nome: [this.evento?.titulo ?? '', [Validators.required, Validators.minLength(2)]],
      local: [this.evento?.local ?? '', Validators.required],
      data: [dataStr, [Validators.required, dataNaoPassada]],
      horaInicio: [this.evento?.hora ?? '', Validators.required],
      horaFim: ['', Validators.required],
    });
  }

  // ── Repõe para hoje se alguém forçar data passada ──────────
  onDataChange(event: any) {
    const valor = event.target.value;
    if (!valor) return;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const selecionada = new Date(valor);
    selecionada.setHours(0, 0, 0, 0);
    if (selecionada < hoje) {
      this.form.get('data')?.setValue(this.dataMinima);
    }
  }

  // ── Data mínima para o input[type=date] ────────────────────
  get dataMinima(): string {
    return this.formatarData(new Date());
  }

  fechar() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const dados = this.form.value;

    const novoEvento: Partial<Evento> = {
      titulo: dados.nome,
      data: new Date(dados.data),
      hora: dados.horaInicio,
      cor: this.tipoSelecionado?.cor ?? 'blue',
      local: dados.local,
    };

    // TODO: Guardar no API
    // this.eventoService.criar(novoEvento).subscribe(...)

    // TODO: Adicionar ao Google Calendar
    // this.googleCalendarService.criarEvento({
    //   summary:  dados.nome,
    //   location: dados.local,
    //   start:    { dateTime: `${dados.data}T${dados.horaInicio}:00` },
    //   end:      { dateTime: `${dados.data}T${dados.horaFim}:00` },
    // })

    this.isSaving = false;
    this.modalCtrl.dismiss(novoEvento, 'guardar');
  }

  eliminar() {
    // TODO: Chamar API para eliminar
    // this.eventoService.eliminar(this.evento!.id).subscribe(...)

    // TODO: Remover do Google Calendar
    // this.googleCalendarService.eliminarEvento(this.evento!.googleEventId)

    this.modalCtrl.dismiss({ id: this.evento?.id }, 'eliminar');
  }

  get tipoSelecionado() {
    return this.tiposEvento.find(t => t.valor === this.form.get('tipo')?.value);
  }

  get erroData(): string {
    const erros = this.form.get('data')?.errors;
    if (erros?.['dataPassada']) return 'Não é possível criar eventos em datas passadas';
    if (erros?.['required']) return 'Data obrigatória';
    return '';
  }

  isFieldInvalid(field: string): boolean {
    const f = this.form.get(field);
    return !!(f && f.invalid && (f.dirty || f.touched));
  }

  private formatarData(d: Date): string {
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }
}