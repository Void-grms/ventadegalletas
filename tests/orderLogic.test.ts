import { describe, it, expect } from 'vitest';
import { clampQty, calcTotal, buildOrderMessage, buildWhatsAppUrl, type OrderInput } from '../src/scripts/orderLogic';
import { getBox } from '../src/data/boxes';

const base: OrderInput = {
  box: getBox(), qty: 2, flavor: 'mixto',
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
  it('incluye producto, cantidad, sabor, total, entrega y datos', () => {
    const msg = buildOrderMessage(base);
    expect(msg).toContain('Caja de galletas');
    expect(msg).toContain('*Cantidad:* 2 cajas');
    expect(msg).toContain('Mixto');
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
  it('omite notas si no se dan, y las incluye si se dan', () => {
    expect(buildOrderMessage(base)).not.toContain('*Notas:*');
    expect(buildOrderMessage({ ...base, notes: 'Es para regalo' })).toContain('Es para regalo');
  });
});

describe('buildWhatsAppUrl', () => {
  it('arma la URL wa.me con el texto codificado', () => {
    const url = buildWhatsAppUrl('51970642671', base);
    expect(url.startsWith('https://wa.me/51970642671?text=')).toBe(true);
    expect(url).toContain(encodeURIComponent('Caja de galletas'));
    expect(url).not.toContain('\n'); // saltos de línea codificados
  });
});
