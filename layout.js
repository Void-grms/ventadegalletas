/* ============================================================
   GALLETAS — layout compartido (header / footer / nav / transición)
   Se ejecuta ANTES de app.js e inyecta la estructura común.
   Cada página define <body data-page="home|cajas|nosotros|como|pedir">.
   ============================================================ */
(function(){
  "use strict";
  const page = document.body.dataset.page || "";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const WA_LINK = "https://wa.me/51970642671";
  const WA_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.044zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>';

  const NAV = [
    { label:"Inicio",      href:"index.html",     key:"home" },
    { label:"Las cajas",   href:"cajas.html",     key:"cajas" },
    { label:"Por qué",     href:"nosotros.html",  key:"nosotros" },
    { label:"Cómo pedir",  href:"como-pedir.html", key:"como" },
  ];
  const navHTML = NAV.map(n=>`<a href="${n.href}"${n.key===page?' class="active"':''}>${n.label}</a>`).join("");

  /* ---------- bg decor (migas) ---------- */
  const decor = document.createElement("div");
  decor.className = "bg-decor"; decor.setAttribute("aria-hidden","true");
  document.body.insertAdjacentElement("afterbegin", decor);

  /* ---------- header ---------- */
  const header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML = `
    <div class="wrap header-inner">
      <a href="index.html" class="brand" aria-label="Galletas, hechas con amor">
        <img src="assets/logo.png" alt="Logo Galletas" />
        <span class="brand-name">Galletas<span>Hechas con amor</span></span>
      </a>
      <nav class="nav">${navHTML}</nav>
      <div class="header-cta">
        <a class="btn btn-wa" href="pedir.html">${WA_ICON}<span class="btn-text">Pedir ahora</span></a>
        <button class="nav-toggle" aria-label="Abrir menú">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
        </button>
      </div>
    </div>`;
  decor.insertAdjacentElement("afterend", header);

  /* ---------- mobile menu ---------- */
  const menu = document.createElement("div");
  menu.className = "mobile-menu";
  menu.innerHTML = `
    <button class="mobile-close" aria-label="Cerrar menú">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </button>
    ${NAV.map(n=>`<a href="${n.href}"${n.key===page?' class="active"':''}>${n.label}</a>`).join("")}
    <a class="btn btn-wa btn-lg" href="pedir.html" style="justify-content:center">${WA_ICON} Pedir ahora</a>`;
  header.insertAdjacentElement("afterend", menu);

  /* ---------- footer ---------- */
  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `
    <div class="wrap">
      <div class="footer-grid">
        <div>
          <div class="footer-brand">
            <img src="assets/logo.png" alt="Galletas" />
            <div><b>Galletas</b><span>Hechas con amor</span></div>
          </div>
          <p>Galletas artesanales recién horneadas, hechas a mano con ingredientes de verdad. Para compartir felicidad, una caja a la vez.</p>
        </div>
        <div class="footer-col">
          <h5>Navegación</h5>
          <ul>${NAV.map(n=>`<li><a href="${n.href}">${n.label}</a></li>`).join("")}<li><a href="pedir.html">Hacer un pedido</a></li></ul>
        </div>
        <div class="footer-col">
          <h5>Contacto</h5>
          <ul>
            <li><a href="${WA_LINK}" target="_blank" rel="noopener">${WA_ICON} WhatsApp: 970 642 671</a></li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg> Pedidos todos los días</li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 Galletas — Hechas con amor.</span>
        <span>Hechas con amor, para compartir felicidad ❤</span>
      </div>
    </div>`;
  document.body.appendChild(footer);

  /* ---------- floating WhatsApp ---------- */
  const fab = document.createElement("a");
  fab.className = "wa-fab show";
  fab.href = WA_LINK; fab.target = "_blank"; fab.rel = "noopener";
  fab.setAttribute("aria-label","Escríbenos por WhatsApp");
  fab.innerHTML = WA_ICON;
  document.body.appendChild(fab);

  /* ---------- mobile menu behaviour ---------- */
  const toggle = header.querySelector(".nav-toggle");
  const closeBtn = menu.querySelector(".mobile-close");
  function setMenu(open){
    menu.classList.toggle("open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }
  toggle.addEventListener("click", ()=>setMenu(true));
  closeBtn.addEventListener("click", ()=>setMenu(false));

  /* ---------- header scroll state ---------- */
  function onScroll(){ header.classList.toggle("scrolled", window.scrollY > 24); }
  window.addEventListener("scroll", onScroll, { passive:true });
  onScroll();

  /* ============================================================
     Transición fluida entre páginas (fade out → navega)
     ============================================================ */
  function isInternal(a){
    if(!a) return false;
    const href = a.getAttribute("href") || "";
    if(a.target === "_blank") return false;
    if(href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto") || href.startsWith("tel")) return false;
    return /\.html(\?.*)?$/.test(href);
  }
  if(!reduce){
    document.addEventListener("click", (e)=>{
      const a = e.target.closest("a");
      if(!isInternal(a)) return;
      const href = a.getAttribute("href");
      // misma página → no transición
      const here = location.pathname.split("/").pop() || "index.html";
      if(href.split("?")[0] === here) return;
      e.preventDefault();
      setMenu(false);
      document.body.classList.add("leaving");
      setTimeout(()=>{ window.location.href = href; }, 300);
    });
    // bfcache: al volver con "atrás", quitar el fade
    window.addEventListener("pageshow", ()=>document.body.classList.remove("leaving"));
  }
})();
