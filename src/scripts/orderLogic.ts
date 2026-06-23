import type { Box } from '../data/boxes';
import { PRICING } from '../data/boxes';
import { DELIVERY } from '../config/site';

// Vendedores: el cliente elige a quién hacerle el pedido y el WhatsApp se envía a su número.
export interface Seller {
  name: string;
  phone: string;   // número de WhatsApp con código de país (51…)
}

export const SELLERS: Seller[] = [
  { name: 'Patrick', phone: '51970642671' },
  { name: 'Pier',    phone: '51959563362' },
  { name: 'Mishell', phone: '51929924872' },
  { name: 'Rafael',  phone: '51944106281' },
];

// Las cajas vienen surtidas: estos 4 sabores fijos, el cliente no elige.
export const ASSORTED_FLAVORS = ['Chocochips', 'Chocolate', 'Red velvet', 'Coco'] as const;
export const ASSORTED_LABEL = `Surtida (${ASSORTED_FLAVORS.join(', ')})`;

export interface OrderInput {
  box: Box;
  qty: number | string;
  seller: Seller;
  name: string;
  phone: string;
  district: string;
  date?: string;   // yyyy-mm-dd
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
  L.push(`*Sabor:* ${ASSORTED_LABEL}`);
  L.push(`*Total:* S/${total}  (1 caja S/${PRICING.unit} · 2 cajas S/${PRICING.pair})`);
  L.push('');
  L.push(`*Pedido para:* ${o.seller.name}`);
  L.push(`*Nombre:* ${o.name}`);
  L.push(`*Teléfono:* ${o.phone}`);
  L.push(`*Entrega / distrito:* ${o.district}`);
  L.push(`*Fecha de entrega:* ${DELIVERY.label}`);
  L.push('');
  L.push('_Enviado desde la web · Hechas con amor_ ❤️');
  return L.join('\n');
}

export function buildWhatsAppUrl(o: OrderInput): string {
  return `https://wa.me/${o.seller.phone}?text=${encodeURIComponent(buildOrderMessage(o))}`;
}

// Datos planos que se guardan como una fila en Google Sheets.
export function buildSheetPayload(o: OrderInput): Record<string, string | number> {
  const q = clampQty(o.qty);
  return {
    producto: `${o.box.name} (${o.box.cookies} galletas)`,
    cantidad: q,
    sabor: ASSORTED_LABEL,
    total: calcTotal(q),
    vendedor: o.seller.name,
    nombre: o.name,
    telefono: o.phone,
    distrito: o.district,
    entrega: DELIVERY.label,
  };
}

// Registra el pedido en Google Sheets (vía Apps Script) sin bloquear la apertura de WhatsApp.
// Se usa text/plain + no-cors para evitar el preflight CORS que Apps Script no soporta.
export function sendOrderToSheet(endpoint: string, o: OrderInput): void {
  if (!endpoint || typeof fetch === 'undefined') return;
  try {
    fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(buildSheetPayload(o)),
      keepalive: true,
    }).catch(() => { /* registro best-effort: nunca interrumpe el pedido */ });
  } catch { /* fetch no disponible: se ignora */ }
}
