export const TIPOS_EVENTO: { valor: string; label: string; cor: string }[] = [
  { valor: 'aulas',        label: 'Aulas',        cor: 'green'  },
  { valor: 'concertos',    label: 'Concertos',    cor: 'red'    },
  { valor: 'desfile',      label: 'Desfile',      cor: 'blue'   },
  { valor: 'ensaio-geral', label: 'Ensaio Geral', cor: 'orange' },
  { valor: 'festa',        label: 'Festa',        cor: 'red'    },
  { valor: 'jantar',       label: 'Jantar',       cor: 'green'  },
  { valor: 'missa',        label: 'Missa',        cor: 'red'    },
  { valor: 'procissao',    label: 'Procissão',    cor: 'blue'   },
  { valor: 'reserva-sala', label: 'Reserva Sala', cor: 'orange' },
];

export function corDoTipo(valor: string): string {
  return TIPOS_EVENTO.find(t => t.valor === valor)?.cor ?? 'blue';
}

export function labelDoTipo(valor: string): string {
  return TIPOS_EVENTO.find(t => t.valor === valor)?.label ?? valor;
}