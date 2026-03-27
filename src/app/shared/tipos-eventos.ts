export const TIPOS_EVENTO: { valor: string; label: string; cor: string }[] = [
  { valor: 'aulas',        label: 'Aulas',        cor: '#27ae60' },  // verde
  { valor: 'concertos',    label: 'Concertos',    cor: '#e74c3c' },  // vermelho
  { valor: 'desfile',      label: 'Desfile',      cor: '#3498db' },  // azul
  { valor: 'ensaio-geral', label: 'Ensaio Geral', cor: '#f39c12' },  // laranja
  { valor: 'festa',        label: 'Festa',        cor: '#e91e8c' },  // rosa
  { valor: 'jantar',       label: 'Jantar',       cor: '#1abc9c' },  // turquesa
  { valor: 'missa',        label: 'Missa',        cor: '#9b59b6' },  // roxo
  { valor: 'procissao',    label: 'Procissão',    cor: '#0098DB' },  // azul ciano (cor da app)
  { valor: 'reserva-sala', label: 'Reserva Sala', cor: '#ff7675' },  // salmão
];

export function corDoTipo(valor: string): string {
  return TIPOS_EVENTO.find(t => t.valor === valor)?.cor ?? '#0098DB';
}

export function labelDoTipo(valor: string): string {
  return TIPOS_EVENTO.find(t => t.valor === valor)?.label ?? valor;
}