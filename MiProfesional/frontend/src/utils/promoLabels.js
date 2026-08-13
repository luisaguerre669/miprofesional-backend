export function getPromoLabel(remaining) {
  if (remaining <= 0) return { label: 'Promoción finalizada', urgent: false, critical: false, done: true };
  if (remaining <= 20) return { label: `Últimos ${remaining} cupos. La promoción está por finalizar.`, urgent: true, critical: true, done: false };
  if (remaining <= 100) return { label: `Últimos 100 cupos disponibles`, urgent: true, critical: false, done: false };
  return { label: `Quedan ${remaining} de 700 cupos disponibles`, urgent: false, critical: false, done: false };
}

export function getCounterText(remaining) {
  if (remaining <= 0) return 'Promoción finalizada';
  if (remaining <= 20) return `¡Solo quedan ${remaining} cupos!`;
  if (remaining <= 100) return `Quedan ${remaining} cupos`;
  return `Quedan ${remaining} cupos disponibles`;
}
