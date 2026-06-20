import type { Box } from '../data/boxes';
import { PRICING } from '../data/boxes';
import { DELIVERY } from '../config/site';

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

// Precio escalonado: cada 2 cajas cuestan S/10 (promo) y la caja impar S/6.
// Ej: 1→6, 2→10, 3→16, 4→20, 5→26.
export function calcTotal(qty: number | string): number {
  const n = clampQty(qty);
  const pairs = Math.floor(n / 2);
  const singles = n % 2;
  return pairs * PRICING.pair + singles * PRICING.unit;
}

export const FLAVOR_LABEL: Record<Flavor, string> = {
  vainilla: 'Vainilla',
  chocolate: 'Chocolate',
  mixto: 'Mixto (vainilla + chocolate)',
};

export function formatDateEs(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function buildOrderMessage(o: OrderInput): string {
  const q = clampQty(o.qty);
  const total = calcTotal(q);
  const L: string[] = [];
  L.push('¡Hola Galletas! 🍪 Quiero hacer un pedido:');
  L.push('');
  L.push(`*Producto:* ${o.box.name} (${o.box.cookies} galletas c/u)`);
  L.push(`*Cantidad:* ${q} ${q === 1 ? 'caja' : 'cajas'}`);
  L.push(`*Sabor:* ${FLAVOR_LABEL[o.flavor]}`);
  L.push(`*Total:* S/${total}  (1 caja S/${PRICING.unit} · 2 cajas S/${PRICING.pair})`);
  L.push('');
  L.push(`*Nombre:* ${o.name}`);
  L.push(`*Teléfono:* ${o.phone}`);
  L.push(`*Entrega / distrito:* ${o.district}`);
  L.push(`*Fecha de entrega:* ${DELIVERY.label}`);
  if (o.notes) L.push(`*Notas:* ${o.notes}`);
  L.push('');
  L.push('_Enviado desde la web · Hechas con amor_ ❤️');
  return L.join('\n');
}

export function buildWhatsAppUrl(waNumber: string, o: OrderInput): string {
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(buildOrderMessage(o))}`;
}
