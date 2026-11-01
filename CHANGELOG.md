# Novedades

Mientras la app no esté terminada, las versiones van a seguir siendo `0.X.Y` hasta que se decida que está lista. Recién ahí pasa a la **1.0.0**.

- **X (MENOR)**: funciones nuevas, rediseños o cambios en cómo se guardan los datos.
- **Y (ARREGLO)**: corrección de errores o ajustes chicos.

Las versiones de esta lista se renumeraron el 30/10/2026: antes se habían publicado como 1.0.0 a 2.0.0.

## 0.11.1 — 01/11/2026

- BoA (Boliviana de Aviación) sigue en "Con precaución", ahora marcada en rojo (con borde, distinta de "Excluida") en vuelos en vivo, Mis precios y Ofertas.
- Cada vuelo en vivo con BoA muestra un aviso: no está excluida, tuvo demoras y fallas técnicas, decidís vos.
- Fuentes: el motivo de BoA se actualizó con los incidentes de 2026 y más fuentes.
- Anotar un precio: los avisos de aerolínea y los errores ahora ocupan todo el ancho del formulario.

## 0.11.0 — 01/11/2026

- Se quitó el inicio de sesión con Google y las listas para compartir precios. Ya no aparece "Compartí tus precios" ni el aviso de error al entrar.
- Mis precios y Mis estadías se guardan solo en este celular. Los precios que ya tenías anotados se mantienen.
- Para pasarle los precios a alguien sigue estando "Copiar lista".

## 0.10.1 — 31/10/2026

- Precios en vivo: si dos vuelos cuestan lo mismo, solo el primero aparece como "Más barato".

## 0.10.0 — 31/10/2026

Nueva parte: Estadías.

- Arriba de todo hay un selector **Vuelos | Estadías**. En Estadías la app cambia de color (verde azulado), de ícono y de pestañas: Buscar, Ofertas, Mis estadías y Fuentes.
- Buscar alojamiento: ciudad, entrada, salida, adultos, niños, habitaciones y moneda. Arma la búsqueda en Booking.com, Airbnb, Expedia y Hoteles.com (con todo cargado) y en Google Hoteles, Trivago, Despegar y Almundo (copiando los datos).
- Fechas del vuelo: en Estadías aparecen como sugerencia las fechas de tu última búsqueda de vuelos. Desde Vuelos, cada destino tiene "Buscar dónde dormir" y cada vuelo en vivo tiene "🏨 Alojamiento", que usa el día exacto en que llegás y el día en que salís.
- Mis estadías: anotás el precio total y la app calcula el precio por noche, ordena de la más barata a la más cara por ciudad y muestra la fuente. Se comparte con tu lista igual que los precios de vuelos.
- Ofertas: nuevo filtro "Hoteles". Si entrás desde Estadías, arranca mostrando hoteles.
- Fuentes: lista de las páginas de alojamiento.
- La app recuerda en qué parte estabas (Vuelos o Estadías) la próxima vez que la abrís.

## 0.9.0 — 31/10/2026

- Precios en vivo: solo se muestran vuelos casados (todo el viaje en un mismo pasaje). Las combinaciones de pasajes separados ("conexión por tu cuenta") ya no aparecen.
- El servidor intermedio también le pide al proveedor que no arme pasajes separados (requiere volver a pegar el código en Cloudflare).

## 0.8.1 — 31/10/2026

- El número de versión al pie de la app ya no dice "beta".

## 0.8.0 — 31/10/2026

Precios en vivo dentro de la app.

- Al tocar "Buscar vuelos" aparecen los vuelos con su precio del momento, sin salir de la app: horarios, aerolínea, duración y escalas de la ida y la vuelta.
- Se ordenan por más barato (de entrada), más rápido o menos escalas. Se ven 5 y se pueden ver todos.
- "Ver dónde comprar" muestra los links a la aerolínea y a agencias, cada uno con su precio. La aerolínea aparece primero.
- "Guardar precio" lo manda directo a Mis precios.
- Las aerolíneas excluidas no aparecen, ni siquiera en una escala. BoA queda marcada "con precaución".
- Los vuelos armados con pasajes separados quedan marcados como "Conexión por tu cuenta", con la explicación del riesgo.
- Los precios vienen de Ignav a través del servidor intermedio de la app (la clave no queda a la vista). Con varios destinos, cada uno busca recién cuando abrís su tarjeta, para no gastar consultas de más.
- Las páginas de siempre siguen abajo, en "También en estas páginas".

## 0.7.1 — 31/10/2026

- Ofertas: los vuelos multidestino (ida a una ciudad y regreso desde otra) ahora aparecen en "Vuelos".

## 0.7.0 — 31/10/2026

Pestaña nueva: Ofertas.

- Muestra las últimas promos que publica Promociones Aéreas, con el precio destacado y el enlace a la nota original. Se pueden filtrar por vuelos, paquetes o todo.
- Un robot las actualiza solo cada 3 horas (respeta lo que el sitio permite leer y no copia textos ni fotos).
- Las promos nuevas desde tu última visita aparecen marcadas y con un número en la pestaña.
- Si una promo es de una aerolínea excluida (por ejemplo Flybondi), queda marcada.
- Calendario de fechas de ofertas: CyberMonday (2 al 4 de noviembre) y Black Friday (27 de noviembre).
- Accesos directos a Promociones Aéreas y a las promociones de Turismocity.
- Consejos para cuando aparece una tarifa muy baja o cargada por error.

## 0.6.0 — 31/10/2026

Listas propias para compartir precios.

- Vuelos Baratos tiene su propio Firebase, separado de cualquier otra app.
- En Mis precios aparece "Compartí tus precios": entrás con Google, creás una lista y aparece un código de 6 letras para invitar.
- El botón "Invitar" manda por WhatsApp (o donde elijas) un enlace que abre la app lista para sumarse. También se puede escribir el código a mano.
- Lo que anota cualquiera de la lista aparece al instante en los celulares de todos, con el nombre de quien lo anotó.
- Los precios que ya tenías en el celular se suben a la lista cuando la creás o te sumás.
- Se puede dejar la lista o cerrar sesión en cualquier momento. Sin entrar con Google, todo sigue funcionando y se guarda en el celular.

## 0.5.0 — 30/10/2026

Vuelos Baratos pasa a ser una app independiente.

- Se quitó la conexión con "Qué hacemos hoy": ya no está el botón "Entrar con Google" ni las listas compartidas de esa app.
- Los precios se guardan solo en el dispositivo. Los que ya estaban compartidos y se habían bajado al celular se conservan.

## 0.4.0 — 30/10/2026

Revisión de diseño y accesibilidad.

- "Más barato" ahora marca el precio más bajo que se puede comprar: si el más barato es de una aerolínea excluida (por ejemplo Flybondi), queda tachado al final de la lista y la corona pasa al siguiente.
- Cuando falta un dato en el formulario, el campo con problema se marca en rojo y el cursor va directo ahí.
- El aviso de aerolíneas excluidas se lee de un vistazo: una frase corta y los nombres en etiquetas tachadas.
- En "Fechas flexibles" la columna de la ida queda fija al deslizar la tabla en el celular.
- Los bordes de los campos se ven mejor (más contraste) y la cruz para quitar un destino es más fácil de tocar.
- Los títulos de los campos y las etiquetas ya no van todo en mayúsculas.
- En Mis precios, "Borrar" es más discreto, "hace 2 h" ya no se corta en dos renglones y el resumen muestra cuánto pasó desde el último precio sin cortarse.
- Si ya usaste la app, el encabezado de Buscar oculta los tres pasos de ayuda y el formulario queda más arriba.
- En modo oscuro la app ya no muestra un destello blanco al abrir.

## 0.3.1 — 30/10/2026

- Se sacó el viaje de ejemplo (Buenos Aires → Madrid y Miami): la app arranca con el formulario vacío y un mensaje que explica qué hacer.

## 0.3.0 — 30/10/2026

Cada pestaña tiene su propia pantalla.

- Buscar, Mis precios y Fuentes ya no son partes de una misma página larga: cada botón de la barra abre su pantalla, con una transición suave.
- Mis precios tiene su propio encabezado con un resumen: cuántos precios anotaste, en cuántas rutas y cuándo fue el último.
- Fuentes tiene su propio encabezado.
- Al tocar "+ Precio" en una página, se abre Mis precios con el formulario listo y un botón "Volver a las páginas" que te deja en el mismo lugar de la lista.
- "Ver por qué" abre Fuentes directo en Aerolíneas excluidas.
- Cada pantalla recuerda hasta dónde bajaste. Tocar la pestaña en la que ya estás te lleva arriba.
- Funciona el botón "atrás" del celular para volver a la pantalla anterior.

## 0.2.0 — 30/10/2026

Rediseño pensado para el celular.

- Encabezado nuevo con los tres pasos de uso más compactos.
- Barra de pestañas fija abajo en el celular (Buscar, Mis precios, Fuentes) que marca dónde estás y cuántos precios anotaste. En computadora queda arriba.
- Las páginas para buscar se muestran como una lista compacta dentro de una sola tarjeta, con los botones "Abrir" y "+ Precio" al costado. Las que ya abriste quedan marcadas con un tilde verde.
- Cada tarjeta de destino muestra si está abierta o cerrada ("Ver 10 páginas" / "Ocultar páginas").
- El formulario de "Mis precios" queda plegado en "Anotar un precio" y se abre solo al tocar "+ Precio".
- "De dónde sale la información" se ordena en secciones plegables: Cómo funciona, Consejos, Aerolíneas excluidas y Todas las páginas.
- El origen se muestra sin cortarse ("BUE — Buenos Aires (todos)").
- Número de versión al pie de la app.

## 0.1.0 — 30/10/2026

- Primera versión publicada en GitHub Pages.
- Búsqueda en comparadores, agencias argentinas y aerolíneas, con fechas flexibles.
- Mis precios compartidos con la lista de "Qué hacemos hoy" al entrar con Google.
- Aerolíneas excluidas (Flybondi y otras) con sus fuentes.
- Se puede instalar como app y abrir sin conexión.
