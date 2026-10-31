// Servidor intermedio de Vuelos Baratos (Cloudflare Worker).
// Guarda la clave de Ignav como secreto (IGNAV_KEY) para que no quede a la vista en la app,
// solo atiende pedidos que vienen de la app y guarda cada búsqueda 10 minutos para no gastar de más.
//
//   GET  /          → estado (sirve para probar que está andando)
//   POST /buscar    → { origin, destination, departure_date, return_date?, adults?, children?, cabin_class?, market? }
//   POST /comprar   → { ignav_id }   (enlaces para comprar ese vuelo)

const IGNAV = "https://ignav.com/api/fares/";
const ORIGENES = ["https://lucasvyte.github.io", "http://127.0.0.1:8765", "http://localhost:8765"];
// Aerolíneas excluidas en la app (código IATA): Flybondi, Spirit, Hong Kong Airlines, Tunisair,
// China Eastern, Aeroitalia, TAROM, Jet2.
const EXCLUIDAS = ["FO", "NK", "HX", "TU", "MU", "XZ", "RO", "LS"];
const CACHE_SEG = 600;

const IATA = /^[A-Z]{3}$/, FECHA = /^\d{4}-\d{2}-\d{2}$/;
const CABINAS = ["economy", "premium_economy", "business", "first"];

function cors(origin) {
  return {
    "Access-Control-Allow-Origin": ORIGENES.includes(origin) ? origin : ORIGENES[0],
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}
const json = (data, status, origin, extra = {}) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", ...cors(origin), ...extra } });
const error = (msg, status, origin, code = "error") => json({ error: { code, message: msg } }, status, origin);

const entero = (v, min, max, def) => { const n = Number.isInteger(v) ? v : def; return Math.min(max, Math.max(min, n)); };

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });

    if (request.method === "GET" && url.pathname === "/") {
      return json({ app: "Vuelos Baratos", ok: true, clave: env.IGNAV_KEY ? "cargada" : "FALTA cargar IGNAV_KEY" }, 200, origin);
    }
    if (request.method !== "POST") return error("Ruta no encontrada", 404, origin, "not_found");
    // solo la app (en el navegador) puede usar el servidor
    if (!ORIGENES.includes(origin)) return error("Origen no permitido", 403, origin, "forbidden");
    if (!env.IGNAV_KEY) return error("Falta cargar la clave IGNAV_KEY en Cloudflare", 500, origin, "missing_key");

    let body;
    try { body = await request.json(); } catch { return error("Pedido inválido", 400, origin, "bad_request"); }

    let endpoint, payload;
    if (url.pathname === "/buscar") {
      const o = String(body.origin || "").toUpperCase(), d = String(body.destination || "").toUpperCase();
      const ida = String(body.departure_date || ""), vuelta = body.return_date ? String(body.return_date) : "";
      if (!IATA.test(o) || !IATA.test(d) || o === d) return error("Origen o destino inválido", 400, origin, "bad_route");
      if (!FECHA.test(ida) || (vuelta && (!FECHA.test(vuelta) || vuelta < ida))) return error("Fechas inválidas", 400, origin, "bad_dates");
      const adults = entero(body.adults, 1, 9, 1), children = entero(body.children, 0, 8, 0);
      if (adults + children > 9) return error("Máximo 9 pasajeros", 400, origin, "too_many");
      payload = {
        origin: o, destination: d, departure_date: ida, adults, children,
        cabin_class: CABINAS.includes(body.cabin_class) ? body.cabin_class : "economy",
        market: /^[A-Z]{2}$/.test(body.market || "") ? body.market : "AR",
        airlines_exclude: EXCLUIDAS,
        // solo vuelos casados (un mismo pasaje); la app además filtra los que vengan separados
        allow_self_transfer: false
      };
      if (vuelta) payload.return_date = vuelta;
      endpoint = vuelta ? "round-trip" : "one-way";
    } else if (url.pathname === "/comprar") {
      const id = String(body.ignav_id || "");
      if (!/^[A-Za-z0-9_-]{8,200}$/.test(id)) return error("Vuelo inválido", 400, origin, "bad_id");
      payload = { ignav_id: id };
      endpoint = "booking-links";
    } else {
      return error("Ruta no encontrada", 404, origin, "not_found");
    }

    // misma búsqueda en los últimos 10 minutos → respuesta guardada, sin gastar otra consulta
    const cacheKey = new Request(`https://cache.vuelos-baratos/${endpoint}?q=${encodeURIComponent(JSON.stringify(payload))}`);
    const cache = caches.default;
    const hit = await cache.match(cacheKey);
    if (hit) { const r = new Response(hit.body, hit); Object.entries(cors(origin)).forEach(([k, v]) => r.headers.set(k, v)); r.headers.set("X-Cache", "HIT"); return r; }

    let r, data;
    for (let i = 0; i < 2; i++) {
      r = await fetch(IGNAV + endpoint, {
        method: "POST",
        headers: { "X-Api-Key": env.IGNAV_KEY, "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (r.status !== 424) break; // 424 = error del proveedor: se reintenta una vez
      await new Promise(res => setTimeout(res, 800));
    }
    try { data = await r.json(); } catch { data = { error: { code: "bad_upstream", message: "Respuesta inválida del proveedor" } }; }
    const out = json(data, r.status, origin, r.ok ? { "Cache-Control": `public, max-age=${CACHE_SEG}` } : {});
    if (r.ok) ctx.waitUntil(cache.put(cacheKey, out.clone()));
    return out;
  }
};
