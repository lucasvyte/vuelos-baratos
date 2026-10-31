/* Robot de "Ofertas": lee la portada de Promociones Aéreas (promociones-aereas.com.ar), toma las
   publicaciones nuevas y guarda en data/ofertas.json lo justo de cada una: título, precio, tipo,
   fecha y link al original. No copia textos ni fotos. Corre cada 3 horas en GitHub Actions
   (.github/workflows/ofertas.yml). Respeta robots.txt: si el sitio no permite leer, no lee. */
import fs from "node:fs";

const BASE = "https://promociones-aereas.com.ar";
const OUT = "data/ofertas.json";
const UA = "Mozilla/5.0 (compatible; VuelosBaratos/0.7; +https://lucasvyte.github.io/vuelos-baratos/)";
const MAX_NEW = 20, KEEP = 80, DAYS = 30;

const sleep = ms => new Promise(r => setTimeout(r, ms));
const get = async url => {
  const r = await fetch(url, { headers: { "user-agent": UA, "accept-language": "es-AR,es" } });
  if (!r.ok) throw new Error(`${url} → ${r.status}`);
  return r.text();
};
const decode = s => String(s ?? "")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&quot;/g, '"').replace(/&apos;|&#039;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
const clean = s => decode(String(s ?? "").replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
const cut = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);

/* robots.txt: reglas para "*" (o para nuestro agente). Devuelve true si se puede leer la ruta. */
export function allowed(robots, path) {
  const groups = []; let cur = null;
  for (const raw of String(robots || "").split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim(); if (!line) continue;
    const [k, ...v] = line.split(":"); const key = k.trim().toLowerCase(), val = v.join(":").trim();
    if (key === "user-agent") { if (!cur || cur.rules.length) groups.push(cur = { agents: [], rules: [] }); cur.agents.push(val.toLowerCase()); }
    else if (cur && (key === "allow" || key === "disallow")) cur.rules.push({ allow: key === "allow", path: val });
  }
  const g = groups.find(x => x.agents.some(a => a.includes("vuelosbaratos"))) || groups.find(x => x.agents.includes("*"));
  if (!g) return true;
  let best = null;
  for (const r of g.rules) {
    if (!r.path) continue;
    const re = new RegExp("^" + r.path.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\\\$$/, "$"));
    if (re.test(path) && (!best || r.path.length > best.path.length || (r.path.length === best.path.length && r.allow))) best = r;
  }
  return !best || best.allow;
}

/* Tipo según el final de la dirección: …-rt-p.html (vuelos), -pa- (paquetes), -ho- (hoteles)… */
const TIPOS = { rt: "vuelo", pa: "paquete", ho: "hotel", ac: "actividad", av: "asistencia", m: "nota", n: "nota" };
export const tipoDe = slug => { const m = slug.match(/-(rt|pa|ho|ac|av|m|n)(?:-p)?(?:-\d+)?$/); return m ? TIPOS[m[1]] : "otro"; };

const AEROLINEAS = [
  ["aerolineas-argentinas", "Aerolíneas Argentinas"], ["latam", "LATAM"], ["jetsmart", "JetSMART"], ["jet-smart", "JetSMART"],
  ["flybondi", "Flybondi"], ["gol", "GOL"], ["iberia", "Iberia"], ["air-europa", "Air Europa"],
  ["american", "American Airlines"], ["united", "United"], ["copa", "Copa"], ["avianca", "Avianca"],
  ["emirates", "Emirates"], ["turkish", "Turkish Airlines"], ["qatar", "Qatar Airways"], ["air-france", "Air France"],
  ["klm", "KLM"], ["ita-airways", "ITA Airways"], ["lufthansa", "Lufthansa"], ["british", "British Airways"], ["arajet", "Arajet"],
  ["paranair", "Paranair"], ["boa", "BoA"], ["aeromexico", "Aeroméxico"], ["tap", "TAP"]
];
export const aerolineaDe = slug => { const t = "-" + slug + "-"; const hit = AEROLINEAS.find(([k]) => t.includes("-" + k + "-")); return hit ? hit[1] : ""; };

/* Precio del título: "U$D 860", "USD 1.234", "AR$ 11.793", "$ 99.999" */
export function precioDe(title) {
  const m = String(title).match(/(U\$S|U\$D|USD|US\$|AR\$|ARS|R\$|€|\$)\s?(\d{1,3}(?:[.,]\d{3})+|\d+)(?:[.,]\d{1,2})?/i);
  if (!m) return null;
  const sym = m[1].toUpperCase();
  const cur = /U\$|USD|US\$/.test(sym) ? "USD" : sym === "€" ? "EUR" : sym === "R$" ? "BRL" : "ARS";
  return { cur, amount: Number(m[2].replace(/[.,]/g, "")) };
}

/* Links a publicaciones en la portada, en orden y sin repetir, con el texto del enlace si lo hay */
export function linksDe(html) {
  const out = new Map();
  const re = /<a\b[^>]*href=["']((?:https?:\/\/(?:www\.)?promociones-aereas\.com\.ar)?\/(20\d\d)\/(\d\d)\/([a-z0-9-]+)\.html)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const url = BASE + `/${m[2]}/${m[3]}/${m[4]}.html`;
    const text = clean(m[5]);
    const prev = out.get(url);
    if (!prev) out.set(url, { url, y: m[2], mo: m[3], slug: m[4], text });
    else if (!prev.text && text) prev.text = text;
  }
  return [...out.values()];
}

const meta = (html, prop) => {
  const a = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']*)["']`, "i"))
    || html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${prop}["']`, "i"));
  return a ? decode(a[1]).trim() : "";
};
export function datosDePost(html) {
  let title = meta(html, "og:title") || clean((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]);
  title = title.replace(/\s*[|–-]\s*Promo(?:ciones|s)? A[eé]reas.*$/i, "").trim();
  const at = meta(html, "article:published_time") || meta(html, "og:updated_time") || "";
  return { title, at: /^\d{4}-\d{2}-\d{2}/.test(at) ? new Date(at).toISOString() : "" };
}

async function main() {
  let prev = { items: [] };
  try { prev = JSON.parse(fs.readFileSync(OUT, "utf8")); } catch {}
  const now = new Date().toISOString();
  const out = { updated: prev.updated || "", checked: now, ok: true, source: { name: "Promociones Aéreas", url: BASE + "/" }, items: prev.items || [] };
  try {
    let robots = "";
    try { robots = await get(BASE + "/robots.txt"); } catch {}
    if (!allowed(robots, "/")) throw new Error("robots.txt no permite leer la portada");
    const links = linksDe(await get(BASE + "/"));
    if (!links.length) throw new Error("no encontré publicaciones en la portada (¿cambió la página?)");
    const known = new Map(out.items.map(x => [x.url, x]));
    const nuevos = [];
    for (const l of links.filter(l => !known.has(l.url)).slice(0, MAX_NEW)) {
      let d = { title: "", at: "" };
      if (allowed(robots, new URL(l.url).pathname)) { try { d = datosDePost(await get(l.url)); } catch (e) { console.warn(e.message); } await sleep(800); }
      const title = cut(d.title || l.text, 160);
      if (!title) continue;
      nuevos.push({
        id: `${l.y}-${l.mo}-${l.slug}`.slice(0, 120), url: l.url, title,
        tipo: tipoDe(l.slug), aerolinea: aerolineaDe(l.slug), precio: precioDe(title),
        at: d.at || now, seen: now
      });
    }
    const limit = Date.now() - DAYS * 864e5;
    out.items = [...nuevos, ...out.items]
      .filter(x => new Date(x.seen || x.at).getTime() > limit)
      .sort((a, b) => String(b.at).localeCompare(String(a.at)))
      .slice(0, KEEP);
    if (nuevos.length || !out.updated) out.updated = now;
    console.log(`Ofertas: ${nuevos.length} nuevas, ${out.items.length} en total`);
  } catch (e) {
    out.ok = false; out.error = e.message; console.error("Ofertas:", e.message);
  }
  fs.mkdirSync("data", { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + "\n");
}

if (process.argv[1] && process.argv[1].endsWith("ofertas.mjs")) main();
