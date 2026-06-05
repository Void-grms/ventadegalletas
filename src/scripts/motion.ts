/**
 * motion.ts — Animaciones globales portadas de _legacy/app.js
 * (reveal on scroll, entrada del hero, migas flotantes, parallax, tilt 3D)
 * NO incluye lógica del formulario de pedido (va en otra tarea).
 */

export function initMotion(): void {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ──────────────────────────────────────────────────────────
     Reveal on scroll (IntersectionObserver)
     ────────────────────────────────────────────────────────── */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  );
  document.querySelectorAll<HTMLElement>('.reveal').forEach((el) => io.observe(el));

  /* ──────────────────────────────────────────────────────────
     Entrada del hero
     ────────────────────────────────────────────────────────── */
  const hero = document.querySelector<HTMLElement>('.hero');
  if (hero) {
    requestAnimationFrame(() => setTimeout(() => hero.classList.add('in'), 120));
  }

  /* ──────────────────────────────────────────────────────────
     Migas flotantes (bg-decor)
     Idempotencia: si ya existen .crumb dentro de .bg-decor, no genera más.
     .bg-decor tiene transition:persist, así que sobrevive entre páginas.
     ────────────────────────────────────────────────────────── */
  (function spawnCrumbs() {
    if (reduce) return;
    const layer = document.querySelector<HTMLElement>('.bg-decor');
    if (!layer) return;

    // Si ya hay migas (navegación con ClientRouter), no duplicar
    if (layer.querySelector('.crumb')) return;

    const N = window.innerWidth < 760 ? 5 : 9;
    for (let i = 0; i < N; i++) {
      const c = document.createElement('span');
      c.className = 'crumb' + (Math.random() < 0.4 ? ' chip' : '');
      const size = 5 + Math.random() * 11;
      c.style.width = size + 'px';
      c.style.height = size + 'px';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.top = Math.random() * 100 + 'vh';
      const dur = 15 + Math.random() * 16;
      c.style.animationDuration = dur + 's';
      c.style.animationDelay = -Math.random() * dur + 's';
      layer.appendChild(c);
    }
  })();

  /* ──────────────────────────────────────────────────────────
     Parallax del hero (pointer + scroll)
     ────────────────────────────────────────────────────────── */
  const pBox = document.querySelector<HTMLElement>('.hero-box');
  const floats = [...document.querySelectorAll<HTMLElement>('.hero-float')];
  const plate = document.querySelector<HTMLElement>('.hero-plate');
  const heroVisual = document.querySelector<HTMLElement>('.hero-visual');

  let mx = 0, my = 0, tmx = 0, tmy = 0;

  if (heroVisual && !reduce) {
    heroVisual.addEventListener('pointermove', (e) => {
      const r = heroVisual.getBoundingClientRect();
      tmx = (e.clientX - r.left) / r.width - 0.5;
      tmy = (e.clientY - r.top) / r.height - 0.5;
    });
    heroVisual.addEventListener('pointerleave', () => {
      tmx = 0;
      tmy = 0;
    });

    (function frame() {
      mx += (tmx - mx) * 0.07;
      my += (tmy - my) * 0.07;
      const sy = window.scrollY;
      if (pBox)
        pBox.style.transform = `translate(-50%,-50%) translate(${mx * 22}px, ${my * 16 - sy * 0.04}px) rotate(${mx * 3}deg)`;
      if (plate)
        plate.style.transform = `translate(${mx * -10}px, ${my * -8 + sy * 0.02}px)`;
      floats.forEach((f, i) => {
        const k = (i + 1) * 1.4;
        f.style.transform = `translate(${mx * -26 * k * 0.4}px, ${my * -22 * k * 0.4 - sy * 0.03 * k}px)`;
      });
      requestAnimationFrame(frame);
    })();
  }

  /* ──────────────────────────────────────────────────────────
     Tilt 3D en cards
     ────────────────────────────────────────────────────────── */
  if (!reduce && window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll<HTMLElement>('.card').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${px * 8}deg) rotateX(${py * -8}deg) translateY(-6px)`;
      });
      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ──────────────────────────────────────────────────────────
     Toggle menú móvil + estado scrolled del header
     Re-enlazado aquí porque header/menú se recrean en cada
     navegación (no tienen transition:persist).
     ────────────────────────────────────────────────────────── */
  const header = document.querySelector<HTMLElement>('.site-header');
  const menu = document.querySelector<HTMLElement>('.mobile-menu');
  const toggle = document.querySelector<HTMLButtonElement>('.nav-toggle');
  const closeBtn = document.querySelector<HTMLButtonElement>('.mobile-close');

  function setMenu(open: boolean) {
    if (menu) menu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (toggle) toggle.addEventListener('click', () => setMenu(true));
  if (closeBtn) closeBtn.addEventListener('click', () => setMenu(false));

  // Estado scrolled del header
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // estado inicial
}
