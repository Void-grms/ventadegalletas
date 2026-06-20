import { clampQty, calcTotal, buildWhatsAppUrl, FLAVOR_LABEL } from './orderLogic';
import type { Flavor, OrderInput } from './orderLogic';
import { getBox } from '../data/boxes';
import { WA_NUMBER, DELIVERY } from '../config/site';

export function initOrderForm(): void {
  const form = document.querySelector<HTMLFormElement>('#order-form');
  if (!form) return;

  // Evitar re-enlazar listeners si ya se inicializó
  if (form.dataset.initialized === '1') return;
  form.dataset.initialized = '1';

  const box = getBox();              // solo hay una caja
  const qtyInput = form.querySelector<HTMLInputElement>('#qty')!;
  const totalEl = form.querySelector<HTMLElement>('#total');
  const countNote = form.querySelector<HTMLElement>('#count-note');

  let flavor: Flavor = 'mixto';

  // Acento del formulario (antes lo fijaba la caja seleccionada)
  form.style.setProperty('--accent-ink', box.accent);

  // ── Cantidad ───────────────────────────────────────────────────────────────
  function updateTotal(): void {
    const q = clampQty(qtyInput.value);
    const total = calcTotal(q);

    if (totalEl) {
      totalEl.innerHTML = `<span class="cur">S/</span>${total}`;
    }
    if (countNote) {
      countNote.textContent = `${q} ${q === 1 ? 'caja' : 'cajas'} · ${box.cookies * q} galletas en total`;
    }
  }

  form.querySelectorAll<HTMLButtonElement>('.qty [data-step]').forEach((btn) => {
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

  // ── Navegación por pasos (wizard) ───────────────────────────────────────────
  const panels = [...form.querySelectorAll<HTMLElement>('.step-panel')];
  const dots = [...form.querySelectorAll<HTMLElement>('.stepper-item')];
  const stepperEl = form.querySelector<HTMLElement>('#stepper');
  const stepNums = panels.map((p) => Number(p.dataset.panel));
  const MIN_STEP = Math.min(...stepNums); // 0 = bienvenida
  const MAX_STEP = Math.max(...stepNums); // 3 = confirmar
  let current = MIN_STEP;

  function val(name: string): string {
    const el = form!.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null;
    return el ? el.value.trim() : '';
  }

  function markErr(el: HTMLElement, on: boolean): void {
    el.classList.toggle('err', on);
  }

  // Valida sólo los campos requeridos del paso indicado. Devuelve true si está OK.
  function validateStep(step: number): boolean {
    if (step !== 2) return true; // pasos 1 y 3 no tienen campos de texto requeridos
    let ok = true;
    (['nombre', 'telefono', 'entrega'] as const).forEach((name) => {
      const el = form!.elements.namedItem(name) as HTMLInputElement;
      const bad = !el.value.trim();
      markErr(el, bad);
      if (bad) ok = false;
    });
    if (!ok) {
      const first = form!.querySelector<HTMLElement>('.step-panel.is-active .err');
      first?.focus({ preventScroll: true });
    }
    return ok;
  }

  function showStep(step: number, scroll = true): void {
    current = Math.min(Math.max(step, MIN_STEP), MAX_STEP);

    panels.forEach((p) => p.classList.toggle('is-active', Number(p.dataset.panel) === current));
    dots.forEach((d) => {
      const n = Number(d.dataset.dot);
      d.classList.toggle('is-active', n === current);
      d.classList.toggle('is-done', n < current);
    });
    // Oculta el indicador de pasos en la pantalla de bienvenida
    stepperEl?.classList.toggle('is-hidden', current < 1);

    if (current === MAX_STEP) buildReview();

    // Lleva el inicio del formulario a la vista al navegar (no en la carga)
    if (scroll) form!.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  form.querySelectorAll<HTMLButtonElement>('.step-next').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!validateStep(current)) return;
      showStep(Number(btn.dataset.go ?? current + 1));
    });
  });
  form.querySelectorAll<HTMLButtonElement>('.step-prev').forEach((btn) => {
    btn.addEventListener('click', () => showStep(Number(btn.dataset.go ?? current - 1)));
  });

  // ── Resumen (paso 3) ─────────────────────────────────────────────────────────
  function buildReview(): void {
    const review = form!.querySelector<HTMLElement>('#review');
    if (!review) return;

    const q = clampQty(qtyInput.value);
    const total = calcTotal(q);

    const rows: [string, string][] = [
      ['Producto', `${box.name} · ${box.cookies} galletas`],
      ['Sabor', FLAVOR_LABEL[flavor]],
      ['Cantidad', `${q} ${q === 1 ? 'caja' : 'cajas'}`],
      ['Fecha de entrega', DELIVERY.label],
      ['A nombre de', val('nombre')],
      ['Teléfono', val('telefono')],
      ['Zona', val('entrega')],
    ];
    if (val('notas')) rows.push(['Notas', val('notas')]);

    review.replaceChildren();
    rows.forEach(([k, v]) => {
      const row = document.createElement('div');
      row.className = 'review-row';
      const rk = document.createElement('span');
      rk.className = 'rk';
      rk.textContent = k;
      const rv = document.createElement('span');
      rv.className = 'rv';
      rv.textContent = v;
      row.append(rk, rv);
      review.appendChild(row);
    });

    const totalRow = document.createElement('div');
    totalRow.className = 'review-total';
    const tl = document.createElement('span');
    tl.className = 'rt-lbl';
    tl.textContent = 'Total';
    const tv = document.createElement('span');
    tv.className = 'rt-val';
    tv.innerHTML = `<span class="cur">S/</span>${total}`;
    totalRow.append(tl, tv);
    review.appendChild(totalRow);
  }

  // ── Submit final ─────────────────────────────────────────────────────────────
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Enter en un campo de un paso previo = avanzar, no enviar (no saltar la revisión)
    if (current < MAX_STEP) {
      if (validateStep(current)) showStep(current + 1);
      return;
    }

    // Defensa: si por algún motivo faltan datos del paso 2, vuelve a él.
    if (!validateStep(2)) {
      showStep(2);
      return;
    }

    const qty = clampQty(qtyInput.value);
    const notas = val('notas');

    const order: OrderInput = {
      box,
      qty,
      flavor,
      name: val('nombre'),
      phone: val('telefono'),
      district: val('entrega'),
      date: DELIVERY.date,
      ...(notas ? { notes: notas } : {}),
    };

    const url = buildWhatsAppUrl(WA_NUMBER, order);

    // Pequeña animación de confirmación en el botón
    const submitBtn = form.querySelector<HTMLButtonElement>('button[type=submit]');
    if (submitBtn && typeof submitBtn.animate === 'function') {
      submitBtn.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(.96)' }, { transform: 'scale(1)' }],
        { duration: 260 },
      );
    }

    window.open(url, '_blank');
  });

  // Estado inicial
  updateTotal();
  showStep(MIN_STEP, false);
}
