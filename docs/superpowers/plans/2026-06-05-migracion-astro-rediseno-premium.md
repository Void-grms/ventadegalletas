# Migración a Astro + rediseño premium — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconstruir el sitio estático de galletas sobre Astro 5 + Tailwind v4, con rediseño premium cálido-artesanal, multipágina y sin footer, conservando el flujo de pedido por WhatsApp.

> **Nota de ejecución (Task 1):** se usa **Astro 5.18.x** en lugar de Astro 6. La 6.x trae el bundler `rolldown-vite`, incompatible con `@tailwindcss/vite` 4.3 (error `Missing field tsconfigPaths`). Lee cualquier mención a "Astro 6" más abajo como "Astro 5".

**Architecture:** Astro con componentes `.astro`; datos de las 3 cajas y la config de marca centralizados y tipados; la lógica del pedido (cálculo, validación, mensaje WhatsApp) se extrae a funciones puras testeables con Vitest. Estilos con Tailwind v4: **tokens en `@theme` + clases de componente con `@apply`** (portadas y refinadas desde el `styles.css` actual) + utilidades donde convenga. Esto preserva el markup semántico existente y permite materializar el rediseño premium desde un punto central.

**Tech Stack:** Astro 5.18.x · Tailwind CSS 4.3.x (`@tailwindcss/vite`) · TypeScript · Vitest 4.x · Node 24.

---

## Convención de trabajo

- Trabaja en una rama: `git checkout -b feat/migracion-astro` antes de la Task 1.
- El sitio original queda en `_legacy/` como **referencia de contenido y estilos** durante la migración; se elimina en la Task 12. Ese código también está en el commit baseline `e0ad09e`.
- Tras cada Task hay un commit. Mensajes en español.
- Verificación visual: `npm run dev` → http://localhost:4321 (puerto por defecto de Astro).

## File Structure (destino)

```
galletas/
├── public/
│   ├── assets/        → logo.png, box-pequena.png, box-mediana.png, box-grande.png
│   └── uploads/       → imágenes existentes
├── src/
│   ├── layouts/BaseLayout.astro       → <head>, fuentes, fondo, Header, MobileMenu, WhatsAppFab, ClientRouter, <slot/> (SIN footer)
│   ├── components/
│   │   ├── Header.astro               → marca + nav + CTA + estado scroll
│   │   ├── MobileMenu.astro           → menú lateral móvil
│   │   ├── WhatsAppFab.astro          → botón flotante WhatsApp
│   │   ├── BoxCard.astro              → tarjeta de caja (props desde boxes.ts)
│   │   ├── ValueCard.astro            → tarjeta de valor
│   │   └── StepCard.astro             → tarjeta de paso
│   ├── config/site.ts                 → WA_NUMBER, WA_LINK, BRAND, NAV
│   ├── data/boxes.ts                  → las 3 cajas (fuente única, tipada)
│   ├── scripts/
│   │   ├── orderLogic.ts              → funciones PURAS (testeadas con Vitest)
│   │   ├── orderForm.ts               → wiring DOM del formulario (usa orderLogic)
│   │   └── motion.ts                  → reveal/crumbs/parallax/tilt (animaciones)
│   ├── pages/
│   │   ├── index.astro · cajas.astro · nosotros.astro · como-pedir.astro · pedir.astro
│   └── styles/global.css              → @import tailwind + @theme + @layer components
├── tests/orderLogic.test.ts
├── astro.config.mjs · tsconfig.json · vitest.config.ts · package.json
```

---

### Task 1: Scaffold Astro 5 + Tailwind v4 + reorganización de archivos

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/pages/index.astro`, `src/styles/global.css`
- Move: sitio actual → `_legacy/`; `assets/` y `uploads/` → `public/`

- [ ] **Step 1: Crear la rama de trabajo**

```bash
git checkout -b feat/migracion-astro
```

- [ ] **Step 2: Mover el sitio actual a `_legacy/` y las imágenes a `public/`**

```bash
mkdir -p _legacy public
git mv index.html cajas.html nosotros.html como-pedir.html pedir.html app.js layout.js styles.css _legacy/
git mv assets public/assets
git mv uploads public/uploads
```

Expected: `git status` muestra los archivos renombrados a `_legacy/` y `public/`.

- [ ] **Step 3: Crear `package.json`**

```json
{
  "name": "galletas",
  "type": "module",
  "version": "1.0.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run"
  },
  "dependencies": {
    "astro": "^5.18.2"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.3.0",
    "tailwindcss": "^4.3.0",
    "vitest": "^4.1.8",
    "@astrojs/check": "^0.9.4",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 4: Crear `astro.config.mjs`**

```js
// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 5: Crear `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "_legacy"]
}
```

- [ ] **Step 6: Crear `src/styles/global.css` mínimo (se completa en Task 2)**

```css
@import "tailwindcss";
```

- [ ] **Step 7: Crear `src/pages/index.astro` placeholder**

```astro
---
import '../styles/global.css';
---
<!doctype html>
<html lang="es">
  <head><meta charset="utf-8" /><title>Galletas</title></head>
  <body class="bg-paper text-ink"><h1 class="text-3xl font-bold p-8">Galletas — en migración</h1></body>
</html>
```

- [ ] **Step 8: Instalar dependencias**

Run: `npm install`
Expected: crea `node_modules/` y `package-lock.json` sin errores.

- [ ] **Step 9: Verificar build**

Run: `npm run build`
Expected: "Complete!" sin errores; genera `dist/`.

- [ ] **Step 10: Verificar dev (manual)**

Run: `npm run dev` → abrir http://localhost:4321 → ver el H1. Detener con Ctrl+C.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro 6 + Tailwind v4 y reorganiza archivos a _legacy/ y public/"
```

---

### Task 2: Sistema de diseño — tokens + clases de componente

**Files:**
- Modify: `src/styles/global.css`
- Reference: `_legacy/styles.css` (fuente de las reglas a portar)

- [ ] **Step 1: Definir tokens en `@theme` y las fuentes**

Reemplaza `src/styles/global.css` por:

```css
@import "tailwindcss";

/* Fuentes */
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Hanken+Grotesk:wght@400;500;600;700;800&display=swap');

@theme {
  /* Superficies */
  --color-paper: #F6EEE0;
  --color-paper-2: #F0E4D0;
  --color-paper-3: #EADBC2;
  --color-card: #FCF8F0;
  --color-card-2: #FBF5EA;
  /* Tinta */
  --color-ink: #2C1B11;
  --color-ink-2: #4A3422;
  --color-ink-soft: #6B523E;
  --color-ink-faint: #9A836E;
  /* Marca */
  --color-cocoa: #7A5638;
  --color-kraft: #C49A6C;
  /* Acentos */
  --color-rose: #C97E78;
  --color-rose-deep: #B5645E;
  --color-mustard: #CC8A3C;
  --color-mustard-deep: #B5752A;
  --color-olive: #87894C;
  --color-olive-deep: #6F7140;

  --font-display: "Bricolage Grotesque", "Hanken Grotesk", sans-serif;
  --font-body: "Hanken Grotesk", system-ui, sans-serif;

  --radius-sm: 12px;
  --radius-md: 20px;
  --radius-lg: 30px;

  --ease-soft: cubic-bezier(.22,.61,.36,1);
  --ease-out: cubic-bezier(.16,1,.3,1);

  --shadow-soft-sm: 0 2px 10px rgba(60,40,20,.06);
  --shadow-soft-md: 0 14px 38px -16px rgba(60,40,20,.22);
  --shadow-soft-lg: 0 40px 80px -30px rgba(50,30,14,.40);
}
```

- [ ] **Step 2: Añadir base y clases de componente con `@layer`**

Añade al final de `global.css`. Porta las reglas equivalentes desde `_legacy/styles.css` (mismas clases semánticas: `.wrap`, `.eyebrow`, `.btn`, `.btn-lg`, `.btn-ghost`, `.btn-wa`, `.card`, `.section-pad`, etc.), aplicando estos **refinamientos premium**: mayor escala tipográfica fluida en `h1/h2`, más interletraje negativo en titulares, transiciones con `--ease-out`, `:focus-visible` visible en botones y enlaces. Base mínima imprescindible:

```css
@layer base {
  html { scroll-behavior: smooth; }
  body {
    margin: 0;
    font-family: var(--font-body);
    color: var(--color-ink);
    background: var(--color-paper);
    font-size: 17px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }
  img { max-width: 100%; display: block; }
  a { color: inherit; text-decoration: none; }
  h1, h2, h3, h4 {
    font-family: var(--font-display);
    font-weight: 700;
    line-height: 1.04;
    letter-spacing: -.02em;
    margin: 0;
    text-wrap: balance;
  }
  :focus-visible { outline: 2px solid var(--color-cocoa); outline-offset: 3px; }
}

@layer components {
  .wrap { width: min(1200px, 92vw); margin-inline: auto; }
  .section-pad { padding: clamp(72px, 11vw, 140px) 0; }
  .eyebrow {
    display: inline-flex; align-items: center; gap: .55em;
    font-size: .78rem; font-weight: 700; letter-spacing: .22em;
    text-transform: uppercase; color: var(--color-cocoa);
  }
  .eyebrow::before { content: ""; width: 26px; height: 1.5px; background: var(--color-kraft); display: inline-block; }
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: .5em;
    padding: .85em 1.4em; border-radius: 999px; font-weight: 700;
    background: var(--color-ink); color: var(--color-card);
    transition: transform .25s var(--ease-out), box-shadow .25s var(--ease-out), background .25s;
    box-shadow: var(--shadow-soft-sm);
  }
  .btn:hover { transform: translateY(-2px); box-shadow: var(--shadow-soft-md); }
  .btn-lg { padding: 1.05em 1.8em; font-size: 1.05rem; }
  .btn-ghost { background: transparent; color: var(--color-ink); box-shadow: inset 0 0 0 1.5px var(--color-line, rgba(44,27,17,.16)); }
  .btn-wa { background: #1FA855; color: #fff; }
}
```

> Porta el resto de reglas de presentación (hero, cards, formulario, steps, values, header, mobile-menu, fab, bg-decor, animaciones `.reveal`/`.in`, `@keyframes`) desde `_legacy/styles.css` a `@layer components`, conservando los nombres de clase. Aplica los refinamientos premium indicados arriba. Elimina por completo cualquier regla `.site-footer` / `.footer-*`.

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: build OK; el H1 del index se ve con la tipografía Bricolage y fondo crema en `npm run dev`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: sistema de diseño (tokens @theme + clases de componente, sin footer)"
```

---

### Task 3: Config de marca y datos de cajas

**Files:**
- Create: `src/config/site.ts`, `src/data/boxes.ts`

- [ ] **Step 1: Crear `src/config/site.ts`**

```ts
export const WA_NUMBER = "51970642671";        // +51 970 642 671
export const WA_LINK = `https://wa.me/${WA_NUMBER}`;

export const BRAND = {
  name: "Galletas",
  tagline: "Hechas con amor",
};

export const NAV = [
  { label: "Inicio", href: "/", key: "home" },
  { label: "Las cajas", href: "/cajas", key: "cajas" },
  { label: "Por qué", href: "/nosotros", key: "nosotros" },
  { label: "Cómo pedir", href: "/como-pedir", key: "como" },
] as const;
```

- [ ] **Step 2: Crear `src/data/boxes.ts`**

```ts
export type BoxKey = "pequena" | "mediana" | "grande";

export interface Box {
  key: BoxKey;
  name: string;
  price: number;   // soles
  cookies: number;
  accent: string;
  accentDeep: string;
  featured: boolean;
  sub: string;
  features: string[];
  img: string;      // ruta en /public
}

export const BOXES: Box[] = [
  {
    key: "pequena", name: "Caja Pequeña", price: 3, cookies: 4,
    accent: "#C97E78", accentDeep: "#B5645E", featured: false,
    sub: "Para un antojo o un detalle bonito.",
    features: ["4 galletas artesanales", "Ideal para antojos o detalles pequeños", "Perfecta para regalar"],
    img: "/assets/box-pequena.png",
  },
  {
    key: "mediana", name: "Caja Mediana", price: 5, cookies: 8,
    accent: "#CC8A3C", accentDeep: "#B5752A", featured: true,
    sub: "El equilibrio perfecto entre cantidad y precio.",
    features: ["8 galletas artesanales", "Perfecta para compartir en pareja o familia", "Equilibrio entre cantidad y precio"],
    img: "/assets/box-mediana.png",
  },
  {
    key: "grande", name: "Caja Grande", price: 8, cookies: 14,
    accent: "#87894C", accentDeep: "#6F7140", featured: false,
    sub: "La mejor opción para compartir en grande.",
    features: ["14 galletas artesanales", "La mejor opción para compartir en grande", "Ideal para reuniones, cumpleaños o regalar"],
    img: "/assets/box-grande.png",
  },
];

export const getBox = (key: string): Box =>
  BOXES.find(b => b.key === key) ?? BOXES[1]; // default: mediana
```

- [ ] **Step 3: Verificar typecheck**

Run: `npm run check`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: config de marca (site.ts) y datos de cajas (boxes.ts)"
```

---

### Task 4: Lógica de pedido (funciones puras, TDD con Vitest)

**Files:**
- Create: `vitest.config.ts`, `tests/orderLogic.test.ts`, `src/scripts/orderLogic.ts`

- [ ] **Step 1: Crear `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { environment: 'node', include: ['tests/**/*.test.ts'] } });
```

- [ ] **Step 2: Escribir los tests primero — `tests/orderLogic.test.ts`**

```ts
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
```

- [ ] **Step 3: Ejecutar los tests y verificar que FALLAN**

Run: `npm test`
Expected: FAIL — "Cannot find module '../src/scripts/orderLogic'".

- [ ] **Step 4: Implementar `src/scripts/orderLogic.ts`**

```ts
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
```

- [ ] **Step 5: Ejecutar los tests y verificar que PASAN**

Run: `npm test`
Expected: todos los tests PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: lógica de pedido pura con tests (clampQty, calcTotal, mensaje y URL WhatsApp)"
```

---

### Task 5: Chrome — BaseLayout, Header, MobileMenu, WhatsAppFab + animaciones globales

**Files:**
- Create: `src/layouts/BaseLayout.astro`, `src/components/Header.astro`, `src/components/MobileMenu.astro`, `src/components/WhatsAppFab.astro`, `src/scripts/motion.ts`
- Reference: `_legacy/layout.js` (markup de header/menú/fab), `_legacy/app.js` (reveal/crumbs/parallax/tilt)

- [ ] **Step 1: `WhatsAppFab.astro`** — botón flotante. Porta el SVG de WhatsApp y el markup `.wa-fab` desde `_legacy/layout.js`. Usa `WA_LINK` de `site.ts`. `target="_blank" rel="noopener"`.

- [ ] **Step 2: `Header.astro`** — recibe `page` (key activa) como prop. Porta el markup `.site-header` de `_legacy/layout.js` (marca con `/assets/logo.png`, nav desde `NAV`, CTA `.btn-wa` → `/pedir`, botón `.nav-toggle`). Usa enlaces Astro a rutas `/`, `/cajas`, etc. Marca el activo comparando con `page`.

```astro
---
import { NAV, BRAND, WA_ICON_PATH } from '../config/site';
const { page } = Astro.props as { page: string };
---
```
> Define `WA_ICON_PATH` (el `d` del SVG) en `site.ts` para reutilizarlo en Header, MobileMenu y Fab (DRY), o crea un `WaIcon.astro`. El SVG `d` está en `_legacy/layout.js` (const `WA_ICON`).

- [ ] **Step 3: `MobileMenu.astro`** — porta `.mobile-menu` de `_legacy/layout.js` (botón cerrar, enlaces de `NAV`, CTA). Recibe `page` como prop.

- [ ] **Step 4: `src/scripts/motion.ts`** — porta de `_legacy/app.js`: reveal on scroll (IntersectionObserver), entrada del hero, migas flotantes (`spawnCrumbs`), parallax del hero y tilt 3D de cards. Respeta `prefers-reduced-motion`. Expón `export function initMotion()`. NO incluyas la lógica del formulario (va en Task 11).

- [ ] **Step 5: `BaseLayout.astro`** — estructura común, **sin footer**:

```astro
---
import '../styles/global.css';
import { ClientRouter } from 'astro:transitions';
import Header from '../components/Header.astro';
import MobileMenu from '../components/MobileMenu.astro';
import WhatsAppFab from '../components/WhatsAppFab.astro';
const { title, description, page = '' } = Astro.props as { title: string; description?: string; page?: string };
---
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    {description && <meta name="description" content={description} />}
    <ClientRouter />
  </head>
  <body>
    <div class="bg-decor" aria-hidden="true" transition:persist></div>
    <Header page={page} />
    <MobileMenu page={page} />
    <slot />
    <WhatsAppFab />
    <script>
      import { initMotion } from '../scripts/motion';
      const run = () => initMotion();
      document.addEventListener('astro:page-load', run);
    </script>
  </body>
</html>
```

- [ ] **Step 6: Conectar el menú móvil** — añade en `motion.ts` o en un `<script>` del layout el toggle de `.mobile-menu` (abrir/cerrar, bloquear scroll) y el estado `.scrolled` del header, portados de `_legacy/layout.js`. Asegúrate de re-enlazar en `astro:page-load`.

- [ ] **Step 7: Actualizar `index.astro` para usar el layout**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Galletas — Hechas con amor" page="home">
  <main class="page"><div class="wrap section-pad"><h1>Hero provisional</h1></div></main>
</BaseLayout>
```

- [ ] **Step 8: Verificar** — `npm run build` OK. En `npm run dev`: header con nav, FAB visible, menú móvil abre/cierra, sin footer. Navegar entre rutas dispara la transición.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: layout base, header, menú móvil, FAB y animaciones globales (ClientRouter, sin footer)"
```

---

### Task 6: Componentes de tarjeta — BoxCard, ValueCard, StepCard

**Files:**
- Create: `src/components/BoxCard.astro`, `src/components/ValueCard.astro`, `src/components/StepCard.astro`
- Reference: `_legacy/cajas.html` (BoxCard), `_legacy/nosotros.html` (ValueCard), `_legacy/como-pedir.html` (StepCard)

- [ ] **Step 1: `BoxCard.astro`** — recibe `box: Box` y `ctaHref`. Porta el markup `.card` de `_legacy/cajas.html` parametrizando con la caja: aplica `--accent`/`--accent-soft`/`--accent-ink` por `style`, muestra `box.featured` como ribbon "Más pedida", imagen `box.img`, precio `box.price`, `🍪 {box.cookies} galletas`, lista `box.features`, CTA → `/pedir?caja={box.key}`.

```astro
---
import type { Box } from '../data/boxes';
const { box, ctaHref = `/pedir?caja=${box.key}` } = Astro.props as { box: Box; ctaHref?: string };
---
```

- [ ] **Step 2: `ValueCard.astro`** — props `{ title, text }` y un `<slot />` para el icono SVG. Porta el markup `.value` de `_legacy/nosotros.html`.

- [ ] **Step 3: `StepCard.astro`** — props `{ num, title, text }` y `<slot />` para el icono. Porta `.step` de `_legacy/como-pedir.html`.

- [ ] **Step 4: Verificar** — `npm run check` 0 errores.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: componentes BoxCard, ValueCard y StepCard"
```

---

### Task 7: Página de inicio (hero + parallax)

**Files:**
- Modify: `src/pages/index.astro`
- Reference: `_legacy/index.html`

- [ ] **Step 1: Construir el hero** — porta el `<main class="hero">` de `_legacy/index.html` dentro de `BaseLayout` (`page="home"`). Incluye eyebrow, H1 con subrayado SVG, lead, `.hero-actions` (CTAs a `/cajas` y `/pedir`), `.hero-pricelist` generada desde `BOXES` (precio + nombre + punto de color `box.accent`), y `.hero-visual` con `/assets/box-mediana.png`, `.hero-plate` y `.hero-float`.

- [ ] **Step 2: Verificar** — en `npm run dev`, el hero se ve premium, con entrada animada y parallax al mover el cursor; respeta reduce-motion.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: página de inicio con hero premium y parallax"
```

---

### Task 8: Página "Las cajas"

**Files:**
- Modify/Create: `src/pages/cajas.astro`
- Reference: `_legacy/cajas.html`

- [ ] **Step 1: Construir la página** — `BaseLayout` (`page="cajas"`), `.page-head` (eyebrow, H1, intro) y `.cards` recorriendo `BOXES` con `<BoxCard box={box} />`. Añade `reveal` a las tarjetas.

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import BoxCard from '../components/BoxCard.astro';
import { BOXES } from '../data/boxes';
---
<BaseLayout title="Las cajas — Galletas" description="Tres presentaciones: Pequeña (S/3), Mediana (S/5) y Grande (S/8)." page="cajas">
  <main class="page section-pad">
    <div class="wrap">
      <div class="page-head reveal">
        <span class="eyebrow">Las presentaciones</span>
        <h1>Elige tu caja perfecta</h1>
        <p>Tres tamaños para cada antojo — desde un detalle pequeño hasta una caja para compartir en grande.</p>
      </div>
      <div class="cards">
        {BOXES.map((box) => <BoxCard box={box} />)}
      </div>
    </div>
  </main>
</BaseLayout>
```

- [ ] **Step 2: Verificar** — 3 tarjetas, "Mediana" destacada, hover/tilt OK, sin footer.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: página de cajas con BoxCard desde datos centralizados"
```

---

### Task 9: Página "Por qué nosotros"

**Files:**
- Create: `src/pages/nosotros.astro`
- Reference: `_legacy/nosotros.html`

- [ ] **Step 1: Construir la página** — `BaseLayout` (`page="nosotros"`). Porta `.why-grid` (visual con `/assets/box-grande.png` y sello `/assets/logo.png`) y los 4 `<ValueCard>` (Hechas con amor, Recién horneadas, Listas para regalar, Sabores que gustan), pasando cada icono SVG por el slot desde `_legacy/nosotros.html`. CTA → `/pedir`.

- [ ] **Step 2: Verificar** — 4 valores con iconos, reveal on scroll, sin footer.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: página nosotros con ValueCard"
```

---

### Task 10: Página "Cómo pedir"

**Files:**
- Create: `src/pages/como-pedir.astro`
- Reference: `_legacy/como-pedir.html`

- [ ] **Step 1: Construir la página** — `BaseLayout` (`page="como"`). `.page-head` + `.steps-grid` con 4 `<StepCard num title text>` (Elige tu caja, Llena el formulario, Confirma por WhatsApp, Recibe y disfruta), iconos por slot desde `_legacy/como-pedir.html`. `.page-cta` → `/pedir`.

- [ ] **Step 2: Verificar** — 4 pasos numerados, reveal escalonado, sin footer.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: página cómo pedir con StepCard"
```

---

### Task 11: Página "Hacer un pedido" (formulario + wiring)

**Files:**
- Create: `src/pages/pedir.astro`, `src/components/OrderForm.astro`, `src/scripts/orderForm.ts`
- Reference: `_legacy/pedir.html` (markup), `_legacy/app.js` (comportamiento del form)

- [ ] **Step 1: `OrderForm.astro`** — porta el `<form id="order-form">` de `_legacy/pedir.html`: selección de presentación (recorriendo `BOXES`), sabor (vainilla/chocolate/mixto, mixto por defecto), cantidad con `−/+`, resumen de total, campos nombre/teléfono/distrito (requeridos), fecha y notas (opcionales), botón submit `.btn-wa`. Incluye el panel `.order-info` con los datos de contacto.

- [ ] **Step 2: `src/scripts/orderForm.ts`** — wiring del DOM que **usa `orderLogic.ts`**: seleccionar caja (aplica acento), seleccionar sabor, cantidad con `clampQty`, total en vivo con `calcTotal` y la nota "N cajas · M galletas", validación de requeridos (marca `.err` y enfoca el primero), submit → `buildWhatsAppUrl(WA_NUMBER, order)` + `window.open(url, '_blank')`, y preselección por `?caja=`. Expón `export function initOrderForm()`.

```ts
import { WA_NUMBER } from '../config/site';
import { getBox } from '../data/boxes';
import { clampQty, calcTotal, buildWhatsAppUrl, type Flavor } from './orderLogic';
// ... lee el DOM, mantiene estado {boxKey, flavor}, recalcula y arma la URL
export function initOrderForm() { /* ver _legacy/app.js para el detalle de eventos */ }
```

- [ ] **Step 3: `pedir.astro`** — `BaseLayout` (`page="pedir"`) con `<OrderForm />` y un `<script>` que llame a `initOrderForm()` en `astro:page-load`.

- [ ] **Step 4: Verificar (manual, crítico)** — en `npm run dev` → `/pedir`:
  - cambiar caja y cantidad actualiza el total y la nota;
  - `/pedir?caja=grande` preselecciona Grande;
  - enviar sin nombre/teléfono/distrito marca error y enfoca;
  - con datos válidos abre WhatsApp con el mensaje correcto (verifica el texto).

- [ ] **Step 5: Ejecutar tests de lógica (regresión)**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: página de pedido (OrderForm + wiring usando la lógica testeada)"
```

---

### Task 12: Limpieza, verificación final y cierre

**Files:**
- Delete: `_legacy/`
- Reference: spec §9 (criterios de aceptación)

- [ ] **Step 1: Eliminar el sitio legacy**

```bash
git rm -r _legacy
```

- [ ] **Step 2: Verificación final completa**

Run: `npm run check && npm test && npm run build`
Expected: typecheck 0 errores, tests PASS, build "Complete!".

- [ ] **Step 3: Checklist de aceptación (manual en `npm run preview`)** — recorre las 5 páginas en desktop y móvil (DevTools) y confirma, contra spec §9:
  - [ ] Ninguna página muestra footer.
  - [ ] FAB de WhatsApp en todas las páginas → `wa.me/51970642671`.
  - [ ] Formulario: total correcto, validación, abre WhatsApp, respeta `?caja=`.
  - [ ] Transiciones entre páginas (ClientRouter) y `prefers-reduced-motion` respetado.
  - [ ] Diseño cálido-premium coherente en las 5 páginas.

- [ ] **Step 4: Commit y push**

```bash
git add -A
git commit -m "chore: elimina sitio legacy tras la migración a Astro"
git push -u origin feat/migracion-astro
```

- [ ] **Step 5: Integración** — usa la skill `superpowers:finishing-a-development-branch` para decidir merge/PR a `main`.

---

## Self-Review (cobertura del spec)

- **§3.1 Estética cálida elevada** → Task 2 (tokens + refinamientos premium).
- **§3.2 Multipágina (5)** → Tasks 7–11.
- **§3.3 Sin footer** → Task 2 (elimina reglas), Task 5 (layout sin footer), verificado en Task 12.
- **§3.4 Astro + Tailwind v4** → Task 1.
- **§3.5 Pedido WhatsApp sin backend** → Tasks 4 y 11.
- **§4 Arquitectura/contratos** → Tasks 3 (boxes/site), 4 (orderLogic).
- **§5 Tokens** → Task 2.
- **§6 Transiciones + animaciones (reveal, crumbs, parallax, tilt, reduce-motion)** → Task 5 (motion.ts, ClientRouter), Task 7 (parallax).
- **§7 Flujo de pedido completo** → Task 4 (lógica testeada) + Task 11 (wiring, preselección `?caja=`).
- **§8 Eliminado/mantenido** → footer eliminado (Task 2/5); header, FAB, menú, imágenes mantenidos (Tasks 5/6).
- **§9 Criterios de aceptación** → Task 12 checklist.

Sin placeholders pendientes: la lógica testeable tiene código completo (Task 4); el markup de presentación se porta desde archivos `_legacy/` concretos (existentes en el repo) con transformaciones explícitas y clases de componente ya definidas en Task 2.
