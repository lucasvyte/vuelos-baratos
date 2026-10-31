// Prueba completa de la app publicada (lucasvyte.github.io/vuelos-baratos) en un navegador real, como un usuario.
// Corre a mano desde GitHub (Actions → "Prueba completa" → Run workflow). Gasta unas 3 consultas de Ignav.
// Deja capturas y un resumen en la carpeta "prueba/".
import fs from "node:fs";
import { chromium } from "playwright";

const URL = "https://lucasvyte.github.io/vuelos-baratos/";
const OUT = "prueba"; fs.mkdirSync(OUT, { recursive: true });
const R = { inicio: new Date().toISOString(), pasos: [], errores_js: [], links: [] };
const paso = (nombre, ok, detalle = {}) => { R.pasos.push({ nombre, ok, ...detalle }); console.log(ok ? "OK " : "FALLA", nombre, JSON.stringify(detalle).slice(0, 300)); };
const iso = d => d.toISOString().slice(0, 10);
const ida = new Date(Date.now() + 45 * 864e5), vuelta = new Date(Date.now() + 59 * 864e5);

// esperar a que esté publicada la última versión
const local = (fs.readFileSync("index.html", "utf8").match(/const VERSION = '([^']+)'/) || [])[1];
let publicada = "";
for (let i = 0; i < 18; i++) {
  const html = await (await fetch(URL + "?v=" + Date.now(), { cache: "no-store" })).text();
  publicada = (html.match(/const VERSION = '([^']+)'/) || [])[1];
  if (publicada === local) break;
  await new Promise(r => setTimeout(r, 10000));
}
paso("Versión publicada", publicada === local, { repo: local, publicada });

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: "es-AR", timezoneId: "America/Argentina/Buenos_Aires",
  userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36" });
const p = await ctx.newPage();
p.on("pageerror", e => R.errores_js.push(e.message));
R.api_errores = [];
R.api = []; R.fallidos = [];
p.on("response", r => { if (r.status() >= 400) R.fallidos.push(`${r.status()} ${r.url().slice(0, 140)}`); });
p.on("response", async r => { if (r.url().includes("workers.dev") && r.url().endsWith("/comprar")) { let body = ""; try { body = (await r.text()).slice(0, 700); } catch {} R.api.push({ estado: r.status(), pedido: (r.request().postData() || "").slice(0, 120), respuesta: body }); }
  if (r.url().includes("workers.dev") && r.status() >= 400) { let body = ""; try { body = (await r.text()).slice(0, 400); } catch {} let req = ""; try { req = (r.request().postData() || "").slice(0, 200); } catch {} R.api_errores.push({ url: r.url(), estado: r.status(), pedido: req, respuesta: body }); } });
p.on("console", m => { if (m.type() === "error" && !/favicon|ERR_BLOCKED|fonts/.test(m.text())) R.errores_js.push("console: " + m.text().slice(0, 200)); });
const shot = async n => p.screenshot({ path: `${OUT}/${n}.png` });
const txt = async sel => ((await p.locator(sel).first().textContent().catch(() => "")) || "").replace(/\s+/g, " ").trim();

try {
  await p.goto(URL, { waitUntil: "networkidle" });
  await p.evaluate(() => localStorage.clear()); await p.reload({ waitUntil: "networkidle" });
  paso("Abre la app", (await p.title()).includes("Vuelos"), { titulo: await p.title(), pie: await txt(".ver") });
  await shot("01-inicio");

  // ---- Vuelos con precios en vivo ----
  await p.fill("#origin", "BUE"); await p.fill("#destInput", "MAD"); await p.click("#addDest");
  await p.fill("#d1", iso(ida)); await p.fill("#d2", iso(vuelta));
  await p.click("#form button[type=submit]");
  const t0 = Date.now();
  await p.waitForSelector('[data-live="BUE-MAD"] .flight:not(.sk), [data-live="BUE-MAD"] .empty', { timeout: 60000 }).catch(() => {});
  const n = await p.locator('[data-live="BUE-MAD"] .flight:not(.sk)').count();
  const vivo = await txt('[data-live="BUE-MAD"]');
  paso("Precios en vivo Buenos Aires → Madrid", n > 0, { vuelos_visibles: n, segundos: Math.round((Date.now() - t0) / 1000), primero: (await txt('[data-live="BUE-MAD"] .flight')).slice(0, 220),
    flybondi: /flybondi/i.test(vivo), conexion_por_tu_cuenta: /por tu cuenta/i.test(vivo) && !/Solo vuelos casados/.test(vivo) });
  await p.locator('[data-live="BUE-MAD"]').scrollIntoViewIfNeeded(); await shot("02-vuelos-en-vivo");

  for (const k of ["rapido", "escalas", "precio"]) await p.click(`[data-live-sort="${k}"]`).catch(() => {});
  paso("Ordenar vuelos", true, { despues: (await txt('[data-live="BUE-MAD"] .fprice')).slice(0, 30) });

  if (n > 0) {
    await p.locator('[data-live="BUE-MAD"] [data-buy]').first().click();
    // esperar a que termine de buscar (el texto "Buscando…" desaparece)
    await p.waitForFunction(() => { const b = document.querySelector('[data-live="BUE-MAD"] .buy:not([hidden])'); return b && b.textContent && !/Buscando/.test(b.textContent); }, null, { timeout: 45000 }).catch(() => {});
    const compra = await p.locator('[data-live="BUE-MAD"] .buylist a').evaluateAll(as => as.map(a => ({ texto: a.innerText.replace(/\s+/g, " "), url: a.href })));
    paso("Ver dónde comprar", compra.length > 0, { opciones: compra.slice(0, 5).map(x => x.texto), pantalla: (await txt('[data-live="BUE-MAD"] .buy:not([hidden])')).slice(0, 200) });
    compra.slice(0, 2).forEach(x => R.links.push({ tipo: "compra", nombre: x.texto.split(" ")[0], url: x.url }));
    await p.locator('[data-live="BUE-MAD"] .flight').first().scrollIntoViewIfNeeded(); await shot("03-donde-comprar");

    await p.locator('[data-live="BUE-MAD"] [data-save-live]').first().click();
    paso("Guardar precio en vivo", (await p.evaluate(() => JSON.parse(localStorage.getItem("vuelos-baratos-v1") || "{}").precios?.length || 0)) > 0);

    // ---- Puente a Estadías ----
    await p.locator('[data-live="BUE-MAD"] [data-stay-flight]').first().click();
    await p.waitForTimeout(1200);
    paso("Alojamiento desde el vuelo", (await p.evaluate(() => location.hash)) === "#/estadias", {
      ciudad: await p.inputValue("#hCity"), entrada: await p.inputValue("#hIn"), salida: await p.inputValue("#hOut"),
      modo: await p.evaluate(() => document.documentElement.dataset.mode), paginas: await p.locator("#hResults .src").count() });
    await p.evaluate(() => scrollTo(0, 0)); await shot("04-estadias");
    await p.locator("#hResults").scrollIntoViewIfNeeded(); await shot("05-estadias-paginas");
    const hl = await p.locator("#hResults [data-hopen]").evaluateAll(as => as.map(a => ({ nombre: a.closest(".src").querySelector(".name").childNodes[0].textContent.trim(), url: a.href, modo: a.dataset.mode })));
    hl.forEach(x => R.links.push({ tipo: "estadia", ...x }));
  }

  // links de vuelos del primer destino
  await p.click('[data-mode-go="vuelos"]'); await p.waitForTimeout(500);
  const fl = await p.locator('#resultados [data-open]').evaluateAll(as => as.map(a => ({ nombre: a.closest(".src").querySelector(".name").childNodes[0].textContent.trim(), url: a.href, modo: a.dataset.mode })));
  fl.forEach(x => R.links.push({ tipo: "vuelo", ...x }));

  // ---- Ofertas ----
  await p.click('nav.tabs [data-tab="ofertas"]'); await p.waitForTimeout(1500);
  paso("Ofertas", (await p.locator("#deals .deal-it").count()) > 0, { promos: await p.locator("#deals .deal-it").count(), actualizado: await txt("#ofUpd") });
  await shot("06-ofertas");

  // ---- Mis precios / Mis estadías / Fuentes ----
  await p.click('nav.tabs [data-tab="precios"]'); await p.waitForTimeout(500);
  paso("Mis precios", (await p.locator("#plist .price").count()) > 0, { compartir: (await txt("#share")).slice(0, 80) });
  await shot("07-mis-precios");
  await p.click('nav.tabs [data-tab="fuentes"]'); await p.waitForTimeout(400);
  paso("Fuentes", (await p.locator("#srcIndex li").count()) > 5 && (await p.locator("#hSrcIndex li").count()) > 5);
} catch (e) { paso("Error inesperado", false, { error: String(e).slice(0, 300) }); await shot("99-error"); }

// ---- ¿Las páginas abren con la búsqueda? ----
for (const l of R.links) {
  const q = await ctx.newPage();
  try {
    const resp = await q.goto(l.url, { waitUntil: "domcontentloaded", timeout: 25000 });
    await q.waitForTimeout(2500);
    l.estado = resp ? resp.status() : null; l.final = q.url().slice(0, 160); l.titulo = (await q.title()).slice(0, 120);
  } catch (e) { l.error = String(e).split("\n")[0].slice(0, 120); }
  await q.close();
}
paso("Errores de JavaScript", R.errores_js.length === 0, { cantidad: R.errores_js.length });
R.fin = new Date().toISOString();
fs.writeFileSync(`${OUT}/resultado.json`, JSON.stringify(R, null, 1));
await b.close();
