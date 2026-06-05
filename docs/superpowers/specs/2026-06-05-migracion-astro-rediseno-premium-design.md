# Migración a Astro + rediseño premium — Galletas «Hechas con amor»

**Fecha:** 2026-06-05
**Estado:** Aprobado (diseño)

## 1. Objetivo

Reconstruir el sitio estático actual (HTML + CSS + JS vanilla) sobre **Astro + Tailwind CSS v4**, profesionalizando la arquitectura (componentes reutilizables, datos centralizados, tipado) y **elevando el diseño visual a nivel premium**, conservando la identidad cálida-artesanal de la marca.

Se **elimina el footer** por completo: cada página termina en su CTA.

## 2. Estado actual (punto de partida)

Sitio de galletas artesanales con 5 páginas estáticas:

| Página | Archivo actual | Contenido |
|--------|----------------|-----------|
| Inicio | `index.html` | Hero con caja, precios, CTAs |
| Las cajas | `cajas.html` | 3 tarjetas: Pequeña S/3, Mediana S/5 (destacada), Grande S/8 |
| Por qué | `nosotros.html` | 4 valores + visual |
| Cómo pedir | `como-pedir.html` | 4 pasos |
| Pedir | `pedir.html` | Formulario → pedido por WhatsApp |

- `layout.js` inyecta por JS: fondo decorativo, header/nav, menú móvil, **footer** y FAB de WhatsApp; además gestiona el estado de scroll del header y una transición de fade entre páginas.
- `app.js` gestiona: reveal on scroll, entrada del hero, migas flotantes, parallax del hero, tilt 3D en tarjetas y toda la lógica del formulario de pedido.
- `styles.css` (~28 KB) ya define un sistema de tokens (paleta, tipografía, sombras, radios, easing) bajo el lema «minimalista / premium».
- Sin backend: el pedido se envía abriendo `wa.me` con el mensaje prearmado.

## 3. Decisiones acordadas

1. **Estética:** cálida artesanal, elevada (se conserva la identidad de marca).
2. **Estructura:** multipágina, mismas 5 páginas (mejor SEO, estructura ya validada).
3. **Cierre de página:** sin footer; la página termina en su CTA.
4. **Stack:** Astro + Tailwind CSS v4.
5. **Pedido:** se mantiene el flujo por WhatsApp, client-side, sin backend ni persistencia de datos.

## 4. Arquitectura objetivo

```
galletas/
├── public/
│   ├── assets/            → logo.png, box-pequena.png, box-mediana.png, box-grande.png
│   └── uploads/           → imágenes existentes (se conservan)
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro     → <head>, fuentes, fondo decorativo, Header, MobileMenu,
│   │                              WhatsAppFab, <ClientRouter />. SIN footer.
│   ├── components/
│   │   ├── Header.astro          → marca + nav + CTA «Pedir ahora»; estado scroll
│   │   ├── MobileMenu.astro      → menú lateral móvil
│   │   ├── WhatsAppFab.astro     → botón flotante de WhatsApp
│   │   ├── BoxCard.astro         → tarjeta de caja reutilizable (acento por props)
│   │   ├── ValueCard.astro       → tarjeta de valor (nosotros)
│   │   ├── StepCard.astro        → tarjeta de paso (cómo pedir)
│   │   └── OrderForm.astro       → formulario de pedido (markup) + script order.ts
│   ├── data/
│   │   └── boxes.ts              → fuente ÚNICA de las 3 cajas
│   ├── config/
│   │   └── site.ts              → WA_NUMBER, datos de marca, items de navegación
│   ├── scripts/
│   │   └── order.ts            → lógica del formulario → URL wa.me (TypeScript)
│   ├── pages/
│   │   ├── index.astro
│   │   ├── cajas.astro
│   │   ├── nosotros.astro
│   │   ├── como-pedir.astro
│   │   └── pedir.astro
│   └── styles/
│       └── global.css          → tokens (@theme) + estilos base + utilidades
├── astro.config.mjs
├── tailwind / vite config (vía @tailwindcss/vite)
└── package.json
```

**Motivación de los límites:**
- `layout.js` inyecta HTML como strings (frágil, sin tipos). Se convierte en **componentes Astro** verificables y testeables por separado.
- Las 3 cajas hoy están **duplicadas** en `cajas.html`, el hero (`index.html`) y el formulario (`pedir.html` + `app.js`). Pasan a definirse **una sola vez** en `boxes.ts`, consumido por todas las páginas.
- El número de WhatsApp está hardcodeado en `layout.js` y `app.js`. Se centraliza en `site.ts`.

### Contrato de datos

`src/data/boxes.ts` — array tipado, cada caja:

```ts
{ key: "pequena" | "mediana" | "grande",
  name: string,        // "Caja Pequeña"
  price: number,       // 3 | 5 | 8 (soles)
  cookies: number,     // 4 | 8 | 14
  accent: string,      // "#C97E78" | "#CC8A3C" | "#87894C"
  accentDeep: string,  // "#B5645E" | "#B5752A" | "#6F7140"
  featured: boolean,   // mediana = true ("Más pedida")
  sub: string,         // subtítulo de la tarjeta
  features: string[]   // bullets de la tarjeta
}
```

`src/config/site.ts`:

```ts
WA_NUMBER = "51970642671"      // +51 970 642 671
WA_LINK   = "https://wa.me/51970642671"
NAV = [ Inicio, Las cajas, Por qué, Cómo pedir ]  // (Pedir es el CTA)
```

## 5. Sistema de diseño (tokens portados a Tailwind v4 `@theme`)

Se reutiliza la paleta actual y se formaliza como tema de Tailwind:

- **Superficies:** `paper #F6EEE0`, `paper-2 #F0E4D0`, `paper-3 #EADBC2`, `card #FCF8F0`, `card-2 #FBF5EA`.
- **Tinta:** `ink #2C1B11`, `ink-2 #4A3422`, `ink-soft #6B523E`, `ink-faint #9A836E`.
- **Marca:** `cocoa #7A5638`, `kraft #C49A6C`.
- **Acentos (por caja):** rosa `#C97E78`/`#B5645E`, mostaza `#CC8A3C`/`#B5752A`, oliva `#87894C`/`#6F7140`.
- **Sombras:** sm/md/lg ya definidas. **Radios:** 12 / 20 / 30 / pill. **Easing:** `cubic-bezier(.22,.61,.36,1)` y `(.16,1,.3,1)`.
- **Tipografía:** Bricolage Grotesque (display) + Hanken Grotesk (texto), vía Google Fonts.

**Elevación premium (sobre lo existente):** escala tipográfica fluida más marcada y mejor jerarquía/tracking en titulares; espaciado más generoso entre secciones; estados de foco accesibles (focus-visible); consistencia de hover/active en botones y tarjetas.

## 6. Rediseño premium — comportamientos a preservar y mejorar

**Transiciones de página:** se reemplaza el fade manual de `layout.js` por **View Transitions nativas de Astro** (`<ClientRouter />`), más fluidas y robustas (incluye manejo de bfcache).

**Animaciones e interacciones a preservar** (hoy en `app.js`), respetando siempre `prefers-reduced-motion`:
- **Reveal on scroll:** `IntersectionObserver` (threshold 0.12, rootMargin `0px 0px -6% 0px`); añade clase `in`.
- **Entrada del hero:** clase `in` tras montar.
- **Migas flotantes** en el fondo decorativo (5 en móvil, 9 en desktop).
- **Parallax del hero** (pointer + scroll) sobre caja, plato y elementos flotantes.
- **Tilt 3D** en tarjetas (solo puntero fino).

Estas se reimplementan como scripts de componente en Astro (TypeScript), encapsulados en el componente correspondiente.

## 7. Flujo de pedido (WhatsApp) — a portar sin pérdida

`OrderForm.astro` + `src/scripts/order.ts` reproducen exactamente el comportamiento actual:

- **Selección de presentación:** Pequeña / Mediana / Grande; aplica el acento de la caja al formulario.
- **Sabor:** Vainilla / Chocolate / Mixto (por defecto: Mixto).
- **Cantidad:** input numérico con botones −/+, **acotado a 1–50**.
- **Total estimado** en vivo: `precio × cantidad`, con nota «N cajas · M galletas en total».
- **Campos requeridos:** nombre, teléfono, distrito/zona. Validación con marca de error y foco al primer campo inválido.
- **Campos opcionales:** fecha deseada (formateada `es-PE`), notas.
- **Envío:** construye el mensaje (formato actual con `*negritas*` de WhatsApp) y abre `https://wa.me/51970642671?text=...` (`encodeURIComponent`) en pestaña nueva. **No se guarda ningún dato.**
- **Preselección:** lee `?caja=pequena|mediana|grande` para preseleccionar (default `mediana`).

## 8. Qué se elimina y qué se mantiene

**Se elimina:**
- El **footer** completo (`site-footer`: las 3 columnas de marca/navegación/contacto + la barra inferior con copyright). No se reemplaza por nada; cada página cierra en su CTA.

**Se mantiene:**
- Header + navegación + estado de scroll.
- **FAB flotante de WhatsApp.**
- Menú móvil.
- Formulario de pedido y su flujo `wa.me`, incluido `?caja=`.
- Fondo decorativo con migas.
- Todas las imágenes (`assets/`, `uploads/`).

## 9. Verificación / criterios de aceptación

1. `npm install` y `npm run dev` levantan el sitio sin errores.
2. `npm run build` compila sin errores ni warnings de Astro.
3. Las 5 páginas renderizan con el nuevo diseño en **desktop y móvil**.
4. **Ninguna página muestra footer.**
5. El FAB de WhatsApp aparece en todas las páginas y enlaza a `wa.me/51970642671`.
6. El formulario:
   - calcula el total correctamente al cambiar caja/cantidad,
   - valida los 3 campos requeridos,
   - abre WhatsApp con el mensaje correcto,
   - respeta `?caja=` en la URL.
7. Las transiciones entre páginas funcionan (ClientRouter) y se respeta `prefers-reduced-motion`.

## 10. Fuera de alcance (YAGNI)

- Backend, base de datos o persistencia de pedidos.
- Pasarela de pago / carrito.
- CMS o panel de administración.
- i18n / idiomas adicionales.
- Nuevas páginas o secciones no existentes hoy.
- Footer en cualquier forma.
