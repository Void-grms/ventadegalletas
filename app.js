/* ============================================================
   GALLETAS — interacción & animaciones (por página)
   layout.js ya inyectó header / footer / menú / fab.
   ============================================================ */
(function(){
  "use strict";
  const WA_NUMBER = "51970642671"; // +51 970 642 671
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const BOXES = {
    pequena: { name:"Caja Pequeña", price:3, cookies:4,  accent:"#C97E78" },
    mediana: { name:"Caja Mediana", price:5, cookies:8,  accent:"#CC8A3C" },
    grande:  { name:"Caja Grande",  price:8, cookies:14, accent:"#87894C" },
  };

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold:0.12, rootMargin:"0px 0px -6% 0px" });
  document.querySelectorAll(".reveal").forEach(el=>io.observe(el));

  // hero entrance
  const hero = document.querySelector(".hero");
  if(hero) requestAnimationFrame(()=>setTimeout(()=>hero.classList.add("in"), 120));

  /* ---------- Floating crumbs (sutil) ---------- */
  (function spawnCrumbs(){
    if(reduce) return;
    const layer = document.querySelector(".bg-decor");
    if(!layer) return;
    const N = window.innerWidth < 760 ? 5 : 9;
    for(let i=0;i<N;i++){
      const c = document.createElement("span");
      c.className = "crumb" + (Math.random()<0.4 ? " chip" : "");
      const size = 5 + Math.random()*11;
      c.style.width = size+"px"; c.style.height = size+"px";
      c.style.left = (Math.random()*100)+"vw";
      c.style.top  = (Math.random()*100)+"vh";
      const dur = 15 + Math.random()*16;
      c.style.animationDuration = dur+"s";
      c.style.animationDelay = (-Math.random()*dur)+"s";
      layer.appendChild(c);
    }
  })();

  /* ---------- Parallax del hero (pointer + scroll) ---------- */
  const pBox = document.querySelector(".hero-box");
  const floats = [...document.querySelectorAll(".hero-float")];
  const plate = document.querySelector(".hero-plate");
  const heroVisual = document.querySelector(".hero-visual");
  let mx=0, my=0, tmx=0, tmy=0;
  if(heroVisual && !reduce){
    heroVisual.addEventListener("pointermove", (e)=>{
      const r = heroVisual.getBoundingClientRect();
      tmx = ((e.clientX - r.left)/r.width - .5);
      tmy = ((e.clientY - r.top)/r.height - .5);
    });
    heroVisual.addEventListener("pointerleave", ()=>{ tmx=0; tmy=0; });
    (function frame(){
      mx += (tmx - mx)*0.07; my += (tmy - my)*0.07;
      const sy = window.scrollY;
      if(pBox)  pBox.style.transform  = `translate(-50%,-50%) translate(${mx*22}px, ${my*16 - sy*0.04}px) rotate(${mx*3}deg)`;
      if(plate) plate.style.transform = `translate(${mx*-10}px, ${my*-8 + sy*0.02}px)`;
      floats.forEach((f,i)=>{
        const k = (i+1)*1.4;
        f.style.transform = `translate(${mx*-26*k*0.4}px, ${my*-22*k*0.4 - sy*0.03*k}px)`;
      });
      requestAnimationFrame(frame);
    })();
  }

  /* ---------- Tilt 3D en cards ---------- */
  if(!reduce && window.matchMedia("(pointer:fine)").matches){
    document.querySelectorAll(".card").forEach(card=>{
      card.addEventListener("pointermove", (e)=>{
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left)/r.width - .5;
        const py = (e.clientY - r.top)/r.height - .5;
        card.style.transform = `perspective(900px) rotateY(${px*8}deg) rotateX(${py*-8}deg) translateY(-6px)`;
      });
      card.addEventListener("pointerleave", ()=>{ card.style.transform = ""; });
    });
  }

  /* ============================================================
     FORMULARIO DE PEDIDO  (solo en pedir.html)
     ============================================================ */
  const form = document.querySelector("#order-form");
  if(!form) return;
  const choices = [...form.querySelectorAll(".choice[data-box]")];
  const qtyInput = form.querySelector("#qty");
  const totalEl = form.querySelector("#total");
  const countNote = form.querySelector("#count-note");
  let selectedBox = "mediana";

  function selectBox(key){
    if(!BOXES[key]) key = "mediana";
    selectedBox = key;
    choices.forEach(c=>{
      const on = c.dataset.box === key;
      c.classList.toggle("sel", on);
      c.querySelector("input").checked = on;
      if(on) form.style.setProperty("--accent-ink", BOXES[key].accent);
    });
    updateTotal();
  }
  choices.forEach(c=> c.addEventListener("click", ()=>selectBox(c.dataset.box)) );

  function clampQty(v){ v = parseInt(v,10); if(isNaN(v)||v<1) v=1; if(v>50) v=50; return v; }
  function updateTotal(){
    const b = BOXES[selectedBox];
    const q = clampQty(qtyInput.value);
    if(totalEl) totalEl.innerHTML = `<span class="cur">S/</span>${b.price*q}`;
    if(countNote) countNote.textContent = `${q} ${q===1?"caja":"cajas"} · ${b.cookies*q} galletas en total`;
  }
  form.querySelectorAll("[data-step]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      qtyInput.value = clampQty(parseInt(qtyInput.value,10) + parseInt(btn.dataset.step,10));
      updateTotal();
    });
  });
  qtyInput.addEventListener("input", updateTotal);
  qtyInput.addEventListener("blur", ()=>{ qtyInput.value = clampQty(qtyInput.value); updateTotal(); });

  // sabor
  let flavor = "mixto";
  const flavorEls = [...form.querySelectorAll(".flavor")];
  flavorEls.forEach(f=>{
    f.addEventListener("click", ()=>{
      flavor = f.dataset.flavor;
      flavorEls.forEach(x=>{ x.classList.toggle("sel", x===f); x.querySelector("input").checked = (x===f); });
    });
  });

  function markErr(el, on){ el.classList.toggle("err", on); }
  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const name = form.nombre.value.trim();
    const phone = form.telefono.value.trim();
    const district = form.entrega.value.trim();
    const notes = form.notas.value.trim();
    const datev = form.fecha.value;

    let ok = true;
    [["nombre",name],["telefono",phone],["entrega",district]].forEach(([f,v])=>{
      const el = form[f]; const bad = !v; markErr(el, bad); if(bad) ok=false;
    });
    if(!ok){
      const first = form.querySelector(".err");
      if(first){ first.focus({preventScroll:true}); first.scrollIntoView({behavior:"smooth",block:"center"}); }
      return;
    }

    const b = BOXES[selectedBox];
    const q = clampQty(qtyInput.value);
    const flavorLabel = { vainilla:"Vainilla", chocolate:"Chocolate", mixto:"Mixto (vainilla + chocolate)" }[flavor];

    const L = [];
    L.push("¡Hola Galletas! 🍪 Quiero hacer un pedido:");
    L.push("");
    L.push(`*Presentación:* ${b.name} (${b.cookies} galletas) — S/${b.price} c/u`);
    L.push(`*Cantidad:* ${q} ${q===1?"caja":"cajas"}`);
    L.push(`*Sabor:* ${flavorLabel}`);
    L.push(`*Total:* S/${b.price*q}`);
    L.push("");
    L.push(`*Nombre:* ${name}`);
    L.push(`*Teléfono:* ${phone}`);
    L.push(`*Entrega / distrito:* ${district}`);
    if(datev){
      const d = new Date(datev+"T00:00:00");
      L.push(`*Fecha deseada:* ${d.toLocaleDateString("es-PE",{weekday:"long",day:"numeric",month:"long"})}`);
    }
    if(notes) L.push(`*Notas:* ${notes}`);
    L.push("");
    L.push("_Enviado desde la web · Hechas con amor_ ❤️");

    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(L.join("\n"))}`;
    const sb = form.querySelector("button[type=submit]");
    if(sb) sb.animate([{transform:"scale(1)"},{transform:"scale(.96)"},{transform:"scale(1)"}],{duration:260});
    window.open(url, "_blank");
  });

  // init — preselección por ?caja=
  const params = new URLSearchParams(location.search);
  selectBox(params.get("caja") || "mediana");
})();
