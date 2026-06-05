import type { Box } from '../data/boxes';

export type Flavor = 'vainilla' | 'chocolate' | 'mixto';

export interface OrderInput {
  box: Box;
  qty: number | string;
  flavor: Flavor;
  name: string;
  phone: string;
  district: string;
  date?: string;   // yyyy-mm-dd
  notes?: string;
}

export function clampQty(v: number | string): number {
  let n = typeof v === 'string' ? parseInt(v, 10) : v;
  if (isNaN(n) || n < 1) n = 1;
  if (n > 50) n = 50;
  return n;
}

export function calcTotal(price: number, qty: number | string): number {
  return price * clampQty(qty);
}

const FLAVOR_LABEL: Record<Flavor, string> = {
  vainilla: 'Vainilla',
  chocolate: 'Chocolate',
  mixto: 'Mixto (vainilla + chocolate)',
};

function formatDateEs(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function buildOrderMessage(o: OrderInput): string {
  const q = clampQty(o.qty);
  const total = o.box.price * q;
  const L: string[] = [];
  L.push('¡Hola Galletas! 🍪 Quiero hacer un pedido:');
  L.push('');
  L.push(`*Presentación:* ${o.box.name} (${o.box.cookies} galletas) — S/${o.box.price} c/u`);
  L.push(`*Cantidad:* ${q} ${q === 1 ? 'caja' : 'cajas'}`);
  L.push(`*Sabor:* ${FLAVOR_LABEL[o.flavor]}`);
  L.push(`*Total:* S/${total}`);
  L.push('');
  L.push(`*Nombre:* ${o.name}`);
  L.push(`*Teléfono:* ${o.phone}`);
  L.push(`*Entrega / distrito:* ${o.district}`);
  if (o.date) L.push(`*Fecha deseada:* ${formatDateEs(o.date)}`);
  if (o.notes) L.push(`*Notas:* ${o.notes}`);
  L.push('');
  L.push('_Enviado desde la web · Hechas con amor_ ❤️');
  return L.join('\n');
}

export function buildWhatsAppUrl(waNumber: string, o: OrderInput): string {
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(buildOrderMessage(o))}`;
}
