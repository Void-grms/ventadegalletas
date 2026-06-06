import { describe, it, expect } from 'vitest';
import { clampQty, calcTotal, buildOrderMessage, buildWhatsAppUrl, type OrderInput } from '../src/scripts/orderLogic';
import { getBox } from '../src/data/boxes';

const base: OrderInput = {
  box: getBox('mediana'), qty: 2, flavor: 'mixto',
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
  it('multiplica precio por cantidad acotada', () => {
    expect(calcTotal(5, 2)).toBe(10);
    expect(calcTotal(5, 0)).toBe(5);   // qty se acota a 1
    expect(calcTotal(8, 3)).toBe(24);
  });
});

describe('buildOrderMessage', () => {
  it('incluye presentación, cantidad, sabor, total y datos', () => {
    const msg = buildOrderMessage(base);
    expect(msg).toContain('Caja Mediana');
    expect(msg).toContain('*Cantidad:* 2 cajas');
    expect(msg).toContain('Mixto');
    expect(msg).toContain('*Total:* S/10');
    expect(msg).toContain('María Pérez');
    expect(msg).toContain('999888777');
    expect(msg).toContain('Miraflores');
  });
  it('usa singular para 1 caja', () => {
    expect(buildOrderMessage({ ...base, qty: 1 })).toContain('*Cantidad:* 1 caja');
  });
  it('omite fecha y notas si no se dan, y las incluye si se dan', () => {
    expect(buildOrderMessage(base)).not.toContain('Fecha deseada');
    const full = buildOrderMessage({ ...base, date: '2026-06-20', notes: 'Es para regalo' });
    expect(full).toContain('Fecha deseada');
    expect(full).toContain('Es para regalo');
  });
});

describe('buildWhatsAppUrl', () => {
  it('arma la URL wa.me con el texto codificado', () => {
    const url = buildWhatsAppUrl('51970642671', base);
    expect(url.startsWith('https://wa.me/51970642671?text=')).toBe(true);
    expect(url).toContain(encodeURIComponent('Caja Mediana'));
    expect(url).not.toContain('\n'); // saltos de línea codificados
  });
});
