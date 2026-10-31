// Prueba de un solo uso: busca algunas rutas reales en el servidor intermedio y guarda un resumen.
import fs from "node:fs";
const W = "https://vuelos-baratos-api.978-llv.workers.dev";
const H = { "Origin": "https://lucasvyte.github.io", "Content-Type": "application/json" };
const RUTAS = [
  { origin: "BUE", destination: "MAD", departure_date: "2026-12-10", return_date: "2026-12-24" },
  { origin: "BUE", destination: "MIA", departure_date: "2026-12-10", return_date: "2026-12-24" },
  { origin: "BUE", destination: "BRC", departure_date: "2026-12-10", return_date: "2026-12-17" },
  { origin: "COR", destination: "RIO", departure_date: "2027-01-15", return_date: "2027-01-25" },
  { origin: "BUE", destination: "MAD", departure_date: "2026-12-10", return_date: "2026-12-24", market: "US" }
];
const out = [];
for (const q of RUTAS) {
  const t0 = Date.now();
  const r = await fetch(W + "/buscar", { method: "POST", headers: H, body: JSON.stringify(q) });
  const d = await r.json().catch(() => ({}));
  const its = d.itineraries || [];
  const resumen = {
    q, status: r.status, ms: Date.now() - t0, error: d.error, total: its.length,
    monedas: [...new Set(its.map(i => i.price && i.price.currency))],
    top: its.slice().sort((a, b) => a.price.amount - b.price.amount).slice(0, 6).map(i => ({
      precio: i.price.amount + " " + i.price.currency + " (" + i.price.status + ")",
      ida: (i.outbound.carrier || "?") + " · escalas " + (i.outbound.segments.length - 1) + " · " + Math.round(i.outbound.duration_minutes / 60) + " h · " + i.outbound.segments.map(s => s.departure_airport + ">" + s.arrival_airport + " " + (s.marketing_carrier_code || "") + (s.flight_number || "")).join(", "),
      vuelta: i.inbound ? (i.inbound.carrier || "?") + " · escalas " + (i.inbound.segments.length - 1) + " · " + Math.round(i.inbound.duration_minutes / 60) + " h" : "",
      autotransfer: i.requires_self_transfer, id: i.ignav_id
    })),
    aerolineas: [...new Set(its.flatMap(i => i.outbound.segments.map(s => s.operating_carrier_name || s.marketing_carrier_code)))].slice(0, 25)
  };
  out.push(resumen);
}
// enlaces de compra del más barato de la primera ruta
const first = out[0].top[0];
if (first) {
  const r = await fetch(W + "/comprar", { method: "POST", headers: H, body: JSON.stringify({ ignav_id: first.id }) });
  const d = await r.json().catch(() => ({}));
  out.push({ comprar: r.status, error: d.error, opciones: (d.booking_options || []).flatMap(o => o.links.map(l => `${l.provider_name} (${l.provider_type || "-"}) ${l.price ? l.price.amount + " " + l.price.currency : ""} ${String(l.url).slice(0, 60)}`)) });
}
fs.writeFileSync("prueba-ignav.json", JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
