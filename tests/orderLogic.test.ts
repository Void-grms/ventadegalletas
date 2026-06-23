import { describe, it, expect } from 'vitest';
import { clampQty, calcTotal, buildOrderMessage, buildWhatsAppUrl, buildSheetPayload, SELLERS, type OrderInput } from '../src/scripts/orderLogic';
import { getBox } from '../src/data/boxes';

const base: OrderInput = {
  box: getBox(), qty: 2, seller: SELLERS[0],
  name: 'María Pérez', phone: '999888777', district: 'Miraflores',
};

describe('clampQty', () => {
  it('fuerza mínimo 1 con valores inválidos', () => {
    expect(clampQty('abc')).toBe(1);
    expect(clampQty(0)).toBe(1);
    expect(clampQty(-5)).toBe(1);
  });
  it('respeta el rango y tope 50', () => {
    expect(clampQty('3')).toBe(3);
    expect(clampQty(50)).toBe(50);
    expect(clampQty(51)).toBe(50);
  });
});

describe('calcTotal', () => {
  it('1 caja cuesta S/6', () => {
    expect(calcTotal(1)).toBe(6);
  });
  it('2 cajas cuestan S/10 (promo)', () => {
    expect(calcTotal(2)).toBe(10);
  });
  it('escala de a pares: la caja impar va a S/6', () => {
    expect(calcTotal(3)).toBe(16);   // 10 + 6
    expect(calcTotal(4)).toBe(20);   // 10 + 10
    expect(calcTotal(5)).toBe(26);   // 10 + 10 + 6
  });
  it('acota la cantidad inválida a 1 caja', () => {
    expect(calcTotal(0)).toBe(6);
    expect(calcTotal('abc')).toBe(6);
  });
});

describe('buildOrderMessage', () => {
  it('incluye producto, cantidad, sabor surtido, vendedor, total, entrega y datos', () => {
    const msg = buildOrderMessage(base);
    expect(msg).toContain('Caja de galletas');
    expect(msg).toContain('*Cantidad:* 2 cajas');
    expect(msg).toContain('Surtida (Chocochips, Chocolate, Red velvet, Coco)');
    expect(msg).toContain('*Pedido para:* Patrick');
    expect(msg).toContain('*Total:* S/10');
    expect(msg).toContain('*Fecha de entrega:* miércoles 24 de junio');
    expect(msg).toContain('María Pérez');
    expect(msg).toContain('999888777');
    expect(msg).toContain('Miraflores');
  });
  it('usa singular para 1 caja y aplica precio unitario', () => {
    const msg = buildOrderMessage({ ...base, qty: 1 });
    expect(msg).toContain('*Cantidad:* 1 caja');
    expect(msg).toContain('*Total:* S/6');
  });
  it('refleja el vendedor elegido', () => {
    const msg = buildOrderMessage({ ...base, seller: SELLERS[2] });
    expect(msg).toContain('*Pedido para:* Mishell');
  });
});

describe('buildWhatsAppUrl', () => {
  it('arma la URL wa.me hacia el número del vendedor con el texto codificado', () => {
    const url = buildWhatsAppUrl(base);
    expect(url.startsWith(`https://wa.me/${SELLERS[0].phone}?text=`)).toBe(true);
    expect(url).toContain(encodeURIComponent('Caja de galletas'));
    expect(url).not.toContain('\n'); // saltos de línea codificados
  });
  it('enruta el pedido al WhatsApp del vendedor seleccionado', () => {
    const url = buildWhatsAppUrl({ ...base, seller: SELLERS[3] });
    expect(url.startsWith(`https://wa.me/${SELLERS[3].phone}?text=`)).toBe(true);
  });
});

describe('buildSheetPayload', () => {
  it('arma la fila para Google Sheets con los campos del pedido', () => {
    const row = buildSheetPayload(base);
    expect(row.cantidad).toBe(2);
    expect(row.total).toBe(10);
    expect(row.sabor).toBe('Surtida (Chocochips, Chocolate, Red velvet, Coco)');
    expect(row.vendedor).toBe('Patrick');
    expect(row.nombre).toBe('María Pérez');
    expect(row.telefono).toBe('999888777');
    expect(row.distrito).toBe('Miraflores');
    expect(row.entrega).toBe('miércoles 24 de junio');
  });
});
