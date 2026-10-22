// COMPADRE bike & coffee · demo
// Intro del oso, "cambiá de bici", vereda de scroll, mazo de hogazas,
// carta del kit en una sección por vez, "Armá tu mesa" y la película del barrio.
import { initKit } from '../kit/kit.js?v=1';

const html = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const OSO = '<svg viewBox="0 0 303.8 307.8" aria-hidden="true"><use href="#oso"></use></svg>';

/* ---------- Las 6 bicis (combinaciones reales de sus posts) ---------- */
const BICIS = [
  { bg: '#e0b2f5', fg: '#ff4900', ink: '#020202' },
  { bg: '#03fdd8', fg: '#6a00a2', ink: '#020202' },
  { bg: '#0120c9', fg: '#fefe05', ink: '#fffff9' },
  { bg: '#01d25a', fg: '#fe5490', ink: '#020202' },
  { bg: '#efea38', fg: '#fd0100', ink: '#020202' },
  { bg: '#fd5701', fg: '#0120c9', ink: '#020202' },
];
let bici = 0;
try { bici = Math.max(0, Math.min(5, parseInt(localStorage.getItem('compadre:bici') || '0', 10) || 0)); } catch (_) { /* sin storage */ }
function pintarBici(i) {
  bici = (i + BICIS.length) % BICIS.length;
  const c = BICIS[bici];
  html.style.setProperty('--pop-bg', c.bg);
  html.style.setProperty('--pop-fg', c.fg);
  html.style.setProperty('--pop-ink', c.ink);
  try { localStorage.setItem('compadre:bici', String(bici)); } catch (_) { /* nada */ }
}
pintarBici(bici);
$$('[data-bici]').forEach((b) => b.addEventListener('click', () => {
  pintarBici(bici + 1);
  const ico = $('.bici-btn');
  ico.classList.remove('giro'); void ico.offsetWidth; ico.classList.add('giro');
}));

/* ---------- Intro: el oso llega pedaleando ---------- */
function cargada(img) {
  if (!img) return Promise.resolve();
  if (img.complete) return Promise.resolve();
  return new Promise((r) => { img.addEventListener('load', r, { once: true }); img.addEventListener('error', r, { once: true }); });
}
async function intro() {
  const el = $('.intro');
  if (!html.classList.contains('con-intro') || !el) { html.classList.add('listo'); el?.remove(); return; }
  const listoRecursos = Promise.race([
    Promise.all([document.fonts ? document.fonts.ready : null, cargada($('.plato--pepi img'))]),
    esperar(2600),
  ]);
  const oso = $('.intro__oso', el);
  await esperar(1250);
  for (let k = 1; k <= 6; k++) {
    const c = BICIS[(bici + k) % 6];
    el.style.setProperty('--fl', c.bg); el.style.color = c.ink; oso.style.color = c.fg;
    await esperar(92);
  }
  el.classList.add('marca');
  await esperar(420);
  await listoRecursos;
  el.classList.add('sale');
  await esperar(160);
  html.classList.add('listo');
  setTimeout(() => { el.remove(); html.classList.remove('con-intro'); }, 1100);
}
intro();

/* ---------- Barra ---------- */
const barra = $('.barra');
const hamb = $('.hamb');
function cerrarMenu() { barra.classList.remove('abierta'); hamb.setAttribute('aria-expanded', 'false'); hamb.setAttribute('aria-label', 'Abrir menú'); }
hamb.addEventListener('click', () => {
  const abre = !barra.classList.contains('abierta');
  barra.classList.toggle('abierta', abre);
  hamb.setAttribute('aria-expanded', String(abre));
  hamb.setAttribute('aria-label', abre ? 'Cerrar menú' : 'Abrir menú');
});
$$('.barra__nav a').forEach((a) => a.addEventListener('click', cerrarMenu));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && barra.classList.contains('abierta')) { cerrarMenu(); hamb.focus(); } });
document.addEventListener('click', (e) => { if (barra.classList.contains('abierta') && !barra.contains(e.target)) cerrarMenu(); });

// sección activa en el menú
const links = new Map($$('.barra__nav a').map((a) => [a.getAttribute('href').slice(1), a]));
const ioNav = new IntersectionObserver((ents) => {
  ents.forEach((en) => { if (en.isIntersecting) { links.forEach((a) => a.classList.remove('activa')); links.get(en.target.id)?.classList.add('activa'); } });
}, { rootMargin: '-45% 0px -50% 0px' });
links.forEach((_, id) => { const s = document.getElementById(id); if (s) ioNav.observe(s); });

/* ---------- Scroll: barra sólida, vereda del oso, película ---------- */
const vereda = $('.vereda');
let ultimoY = scrollY, tic = false, paro = null, sorbo = null;
function enScroll() {
  const y = scrollY;
  const max = document.documentElement.scrollHeight - innerHeight;
  barra.classList.toggle('solida', y > 40);
  vereda.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
  if (y !== ultimoY) {
    vereda.classList.toggle('atras', y < ultimoY);
    vereda.classList.add('rueda-on');
    clearTimeout(paro); clearTimeout(sorbo);
    paro = setTimeout(() => vereda.classList.remove('rueda-on'), 160);
    sorbo = setTimeout(() => { vereda.classList.remove('sorbo'); void vereda.offsetWidth; vereda.classList.add('sorbo'); }, 900);
  }
  ultimoY = y;
  moverPelicula();
  tic = false;
}
addEventListener('scroll', () => { if (!tic) { tic = true; requestAnimationFrame(enScroll); } }, { passive: true });

/* ---------- Entradas al scroll ---------- */
const ioRev = new IntersectionObserver((ents) => {
  ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('visto'); ioRev.unobserve(en.target); } });
}, { threshold: 0.18 });
$$('.rev, .rev-foto, .rev-titulo').forEach((el) => ioRev.observe(el));

/* ---------- Mazo de hogazas ---------- */
const mazo = $('.mazo');
if (mazo) {
  let cartas = $$('.mazo__carta', mazo).sort((a, b) => a.style.getPropertyValue('--k') - b.style.getPropertyValue('--k'));
  let ocupado = false, timer = null, visible = false;
  const pasar = () => {
    if (ocupado) return; ocupado = true;
    const top = cartas[0];
    top.classList.add('vuela');
    setTimeout(() => {
      cartas = [...cartas.slice(1), top];
      cartas.forEach((c, k) => c.style.setProperty('--k', k));
      top.classList.remove('vuela');
      setTimeout(() => { ocupado = false; }, 450);
    }, reduce ? 0 : 430);
  };
  cartas.forEach((c) => c.addEventListener('click', () => { pasar(); reiniciar(); }));
  const reiniciar = () => { clearInterval(timer); if (visible && !reduce) timer = setInterval(pasar, 3600); };
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; reiniciar(); }, { threshold: 0.3 }).observe(mazo);
  mazo.addEventListener('pointerenter', () => clearInterval(timer));
  mazo.addEventListener('pointerleave', reiniciar);
}

/* ---------- Película del barrio (scroll horizontal en desktop) ---------- */
const secPeli = $('.compadres');
const tira = $('[data-tira]');
let peliActiva = false;
function medirPelicula() {
  peliActiva = !reduce && innerWidth > 760;
  if (!peliActiva) { secPeli.style.height = ''; tira.style.transform = ''; return; }
  const sobra = Math.max(0, tira.scrollWidth - innerWidth);
  secPeli.style.height = `${innerHeight + sobra}px`;
  moverPelicula();
}
function moverPelicula() {
  if (!peliActiva) return;
  const r = secPeli.getBoundingClientRect();
  const recorrido = secPeli.offsetHeight - innerHeight;
  const p = recorrido > 0 ? Math.min(1, Math.max(0, -r.top / recorrido)) : 0;
  tira.style.transform = `translate3d(${(-p * Math.max(0, tira.scrollWidth - innerWidth)).toFixed(1)}px,0,0)`;
}
medirPelicula();
let rz = null;
addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(medirPelicula, 150); });
addEventListener('load', medirPelicula);

/* =========================================================
   KIT: carta, canasta y panel
   ========================================================= */
const kit = await initKit({
  config: 'cliente.json',
  carta: {
    itemClass: 'it',
    template: (p, ctx) => {
      const precio = ctx.money(p.precio);
      const pedible = ctx.carrito && p.disponible !== false && p.precio != null;
      return `<div class="it__txt">
          <h3 class="it__nom">${p.foto ? '<span class="it__dot" aria-hidden="true"></span>' : ''}${esc(p.nombre)}</h3>
          ${p.descripcion ? `<p class="it__desc">${esc(p.descripcion)}</p>` : ''}
          ${p.disponible === false ? '<p class="it__desc"><b>Sin stock hoy</b></p>' : ''}
        </div>
        <div class="it__lado"><span class="it__precio">${precio ?? 'Consultar'}</span>${pedible ? `<div data-kit-qty="${esc(p.id)}"></div>` : ''}</div>
        ${p.foto ? `<img class="it__thumb" src="${esc(ctx.asset(p.foto))}" alt="" loading="lazy" decoding="async">` : ''}`;
    },
  },
  carrito: {
    label: 'La canasta',
    icono: '<svg viewBox="0 0 24 24"><path d="M4 9h16l-1.6 10.4a2 2 0 0 1-2 1.6H7.6a2 2 0 0 1-2-1.6Z"/><path d="M8.5 9 12 3.5 15.5 9"/></svg>',
  },
  badge: true,
});

/* ---------- Contador de la canasta en la barra ---------- */
const nBarra = $('[data-canasta-n]');
const btnCanasta = $('.canasta-btn');
function contar(bump) {
  const n = (kit.carrito?.lineas || []).reduce((s, l) => s + l.cant, 0);
  nBarra.textContent = n; nBarra.hidden = n === 0;
  if (bump) { btnCanasta.classList.remove('bump'); void btnCanasta.offsetWidth; btnCanasta.classList.add('bump'); }
}
document.addEventListener('kit:carrito', (e) => contar(e.detail.delta > 0));
kit.carrito?.listo.then(() => contar());

/* ---------- La carta: una sección por vez, con su color ---------- */
const DOS_COLUMNAS = new Set(['cafes', 'fresca']);
const SUB = {
  cafes: 'Cafés de especialidad con nombre propio',
  panes: 'Masa madre · se encargan para retirar',
  dulce: 'Pastelería de masa madre',
  salado: 'Para el mediodía o la merienda',
  fresca: 'Birra, vermú y limonadas',
  pizzas: 'Pizza de masa madre y la fainá del Oso',
};
const fotoImg = $('[data-foto-img]');
const fotoNom = $('[data-foto-nom]');
function armarCarta(el) {
  const tabs = $$('.kit-tab', el);
  const paneles = $$('.kit-carta__panel', el);
  paneles.forEach((panel, i) => {
    const cat = panel.id.split('-p-').pop();
    panel.dataset.cat = cat;
    const items = $$('.kit-item', panel);
    const nombre = tabs[i]?.textContent.trim() || '';
    const cab = document.createElement('div');
    cab.className = 'carta-cab';
    cab.innerHTML = `<div class="carta-cab__oso">${OSO}</div><div><h3 class="carta-cab__t">${esc(nombre)}</h3><p class="carta-cab__sub">${items.length} opciones · ${esc(SUB[cat] || 'Todo se puede encargar')}</p></div>`;
    const lista = document.createElement('div');
    lista.className = 'carta-items' + (DOS_COLUMNAS.has(cat) ? ' carta-items--dos' : '');
    items.forEach((it) => lista.appendChild(it));
    const nav = document.createElement('div');
    nav.className = 'carta-nav';
    const prev = tabs[i - 1], next = tabs[i + 1];
    nav.innerHTML = `<button type="button" data-prev ${prev ? '' : 'disabled'}>← ${prev ? esc(prev.textContent.trim()) : 'Anterior'}</button>
      <button type="button" data-next ${next ? '' : 'disabled'}>${next ? esc(next.textContent.trim()) : 'Siguiente'} →</button>`;
    nav.querySelector('[data-prev]').addEventListener('click', () => irA(prev, el));
    nav.querySelector('[data-next]').addEventListener('click', () => irA(next, el));
    panel.replaceChildren(cab, lista, nav);
  });
  tabs.forEach((t) => t.addEventListener('click', () => {
    const o = $('.kit-carta__panel:not([hidden]) .carta-cab__oso', el);
    if (o) { o.style.animation = 'none'; void o.offsetWidth; o.style.animation = ''; }
  }));
}
function irA(tab, el) {
  if (!tab) return;
  tab.click();
  const panel = $('.kit-carta__panel:not([hidden])', el);
  const top = panel.getBoundingClientRect().top;
  if (top < 0 || top > innerHeight * 0.6) scrollTo({ top: scrollY + top - (innerWidth < 980 ? 150 : 110), behavior: reduce ? 'auto' : 'smooth' });
}
document.addEventListener('kit:carta', (e) => { armarCarta(e.detail.el); });
// si la carta ya se pintó antes de escuchar el evento
const kitCarta = $('[data-kit="carta"]');
if (kitCarta && $('.kit-carta__panel', kitCarta) && !$('.carta-cab', kitCarta)) armarCarta(kitCarta);

// foto del producto en la caja fija
let hoverRaf = null, ultimoItem = null;
kitCarta?.addEventListener('pointerover', (e) => {
  const it = e.target.closest('.kit-item');
  if (!it || it === ultimoItem) return;
  cancelAnimationFrame(hoverRaf);
  hoverRaf = requestAnimationFrame(() => {
    ultimoItem?.classList.remove('hover');
    ultimoItem = it; it.classList.add('hover');
    const src = it.dataset.photo;
    if (!src || fotoImg.dataset.src === src) return;
    fotoImg.dataset.src = src;
    fotoImg.classList.add('cambia');
    const nom = $('.it__nom', it)?.textContent.trim() || '';
    setTimeout(() => {
      fotoImg.src = src;
      fotoImg.classList.toggle('cuadrada', !src.includes('/platos/'));
      fotoNom.textContent = nom;
      cargada(fotoImg).then(() => fotoImg.classList.remove('cambia'));
    }, 160);
  });
});

/* ---------- El pan del finde ---------- */
const listaPanes = $('[data-panes]');
let diaPan = 'viernes';
$$('input[name="dia-pan"]').forEach((r) => r.addEventListener('change', () => { if (r.checked) diaPan = r.value; }));
let panIds = new Set();
async function pintarPanes() {
  const prods = (await kit.store.getProductos()).filter((p) => p.categoria === 'panes');
  panIds = new Set(prods.map((p) => p.id));
  listaPanes.innerHTML = prods.map((p, i) => {
    const pedible = p.disponible !== false && p.precio != null;
    return `<li style="--i:${i}"><div><b>${esc(p.nombre)}</b>${p.descripcion ? `<small>${esc(p.descripcion)}</small>` : ''}${p.disponible === false ? '<small>Hoy no hay</small>' : ''}</div>
      <span class="precio">${kit.money(p.precio) ?? 'Consultar'}</span>${pedible ? `<div data-kit-qty="${esc(p.id)}"></div>` : '<span></span>'}</li>`;
  }).join('');
  kit.carrito?.sync(listaPanes);
}
pintarPanes();
kit.store.onChange(pintarPanes);

/* ---------- Día de retiro dentro del checkout del kit ---------- */
const DIAS = [['hoy', 'Hoy'], ['viernes', 'Viernes'], ['sábado', 'Sábado'], ['domingo', 'Domingo']];
const RE_DIA = /^Retiro: ([^.]*)\.\s*/;
function sumarDia(form) {
  if (!form || form.querySelector('.retiro-dia')) return;
  const ta = form.querySelector('textarea[name="nota"]');
  if (!ta) return;
  const tienePan = (kit.carrito?.lineas || []).some((l) => panIds.has(l.id));
  const previo = ta.value.match(RE_DIA)?.[1];
  const actual = DIAS.some(([v]) => v === previo) ? previo : (tienePan ? diaPan : 'hoy');
  const fs = document.createElement('fieldset');
  fs.className = 'retiro-dia';
  fs.innerHTML = `<legend>¿Cuándo lo pasás a buscar?</legend>${DIAS.map(([v, l]) => `<label><input type="radio" name="retiroDia" value="${v}" ${v === actual ? 'checked' : ''}><span>${l}</span></label>`).join('')}`;
  ta.closest('label').before(fs);
  const poner = (v) => {
    ta.value = `Retiro: ${v}. ${ta.value.replace(RE_DIA, '')}`.trim();
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  };
  fs.addEventListener('change', (e) => { if (e.target.name === 'retiroDia') poner(e.target.value); });
  if (previo !== actual) poner(actual);
}
new MutationObserver(() => {
  const form = $('.kit-cart form.kit-form');
  if (form && !form.querySelector('.retiro-dia')) sumarDia(form);
}).observe(document.body, { childList: true, subtree: true });

/* ---------- Armá tu mesa ---------- */
const MESA_IDS = ['latte', 'doppio', 'cruasan', 'cookie', 'chipa', 'faina'];
const bandeja = $('[data-bandeja]');
const mesa = $('[data-mesa]');
const cuenta = $('[data-mesa-cuenta]');
let platos = [];
async function pintarBandeja() {
  const prods = await kit.store.getProductos();
  platos = MESA_IDS.map((id) => prods.find((p) => p.id === id)).filter((p) => p && p.foto && p.disponible !== false && p.precio != null);
  bandeja.innerHTML = platos.map((p, i) => `<li style="--i:${i}"><button type="button" data-plato="${esc(p.id)}" aria-label="Servir ${esc(p.nombre)} en la mesa">
      <img src="${esc(kit.asset(p.foto))}" alt="" width="96" height="96" draggable="false"><b>${esc(p.nombre)}</b><small>${kit.money(p.precio)}</small></button></li>`).join('');
}
pintarBandeja();
kit.store.onChange(pintarBandeja);

function actualizarCuenta() {
  const n = $$('.servido:not(.sale)', mesa).length;
  cuenta.textContent = n === 1 ? '1 plato servido' : `${n} platos servidos`;
  mesa.classList.toggle('servida', n > 0);
}
function servir(id, px, py) {
  const p = platos.find((x) => x.id === id);
  if (!p) return;
  const r = mesa.getBoundingClientRect();
  const w = Math.max(96, Math.min(170, r.width * 0.2)) * (id === 'doppio' ? 0.62 : 1);
  const margen = w / 2 + 10;
  const x = Math.min(r.width - margen, Math.max(margen, px ?? (margen + Math.random() * (r.width - 2 * margen))));
  const y = Math.min(r.height - 96 - w / 2, Math.max(margen, py ?? (margen + Math.random() * (r.height - 96 - w - 20))));
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'servido'; b.dataset.id = id;
  b.setAttribute('aria-label', `Sacar ${p.nombre} de la mesa`);
  b.style.cssText = `left:${(x / r.width * 100).toFixed(2)}%;top:${(y / r.height * 100).toFixed(2)}%;--w:${w.toFixed(0)}px;--r:${(Math.random() * 50 - 25).toFixed(0)}deg`;
  b.innerHTML = `<img src="${esc(kit.asset(p.foto))}" alt="">`;
  mesa.appendChild(b);
  kit.carrito.agregar(id, 1);
  actualizarCuenta();
}
mesa.addEventListener('click', (e) => {
  const s = e.target.closest('.servido'); if (!s || s.classList.contains('sale')) return;
  s.classList.add('sale'); kit.carrito.agregar(s.dataset.id, -1);
  actualizarCuenta(); setTimeout(() => s.remove(), 420);
});
document.addEventListener('kit:pedido', () => setTimeout(() => { $$('.servido', mesa).forEach((s) => s.remove()); actualizarCuenta(); }, 600));

// arrastrar desde la bandeja (o tocar para servir)
let drag = null, ignorarClick = false;
bandeja.addEventListener('pointerdown', (e) => {
  const btn = e.target.closest('[data-plato]'); if (!btn || e.button > 0) return;
  drag = { btn, id: btn.dataset.plato, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, ghost: null, raf: null, pid: e.pointerId };
});
addEventListener('pointermove', (e) => {
  if (!drag || e.pointerId !== drag.pid) return;
  drag.x = e.clientX; drag.y = e.clientY;
  if (!drag.ghost) {
    if (Math.hypot(drag.x - drag.x0, drag.y - drag.y0) < 8) return;
    const g = document.createElement('img');
    g.className = 'fantasma'; g.alt = ''; g.src = $('img', drag.btn).src;
    document.body.appendChild(g); drag.ghost = g;
    try { drag.btn.setPointerCapture(drag.pid); } catch (_) { /* nada */ }
  }
  if (!drag.raf) drag.raf = requestAnimationFrame(() => {
    if (!drag) return;
    drag.raf = null;
    drag.ghost.style.transform = `translate(${drag.x}px, ${drag.y}px) scale(1.12) rotate(-6deg)`;
    const r = mesa.getBoundingClientRect();
    mesa.classList.toggle('encima', drag.x > r.left && drag.x < r.right && drag.y > r.top && drag.y < r.bottom);
  });
}, { passive: true });
function soltar(e) {
  if (!drag || (e && e.pointerId !== drag.pid)) return;
  const d = drag; drag = null;
  cancelAnimationFrame(d.raf);
  mesa.classList.remove('encima');
  if (!d.ghost) return;
  ignorarClick = true; setTimeout(() => { ignorarClick = false; }, 50);
  const r = mesa.getBoundingClientRect();
  const dentro = d.x > r.left && d.x < r.right && d.y > r.top && d.y < r.bottom;
  d.ghost.remove();
  if (dentro) servir(d.id, d.x - r.left, d.y - r.top);
}
addEventListener('pointerup', soltar);
addEventListener('pointercancel', (e) => { if (drag?.ghost) drag.ghost.remove(); drag = null; mesa.classList.remove('encima'); });
bandeja.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-plato]'); if (!btn || ignorarClick) return;
  servir(btn.dataset.plato);
});

// la tira recalcula su ancho cuando cargan las fotos
$$('img', tira).forEach((img) => cargada(img).then(medirPelicula));
enScroll();
