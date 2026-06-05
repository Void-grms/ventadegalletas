import { clampQty, calcTotal, buildWhatsAppUrl } from './orderLogic';
import type { Flavor, OrderInput } from './orderLogic';
import { getBox } from '../data/boxes';
import { WA_NUMBER } from '../config/site';

export function initOrderForm(): void {
  const form = document.querySelector<HTMLFormElement>('#order-form');
  if (!form) return;

  // Evitar re-enlazar listeners si ya se inicializó
  if (form.dataset.initialized === '1') return;
  form.dataset.initialized = '1';

  const choices = [...form.querySelectorAll<HTMLElement>('.choice[data-box]')];
  const qtyInput = form.querySelector<HTMLInputElement>('#qty')!;
  const totalEl = form.querySelector<HTMLElement>('#total');
  const countNote = form.querySelector<HTMLElement>('#count-note');

  let selectedKey = 'mediana';
  let flavor: Flavor = 'mixto';

  // ── Selección de caja ──────────────────────────────────────────────────────
  function selectBox(key: string): void {
    const box = getBox(key);
    selectedKey = box.key;

    choices.forEach((c) => {
      const isSelected = c.dataset.box === selectedKey;
      c.classList.toggle('sel', isSelected);
      const radio = c.querySelector<HTMLInputElement>('input');
      if (radio) radio.checked = isSelected;
      if (isSelected) {
        form.style.setProperty('--accent-ink', box.accent);
      }
    });

    updateTotal();
  }

  choices.forEach((c) => {
    c.addEventListener('click', () => selectBox(c.dataset.box ?? 'mediana'));
  });

  // ── Cantidad ───────────────────────────────────────────────────────────────
  function updateTotal(): void {
    const box = getBox(selectedKey);
    const q = clampQty(qtyInput.value);
    const total = calcTotal(box.price, q);

    if (totalEl) {
      totalEl.innerHTML = `<span class="cur">S/</span>${total}`;
    }
    if (countNote) {
      countNote.textContent = `${q} ${q === 1 ? 'caja' : 'cajas'} · ${box.cookies * q} galletas en total`;
    }
  }

  form.querySelectorAll<HTMLButtonElement>('[data-step]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const step = parseInt(btn.dataset.step ?? '0', 10);
      qtyInput.value = String(clampQty(parseInt(qtyInput.value, 10) + step));
      updateTotal();
    });
  });

  qtyInput.addEventListener('input', updateTotal);
  qtyInput.addEventListener('blur', () => {
    qtyInput.value = String(clampQty(qtyInput.value));
    updateTotal();
  });

  // ── Sabor ──────────────────────────────────────────────────────────────────
  const flavorEls = [...form.querySelectorAll<HTMLElement>('.flavor')];
  flavorEls.forEach((f) => {
    f.addEventListener('click', () => {
      flavor = (f.dataset.flavor ?? 'mixto') as Flavor;
      flavorEls.forEach((x) => {
        x.classList.toggle('sel', x === f);
        const radio = x.querySelector<HTMLInputElement>('input');
        if (radio) radio.checked = x === f;
      });
    });
  });

  // ── Validación y submit ────────────────────────────────────────────────────
  function markErr(el: HTMLElement, on: boolean): void {
    el.classList.toggle('err', on);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = (form.elements.namedItem('nombre') as HTMLInputElement).value.trim();
    const telefono = (form.elements.namedItem('telefono') as HTMLInputElement).value.trim();
    const entrega = (form.elements.namedItem('entrega') as HTMLInputElement).value.trim();
    const notas = (form.elements.namedItem('notas') as HTMLTextAreaElement).value.trim();
    const fecha = (form.elements.namedItem('fecha') as HTMLInputElement).value;

    let ok = true;
    const fields: [string, string][] = [
      ['nombre', nombre],
      ['telefono', telefono],
      ['entrega', entrega],
    ];

    fields.forEach(([fieldName, value]) => {
      const el = form.elements.namedItem(fieldName) as HTMLInputElement;
      const bad = !value;
      markErr(el, bad);
      if (bad) ok = false;
    });

    if (!ok) {
      const first = form.querySelector<HTMLElement>('.err');
      if (first) {
        first.focus({ preventScroll: true });
        first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const box = getBox(selectedKey);
    const qty = clampQty(qtyInput.value);

    const order: OrderInput = {
      box,
      qty,
      flavor,
      name: nombre,
      phone: telefono,
      district: entrega,
      ...(fecha ? { date: fecha } : {}),
      ...(notas ? { notes: notas } : {}),
    };

    const url = buildWhatsAppUrl(WA_NUMBER, order);

    // Pequeña animación de confirmación en el botón
    const submitBtn = form.querySelector<HTMLButtonElement>('button[type=submit]');
    if (submitBtn && typeof submitBtn.animate === 'function') {
      submitBtn.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(.96)' }, { transform: 'scale(1)' }],
        { duration: 260 }
      );
    }

    window.open(url, '_blank');
  });

  // ── Preselección por ?caja= ────────────────────────────────────────────────
  const params = new URLSearchParams(location.search);
  selectBox(params.get('caja') ?? 'mediana');
}
