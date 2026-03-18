// src/app/pages/calendario/evento-modal/evento-modal.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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

// TODO: carregar do API → this.eventoService.getTipos()
export const TIPOS_EVENTO = [
  { valor: 'treino',  label: 'Treino',       cor: 'green'  },
  { valor: 'jogo',    label: 'Jogo',         cor: 'red'    },
  { valor: 'reuniao', label: 'Reunião',      cor: 'blue'   },
  { valor: 'torneio', label: 'Torneio',      cor: 'orange' },
  { valor: 'convoc',  label: 'Convocatória', cor: 'blue'   },
  { valor: 'outro',   label: 'Outro',        cor: 'green'  },
];

@Component({
  selector: 'app-evento-modal',
  templateUrl: './evento-modal.component.html',
  styleUrls: ['./evento-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonButton, IonIcon,
  ],
})
export class EventoModalComponent implements OnInit {

  // Data pré-selecionada ao abrir o modal
  @Input() dataInicial: Date = new Date();
  // Se vier um evento existente, entra em modo edição
  @Input() evento: Evento | null = null;

  form!: FormGroup;
  tiposEvento = TIPOS_EVENTO;
  isSaving = false;
  modoEdicao = false;

  constructor(
    private fb:       FormBuilder,
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
      tipo:       [this.evento?.cor    ?? '',    Validators.required],
      nome:       [this.evento?.titulo ?? '',    [Validators.required, Validators.minLength(2)]],
      local:      ['',                           Validators.required],
      data:       [dataStr,                      Validators.required],
      horaInicio: [this.evento?.hora   ?? '',    Validators.required],
      horaFim:    ['',                           Validators.required],
    });
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

    // Constrói o objeto evento para devolver à página
    const novoEvento: Partial<Evento> = {
      titulo: dados.nome,
      data:   new Date(dados.data),
      hora:   dados.horaInicio,
      cor:    this.tipoSelecionado?.cor ?? 'blue',
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