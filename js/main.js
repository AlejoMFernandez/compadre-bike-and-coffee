// COMPADRE bike & coffee · demo
// Intro del oso, "cambiá de bici", vereda de scroll, mazo de hogazas,
// la TIENDA (productos armados para encargar y retirar), "Armá tu caja",
// la carta del local (solo para mirar) y la película del barrio.
import { initKit } from '../kit/kit.js?v=19';
import { opcionesRetiro } from '../kit/core/encargos.js?v=19';

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
   KIT: tienda, carta del local, canasta y panel
   ========================================================= */
// fechas especiales (Navidad…): la ventana de retiro va sobre la foto
const VENTANA = {};
const DIAS_N = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const dm = (f) => { const [, m, d] = f.split('-').map(Number); return `${d}/${m}`; };
const plataTxt = (ctx, p) => ctx.money(p.precio) ?? 'A confirmar';
const kit = await initKit({
  config: 'cliente.json',
  imagenes: { lqip: 'img/lqip.json' },
  cartas: {
    // la TIENDA: tarjetas con foto, opciones (relleno, molienda…) y "Sumar"
    'tienda-kit': {
      itemClass: 'tc',
      template: (p, ctx) => {
        const ops = (p.opciones || [])[0];
        const pedible = ctx.carrito && ctx.pedible(p);
        const accion = !pedible ? '<span class="tc__off">Hoy no hay</span>'
          : p.id === 't-caja' ? '<a class="tc__armar" href="#caja">Armala <span aria-hidden="true">→</span></a>'
          : ops ? `<button type="button" class="kit-add tc__add" data-tc-add="${esc(p.id)}"><span aria-hidden="true">+</span> Sumar</button>`
          : `<div class="tc__qty" data-kit-qty="${esc(p.id)}"></div>`;
        return `<figure class="tc__foto">${p.foto
            ? `<img src="${esc(ctx.asset(p.foto))}" alt="" width="720" height="720" loading="lazy" decoding="async">`
            : `<div class="tc__ph">${OSO}</div>`}
            ${VENTANA[p.categoria] ? `<figcaption class="tc__ventana">${esc(VENTANA[p.categoria])}</figcaption>` : ''}</figure>
          <div class="tc__body">
            <h3 class="tc__nom">${esc(p.nombre)}</h3>
            ${p.descripcion ? `<p class="tc__desc">${esc(p.descripcion)}</p>` : ''}
            ${ops ? `<div class="tc__ops" role="radiogroup" aria-label="${esc(ops.nombre)}" data-op-grupo="${esc(ops.id)}">${ops.valores.map((v, k) => `<button type="button" role="radio" aria-checked="${k === 0}" data-op-val="${esc(v.id)}">${esc(v.nombre)}</button>`).join('')}</div>` : ''}
          </div>
          <div class="tc__pie">
            <span class="tc__precio${p.precio == null ? ' is-na' : ''}">${esc(plataTxt(ctx, p))}</span>
            ${accion}
          </div>
          ${ops && pedible ? `<p class="tc__en" data-tc-n="${esc(p.id)}" aria-live="polite"></p>` : ''}`;
      },
    },
    // la CARTA del local: vidriera, sin botón de pedir
    'carta-kit': {
      itemClass: 'it',
      pedir: false,
      template: (p, ctx) => `<div class="it__txt">
          <h3 class="it__nom">${p.foto ? '<span class="it__dot" aria-hidden="true"></span>' : ''}${esc(p.nombre)}</h3>
          ${p.descripcion ? `<p class="it__desc">${esc(p.descripcion)}</p>` : ''}
          ${p.disponible === false ? '<p class="it__desc"><b>Hoy no hay</b></p>' : ''}
        </div>
        <div class="it__lado"><span class="it__precio">${ctx.money(p.precio) ?? 'Consultar'}</span></div>
        ${p.foto ? `<img class="it__thumb" src="${esc(ctx.asset(p.foto))}" alt="" loading="lazy" decoding="async">` : ''}`,
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
document.addEventListener('kit:carrito', (e) => { contar(e.detail.delta > 0); contarOpciones(); });
kit.carrito?.listo.then(() => { contar(); contarOpciones(); });

/* =========================================================
   LA TIENDA
   ========================================================= */
async function leerVentanas() {
  const antes = JSON.stringify(VENTANA);
  for (const k of Object.keys(VENTANA)) delete VENTANA[k];
  for (const c of await kit.store.getCategorias()) {
    if (c.especial && c.desde && c.hasta) VENTANA[c.id] = `Para retirar del ${dm(c.desde)} al ${dm(c.hasta)}`;
  }
  if (JSON.stringify(VENTANA) !== antes) kit.cartas?.find((c) => c.el.id === 'tienda-kit')?.recargar();
}
leerVentanas();
kit.store.onChange(leerVentanas);

// "Encargando ahora, lo retirás desde el …"
const proximo = $('[data-proximo]');
function pintarProximo() {
  const { dias } = opcionesRetiro({ horarios: kit.config.horarios, encargo: kit.config.pedidos?.encargo, tz: kit.tz });
  const d = dias.find((x) => x.franjas.some((f) => f.disponible));
  if (!d || !proximo) return;
  const f = d.franjas.find((x) => x.disponible);
  const hs = (h) => h.replace(/^0/, '');
  proximo.innerHTML = `Encargando ahora, lo retirás desde el <b>${DIAS_N[new Date(d.fecha + 'T12:00:00').getDay()]} ${dm(d.fecha)}</b> · ${esc(f.nombre.toLowerCase())}, ${hs(f.desde)} a ${hs(f.hasta)} hs.`;
}
pintarProximo();
setInterval(pintarProximo, 5 * 60 * 1000);

// colores de bici por sección de la tienda
const COLORES_TIENDA = ['#efea38', '#e0b2f5', '#01d25a', '#03fdd8', '#fd5701', '#0120c9'];
function armarTienda(el) {
  $$('.kit-carta__panel', el).forEach((panel, i) => {
    panel.style.setProperty('--tc-bg', COLORES_TIENDA[i % COLORES_TIENDA.length]);
  });
  $$('.kit-tab', el).forEach((t, i) => t.style.setProperty('--tc-bg', COLORES_TIENDA[i % COLORES_TIENDA.length]));
  contarOpciones();
}
const tiendaKit = $('#tienda-kit');
// opciones (relleno, molienda, con o sin frutas) y "Sumar"
tiendaKit?.addEventListener('click', (e) => {
  const op = e.target.closest('[data-op-val]');
  if (op) {
    $$('[data-op-val]', op.parentElement).forEach((b) => b.setAttribute('aria-checked', String(b === op)));
    return;
  }
  const add = e.target.closest('[data-tc-add]');
  if (add) {
    const it = add.closest('.kit-item');
    const opc = {};
    $$('[data-op-grupo]', it).forEach((g) => { const v = $('[aria-checked="true"]', g); if (v) opc[g.dataset.opGrupo] = v.dataset.opVal; });
    kit.carrito.agregar(add.dataset.tcAdd, 1, { opc, origen: add });
  }
});
// "2 en la canasta" debajo de los productos con opciones (lugar reservado: no mueve nada)
function contarOpciones() {
  $$('[data-tc-n]').forEach((el) => {
    const n = (kit.carrito?.lineas || []).filter((l) => l.id === el.dataset.tcN).reduce((s, l) => s + l.cant, 0);
    el.textContent = n ? `${n} en la canasta` : '';
  });
}

/* ---------- La carta del local: una sección por vez, con su color ---------- */
const DOS_COLUMNAS = new Set(['cafes', 'fresca']);
const SUB = {
  cafes: 'Cafés de especialidad con nombre propio',
  panes: 'Masa madre de todos los días',
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
    cab.innerHTML = `<div class="carta-cab__oso">${OSO}</div><div><h3 class="carta-cab__t">${esc(nombre)}</h3><p class="carta-cab__sub">${items.length} opciones · ${esc(SUB[cat] || 'En el mostrador')}</p></div>`;
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
document.addEventListener('kit:carta', (e) => {
  if (e.detail.el.id === 'carta-kit') armarCarta(e.detail.el);
  if (e.detail.el.id === 'tienda-kit') armarTienda(e.detail.el);
});
// si ya se pintaron antes de escuchar el evento
const kitCarta = $('#carta-kit');
if (kitCarta && $('.kit-carta__panel', kitCarta) && !$('.carta-cab', kitCarta)) armarCarta(kitCarta);
if (tiendaKit && $('.kit-carta__panel', tiendaKit)) armarTienda(tiendaKit);

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

/* =========================================================
   ARMÁ TU CAJA: 6 piezas del mostrador → "Caja Compadre"
   ========================================================= */
const CAJA_ID = 't-caja';
const LUGARES = 6;
const PIEZAS = [
  { id: 'cruasan', nombre: 'Cruasán', img: 'img/platos/cruasan.webp' },
  { id: 'pepi', nombre: 'Pepi', img: 'img/platos/pepi.webp' },
  { id: 'cookie', nombre: 'Cookie', img: 'img/platos/cookie.webp' },
  { id: 'crumble', nombre: 'Crumble', img: 'img/platos/crumble.webp' },
  { id: 'danesa', nombre: 'Danesa', img: 'img/platos/danesa.webp' },
  { id: 'badolca', nombre: 'Badolca', img: 'img/platos/badolca.webp' },
];
const bandeja = $('[data-bandeja]');
const cajaMesa = $('[data-caja-mesa]');
const caja = $('[data-caja]');
const huecosEl = $('[data-huecos]');
const cuenta = $('[data-caja-cuenta]');
const btnSumar = $('[data-caja-sumar]');
let huecos = Array(LUGARES).fill(null);
let cerrando = false;
let prodCaja = null;

bandeja.innerHTML = PIEZAS.map((p, i) => `<li style="--i:${i}"><button type="button" data-pieza="${p.id}" aria-label="Poner ${esc(p.nombre)} en la caja">
    <img src="${p.img}" alt="" width="96" height="96" draggable="false"><b>${esc(p.nombre)}</b></button></li>`).join('');
huecosEl.innerHTML = huecos.map((_, i) => `<li class="hueco" data-hueco="${i}"><span class="hueco__n" aria-hidden="true">${i + 1}</span></li>`).join('');

async function leerCaja() {
  prodCaja = (await kit.store.getProductos()).find((p) => p.id === CAJA_ID) || null;
  pintarCaja();
}
function pintarCaja() {
  const n = huecos.filter(Boolean).length;
  const llena = n === LUGARES;
  const hay = !!prodCaja && kit.pedible(prodCaja);
  cuenta.textContent = n === 0 ? `0 de ${LUGARES} piezas` : llena ? '¡Caja completa!' : `${n} de ${LUGARES} piezas`;
  caja.classList.toggle('llena', llena);
  btnSumar.disabled = !llena || !hay || cerrando;
  btnSumar.innerHTML = !hay ? 'Hoy no hay cajas' : `Sumar<span class="sm-hide"> la caja</span>${prodCaja.precio != null ? ' · ' + kit.money(prodCaja.precio) : ''}`;
  $$('[data-pieza]', bandeja).forEach((b) => b.setAttribute('aria-disabled', String(llena || cerrando)));
}
function poner(id) {
  if (cerrando) return;
  const i = huecos.indexOf(null);
  if (i < 0) { caja.classList.remove('nope'); void caja.offsetWidth; caja.classList.add('nope'); return; }
  const p = PIEZAS.find((x) => x.id === id); if (!p) return;
  huecos[i] = id;
  const li = huecosEl.children[i];
  li.querySelector('.pieza')?.remove();
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'pieza'; b.dataset.i = i;
  b.style.setProperty('--r', `${(Math.random() * 30 - 15).toFixed(0)}deg`);
  b.setAttribute('aria-label', `Sacar ${p.nombre} de la caja`);
  b.innerHTML = `<img src="${p.img}" alt="">`;
  li.appendChild(b);
  li.classList.add('lleno');
  pintarCaja();
}
huecosEl.addEventListener('click', (e) => {
  const b = e.target.closest('.pieza'); if (!b || cerrando || b.classList.contains('sale')) return;
  const i = Number(b.dataset.i);
  huecos[i] = null; b.classList.add('sale'); b.parentElement.classList.remove('lleno');
  setTimeout(() => b.remove(), 380);
  pintarCaja();
});
btnSumar.addEventListener('click', async () => {
  if (btnSumar.disabled) return;
  const cuentas = {};
  huecos.forEach((id) => { const nom = PIEZAS.find((x) => x.id === id).nombre; cuentas[nom] = (cuentas[nom] || 0) + 1; });
  const nota = Object.entries(cuentas).map(([nom, c]) => c > 1 ? `${nom} ×${c}` : nom).join(', ');
  cerrando = true; pintarCaja();
  caja.classList.add('cerrada');
  await esperar(reduce ? 0 : 900);
  kit.carrito.agregar(CAJA_ID, 1, { nota, origen: caja });
  await esperar(reduce ? 0 : 900);
  huecos = Array(LUGARES).fill(null);
  $$('.pieza', huecosEl).forEach((b) => b.remove());
  $$('.hueco', huecosEl).forEach((h) => h.classList.remove('lleno'));
  caja.classList.remove('cerrada');
  cerrando = false; pintarCaja();
});
leerCaja();
kit.store.onChange(leerCaja);

// arrastrar desde la bandeja (o tocar para poner)
let drag = null, ignorarClick = false;
const dentroDeCaja = (x, y) => { const r = caja.getBoundingClientRect(); return x > r.left && x < r.right && y > r.top && y < r.bottom; };
bandeja.addEventListener('pointerdown', (e) => {
  const btn = e.target.closest('[data-pieza]'); if (!btn || e.button > 0 || cerrando) return;
  drag = { btn, id: btn.dataset.pieza, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, ghost: null, raf: null, pid: e.pointerId };
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
    cajaMesa.classList.toggle('encima', dentroDeCaja(drag.x, drag.y));
  });
}, { passive: true });
function soltar(e) {
  if (!drag || (e && e.pointerId !== drag.pid)) return;
  const d = drag; drag = null;
  cancelAnimationFrame(d.raf);
  cajaMesa.classList.remove('encima');
  if (!d.ghost) return;
  ignorarClick = true; setTimeout(() => { ignorarClick = false; }, 50);
  d.ghost.remove();
  if (dentroDeCaja(d.x, d.y)) poner(d.id);
}
addEventListener('pointerup', soltar);
addEventListener('pointercancel', () => { if (drag?.ghost) drag.ghost.remove(); drag = null; cajaMesa.classList.remove('encima'); });
bandeja.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-pieza]'); if (!btn || ignorarClick) return;
  poner(btn.dataset.pieza);
});

// la tira recalcula su ancho cuando cargan las fotos
$$('img', tira).forEach((img) => cargada(img).then(medirPelicula));
enScroll();
