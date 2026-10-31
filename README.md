# Vuelos Baratos

Buscador de vuelos baratos: arma búsquedas en comparadores, agencias y aerolíneas, y guarda los precios que vas anotando.

Publicada con GitHub Pages: https://lucasvyte.github.io/vuelos-baratos/ — se puede instalar como app (PWA).

Versión actual: **0.7.1 (beta)**. Ver [CHANGELOG.md](CHANGELOG.md).

Mientras la app esté en beta, las versiones son `0.X.Y` (X: funciones o cambios nuevos, Y: arreglos). Pasa a 1.0.0 solo cuando el dueño de la app decida que salió de la beta.

Al subir una versión nueva:

1. Cambiar el número en `index.html` (`VERSION` y el pie de página) y `CACHE` en `sw.js`.
2. Anotar los cambios en `CHANGELOG.md`.
3. Crear la etiqueta de git `v0.X.Y`.

## Firebase

Proyecto propio: `vuelos-baratos-40152` (no se comparte con ninguna otra app).

- Authentication: inicio con Google activado y `lucasvyte.github.io` en dominios autorizados.
- Firestore: las reglas están en `firestore.rules`. Cada vez que cambian, hay que pegarlas en la consola (Firestore Database → Reglas → Publicar).

## Robot de ofertas

`tools/ofertas.mjs` corre cada 3 horas en GitHub Actions (`.github/workflows/ofertas.yml`), lee la portada de Promociones Aéreas y guarda en `data/ofertas.json` solo título, precio, tipo, fecha y enlace de cada publicación. Las fechas de sales están en `SALES` dentro de `index.html`.
