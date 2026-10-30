# 🛸 Explorador Rick & Morty — `proyecto-web-ia`

Aplicación web que consume **datos reales** de la [Rick and Morty API](https://rickandmortyapi.com/documentation)
para buscar, filtrar, ordenar y guardar personajes favoritos.

El proyecto está hecho con **HTML, CSS y JavaScript puro** (sin frameworks ni librerías externas) y se publica
con **GitHub Pages**.

| Recurso | Enlace |
| --- | --- |
| 🌐 Aplicación publicada | **https://rub803030.github.io/proyecto-web-ia/** |
| 📦 Repositorio | https://github.com/rub803030/proyecto-web-ia |
| 🐞 Issues | https://github.com/rub803030/proyecto-web-ia/issues |
| 🔀 Pull Requests | https://github.com/rub803030/proyecto-web-ia/pulls |

---

## 1. Descripción

**Explorador Rick & Morty** permite consultar los personajes de la serie usando la API pública.
La interfaz muestra tarjetas con imagen, estado, especie y género; el usuario puede buscar por nombre,
combinar filtros, navegar entre páginas, ver el detalle de cada personaje y guardar sus favoritos en el
navegador para que sigan ahí incluso después de cerrar la página.

Todo el contenido de las tarjetas proviene de la API: **no hay personajes escritos a mano en el código**.

---

## 2. Integrantes

| Nombre | Usuario de GitHub | Contribución |
| --- | --- | --- |
| Rubén Lira | [@rub803030](https://github.com/rub803030) | Desarrollo completo, documentación, issues y Pull Request |

> Trabajo individual. Todos los commits del repositorio pertenecen a este integrante.

---

## 3. Funcionalidades

- 🔎 **Buscador por nombre** con búsqueda en vivo (retardo de 450 ms) y botón para limpiar.
- 🎛️ **Filtros** por estado (vivo / muerto / desconocido), especie y género, combinables entre sí.
- 🔤 **Orden alfabético** A → Z y Z → A.
- 🖼️ **20 personajes por página** con imagen, nombre, estado, especie y género.
- 📄 **Paginación** con el total de resultados y la página actual.
- ⭐ **Favoritos** persistentes con `localStorage` y contador en la pestaña.
- 🧾 **Historial de las últimas 6 búsquedas** (se puede borrar).
- 🌗 **Modo oscuro / claro** que recuerda la preferencia y respeta la del sistema.
- 💬 **Mensajes claros** para "sin resultados", error de conexión y lista de favoritos vacía, con botón **Reintentar**.
- 📱 **Diseño adaptable** a celulares, tabletas y computadoras.
- ♿ **Accesibilidad**: navegación por teclado, textos alternativos, `aria-live`, enlace para saltar al contenido
  y respeto por `prefers-reduced-motion`.

---

## 4. Requisitos de la actividad

| # | Requisito | Dónde se cumple |
| --- | --- | --- |
| 1 | Interfaz con HTML, CSS y JavaScript | `index.html`, `style.css`, `script.js` |
| 2 | Conexión a la API con `fetch()` | `loadCharacters()` y `openDetail()` en `script.js` |
| 3 | Al menos 10 elementos con imagen y descripción | 20 tarjetas por página (`renderCards`) |
| 4 | Buscador funcional | Formulario `#searchForm` + parámetro `name` de la API |
| 5 | Filtros para organizar resultados | `#statusFilter`, `#speciesFilter`, `#genderFilter`, `#sortFilter` |
| 6 | Sección de favoritos | Pestaña **Favoritos** (`renderFavorites`) |
| 7 | Favoritos en `localStorage` | Clave `rm-favorites-v1` |
| 8 | Mensajes de error y sin resultados | Función `showMessage()` y manejo del código 404 |
| 9 | Interfaz adaptable | Consultas de medios en `style.css` (720 px y 480 px) |
| 10 | Publicación con GitHub Pages | https://rub803030.github.io/proyecto-web-ia/ |
| 11 | Al menos 6 commits con avances reales | 10 commits en la rama `main` + 2 en la rama de la mejora |
| 12 | Al menos 2 Issues | [#1](https://github.com/rub803030/proyecto-web-ia/issues/1) y [#2](https://github.com/rub803030/proyecto-web-ia/issues/2) |
| 13 | Al menos un Pull Request | [Pull Request #3](https://github.com/rub803030/proyecto-web-ia/pull/3) |

---

## 5. Tecnologías

| Tecnología | Uso |
| --- | --- |
| **HTML5** | Estructura semántica (`header`, `main`, `section`, `dialog`, `footer`) |
| **CSS3** | Variables, Grid, Flexbox, `color-mix`, temas y consultas de medios |
| **JavaScript (ES2020+)** | `fetch`, `async/await`, módulos de funciones, `AbortController`, `Intl.Collator`, `localStorage` |
| **Rick and Morty API** | Fuente de datos públicos (https://rickandmortyapi.com/api) |
| **GitHub Pages** | Publicación del sitio estático |

Sin dependencias, sin `npm` y sin librerías: solo se abre `index.html`.

---

## 6. Estructura del proyecto

```
proyecto-web-ia/
├── index.html   → estructura de la interfaz
├── style.css    → estilos, temas claro/oscuro y diseño adaptable
├── script.js    → lógica: API, buscador, filtros, favoritos y extras
└── README.md    → documentación e informe del uso de IA
```

---

## 7. Instrucciones de uso

1. Abre la aplicación: **https://rub803030.github.io/proyecto-web-ia/**
2. Escribe un nombre en el buscador (por ejemplo `rick`). La búsqueda se ejecuta sola; también puedes pulsar **Buscar**.
3. Combina los filtros de **estado**, **especie** y **género** para acotar los resultados.
4. Usa **Orden** para ordenar alfabéticamente los resultados de la página visible.
5. Pulsa el **corazón ♥** de una tarjeta para guardar el personaje en **Favoritos**.
6. Entra a la pestaña **Favoritos** para verlos, filtrarlos o quitarlos.
7. Pulsa **Ver detalle** en una tarjeta para abrir la ficha completa del personaje.
8. Cambia entre **modo claro y oscuro** con el botón de la esquina superior derecha.
9. Si una búsqueda no tiene resultados o la API falla, la aplicación lo indica con un mensaje y, cuando corresponde,
   un botón **Reintentar**.

### Ejecutar en local

Solo hay que descargar el repositorio y abrir `index.html` en el navegador. También se puede levantar un
servidor estático:

```bash
git clone https://github.com/rub803030/proyecto-web-ia.git
cd proyecto-web-ia
python -m http.server 5500
# abrir http://localhost:5500
```

---

## 8. Cómo funciona el código

### 8.1 Consumo de la API con `fetch()`

```js
const response = await fetch(buildUrl(state.page), { signal: controller.signal });
const data = await response.json();
state.items = data.results;
```

- `buildUrl()` arma la URL con `URLSearchParams` y añade solo los filtros activos:
  `?page=1&name=rick&status=alive`.
- La respuesta trae `info` (cantidad total y páginas) y `results` (los 20 personajes de la página).
- **`AbortController`** cancela la petición anterior si el usuario escribe rápido, para que una respuesta vieja
  no sobrescriba a la nueva.

### 8.2 Buscador

El evento `input` del campo de texto guarda lo escrito en `state.query` después de 450 ms sin teclear
(*debounce*) y llama a `applyFilters()`. El formulario también escucha `submit`, de modo que pulsar **Enter**
busca de inmediato. Con `name` la API devuelve solo los personajes cuyo nombre contiene el texto.

### 8.3 Filtros y orden

- **Estado, especie y género** se envían a la API como parámetros, por lo que el filtrado ocurre en el servidor.
- **El orden alfabético** se aplica en el cliente con `Intl.Collator('es')` sobre los resultados de la página
  visible (la API no ofrece ordenamiento). La interfaz lo indica con el texto *"orden aplicado a esta página"*.

### 8.4 Favoritos y `localStorage`

```js
localStorage.setItem('rm-favorites-v1', JSON.stringify(favorites));
```

- Al marcar un personaje se guarda el objeto completo, así la pestaña de favoritos funciona incluso sin volver
  a consultar la API.
- Al iniciar, `readFavorites()` lee la clave y valida que sea un arreglo; si el dato está dañado, se ignora.
- Los errores de almacenamiento (modo privado, cuota llena) se capturan con `try/catch` y se avisan al usuario.

### 8.5 Manejo de errores

| Situación | Comportamiento |
| --- | --- |
| La API responde **404** | Significa "no hay coincidencias": mensaje **Sin resultados** (no es un error de red) |
| Otro código HTTP o fallo de red | Mensaje de error + botón **Reintentar** |
| Sin conexión (`navigator.onLine === false`) | Mensaje específico de conexión; al volver la red se reintenta solo |
| Favoritos vacíos | Mensaje con instrucciones para guardar el primero |

### 8.6 Extras implementados (reto)

1. **Modo oscuro/claro**: el tema se guarda en `localStorage` (`rm-theme-v1`), se aplica con el atributo
   `data-theme` en `<html>` y un pequeño script en `<head>` lo fija antes de pintar para evitar el destello blanco.
2. **Orden alfabético** con `Intl.Collator`.
3. **Historial de búsquedas**: arreglo de hasta 6 términos en `localStorage` (`rm-history-v1`), sin duplicados,
   que se muestra como botones para repetir la búsqueda.

---

## 9. Uso de inteligencia artificial

El proyecto se desarrolló con el apoyo de un asistente de IA (modelo de lenguaje) para generar el código base,
revisar errores y proponer mejoras. **Todo el código fue leído, probado y comprendido por el integrante**, y se
modificó varias veces antes de la entrega.

### 9.1 Tres prompts importantes

**Prompt 1 — Estructura inicial del proyecto**

> «Actúa como desarrollador front-end. Crea `index.html`, `style.css` y `script.js` para un explorador de
> personajes de Rick and Morty que consuma `https://rickandmortyapi.com` con `fetch()`. Debe mostrar al menos
> 10 personajes con imagen y descripción, tener un buscador, filtros por estado, especie y género, una sección
> de favoritos guardada en `localStorage`, mensajes cuando no haya resultados o falle la consulta y un diseño
> adaptable a celulares y computadoras. Usa JavaScript puro, sin frameworks.»

**Prompt 2 — Diferencia entre "sin resultados" y "error"**

> «En la Rick and Morty API, cuando busco un nombre que no existe, la petición devuelve 404 y mi aplicación
> muestra "error de conexión". ¿Cómo puedo distinguir "no hay resultados" de un fallo real de la API y qué
> mensaje debería mostrar en cada caso?»

**Prompt 3 — Modo oscuro sin parpadeo**

> «Quiero agregar un modo oscuro que recuerde la preferencia del usuario con `localStorage`. ¿Cuál es la mejor
> forma de aplicarlo con variables CSS y evitar el destello blanco al cargar la página?»

### 9.2 Una respuesta de la IA que requirió correcciones

La primera propuesta para los favoritos volvía a llamar a `loadCharacters()` después de cada clic en el corazón.
Eso **recargaba toda la lista desde la API**, se perdía la posición del scroll y, si el personaje no aparecía en
la página actual, el cambio ni siquiera se veía.

Se corrigió con una actualización puntual:

```js
if (state.view === 'favorites') {
  renderFavorites();          // se redibuja solo la vista de favoritos
} else {
  refreshFavoriteButtons();   // se actualizan los corazones ya dibujados
}
```

Así, marcar un favorito no genera ninguna petición nueva a la red.

### 9.3 Un error encontrado y cómo se resolvió

**Síntoma:** al buscar un nombre inexistente (por ejemplo `zzzznoexiste`) aparecía el mensaje
*"No se pudo conectar con la API"*, aunque la conexión funcionaba perfectamente.

**Causa:** el código trataba **cualquier** respuesta no exitosa como error de red, pero la API usa el código
**404** para indicar que la búsqueda no devolvió personajes. Ese 404 llegaba al bloque `catch`.

**Solución:** revisar primero el código de estado antes de lanzar el error:

```js
if (response.status === 404) {
  mostrarMensajeSinResultados();   // no es un fallo, simplemente no hay coincidencias
  return;
}
if (!response.ok) throw new Error(`La API respondió con ${response.status}`);
```

**Error secundario:** al escribir rápido, la petición cancelada con `AbortController` ejecutaba su bloque
`finally` y ocultaba el esqueleto de carga de la petición nueva. Se resolvió comprobando
`if (!controller.signal.aborted)` antes de cambiar la interfaz.

### 9.4 Una modificación al código que podemos explicar

En `index.html` se agregó un script mínimo en el `<head>` que lee el tema guardado **antes** de que se pinte la
página:

```js
const savedTheme = localStorage.getItem('rm-theme-v1');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
document.documentElement.dataset.theme = savedTheme || (prefersDark ? 'dark' : 'light');
```

**Por qué funciona:** el atributo `data-theme="dark"` en la etiqueta `<html>` activa el bloque
`[data-theme="dark"]` de `style.css`, que redefine las variables de color (`--bg`, `--surface`, `--text`, etc.).
Como el script se ejecuta antes de cargar la hoja de estilos, el navegador nunca llega a dibujar la página con
los colores claros y no hay parpadeo. El botón solo cambia el atributo y guarda la elección.

### 9.5 Reflexión sobre el aprendizaje con IA

La IA acelera mucho la escritura del código y ayuda a descubrir detalles que es fácil pasar por alto, como el
significado del 404 o las ventajas de `AbortController`. Sin embargo, **no reemplaza la comprensión**: varias
de sus propuestas funcionaban "a medias" y solo se detectaron al probar la aplicación con casos reales
(búsquedas sin resultados, favoritos repetidos, pantallas pequeñas). Aprendimos que hay que leer cada línea,
probar los casos límite y saber explicar por qué el código hace lo que hace; de lo contrario, la IA produce una
solución que no se puede defender en una exposición.

---

## 10. Reto: modificación posterior a la primera versión

La primera versión solo listaba personajes y permitía buscarlos. Después se añadieron tres funcionalidades que
**no estaban en esa versión**:

| Mejora | Funcionamiento |
| --- | --- |
| **Modo oscuro / claro** | Variables CSS + `data-theme` + `localStorage`; respeta `prefers-color-scheme` la primera vez |
| **Orden alfabético** | `Intl.Collator('es')` ordena los resultados de la página en el cliente |
| **Historial de búsquedas** | Lista de hasta 6 términos sin duplicados en `localStorage`; cada chip repite la búsqueda |

Además, el Pull Request [#3](https://github.com/rub803030/proyecto-web-ia/pull/3) incorporó el **modal de detalle**
y el botón para **vaciar favoritos** con confirmación, que corresponden a los Issues #1 y #2.

---

## 11. Flujo de trabajo en GitHub

1. **Repositorio público** `proyecto-web-ia` creado en la cuenta `rub803030`.
2. **Commits incrementales** en `main`, uno por avance real:

   | Commit | Avance |
   | --- | --- |
   | 1 | README inicial con la descripción del proyecto |
   | 2 | Estructura semántica de la interfaz (`index.html`) |
   | 3 | Estilos base, tarjetas y diseño adaptable (`style.css`) |
   | 4 | Consumo de la API y renderizado con paginación (`script.js`) |
   | 5 | Buscador con *debounce* y filtros |
   | 6 | Favoritos persistentes con `localStorage` |
   | 7 | Estados de carga, errores, sin resultados y reintento |
   | 8 | Extras: modo oscuro, orden e historial |
   | 9 | Documentación completa en el README |
   | 10-11 | Modal de detalle y vaciar favoritos (rama del Pull Request) |

3. **Issues** para documentar mejoras: [#1](https://github.com/rub803030/proyecto-web-ia/issues/1) (modal de
   detalle) y [#2](https://github.com/rub803030/proyecto-web-ia/issues/2) (vaciar favoritos).
4. **Pull Request** [#3](https://github.com/rub803030/proyecto-web-ia/pull/3) desde la rama
   `mejora/modal-detalle` hacia `main`, con revisión y fusión.
5. **GitHub Pages** activado desde **Settings → Pages → Source: Deploy from a branch → `main` / `(root)`**.
   La aplicación queda publicada en https://rub803030.github.io/proyecto-web-ia/

---

## 12. Preguntas para la presentación

**1. ¿Qué función cumple `fetch()` dentro de la aplicación?**
Es la función del navegador que hace la petición HTTP a la API. Devuelve una promesa; con `await` esperamos la
respuesta, comprobamos `response.ok` y convertimos el cuerpo a objeto con `response.json()`. Se usa en
`loadCharacters()` para listar personajes y en `openDetail()` para pedir uno por su ID.

**2. ¿Qué diferencia existe entre HTML, CSS y JavaScript?**
HTML define la **estructura y el contenido** (qué elementos existen); CSS define la **presentación** (colores,
tamaños, distribución y adaptabilidad); JavaScript define el **comportamiento** (pedir datos, filtrar, guardar
favoritos y actualizar el DOM sin recargar la página).

**3. ¿Cómo funciona el buscador?**
Escucha el evento `input` del campo, espera 450 ms para no consultar en cada tecla y guarda el texto en
`state.query`. Luego `buildUrl()` añade el parámetro `name` y `fetch()` consulta la API, que devuelve solo las
coincidencias. Si no hay ninguna, la API responde 404 y se muestra el mensaje **Sin resultados**.

**4. ¿Qué sucede cuando la API no responde?**
La promesa se rechaza (o la respuesta tiene un código distinto de 404) y el `catch` muestra un mensaje de error
con el botón **Reintentar**. Si `navigator.onLine` es `false`, el mensaje indica que no hay conexión; cuando el
evento `online` se dispara, la consulta se repite automáticamente.

**5. ¿Qué parte del código fue generada por la IA y qué modificaciones realizaron ustedes?**
La IA generó la primera versión de la estructura, los estilos y la lógica de consulta. Sobre esa base se
corrigió el manejo del 404, se añadió el control de peticiones canceladas con `AbortController`, se cambió la
actualización de favoritos para no recargar la lista, se ajustó el diseño para pantallas pequeñas y se agregaron
el historial y el modal de detalle. Cada cambio está en un commit con su explicación.

**6. ¿Cómo publicaron la aplicación mediante GitHub Pages?**
En el repositorio: **Settings → Pages**, en *Source* se eligió **Deploy from a branch**, rama `main` y carpeta
`/(root)`. GitHub toma `index.html` de la raíz y publica el sitio en
`https://rub803030.github.io/proyecto-web-ia/`.

---

## 13. Limitaciones y mejoras futuras

- El orden alfabético se aplica a la página visible porque la API no ofrece ordenamiento; para ordenar todo el
  conjunto habría que descargar todas las páginas.
- Los filtros de especie usan una lista fija de las especies más comunes (la API exige coincidencia exacta).
- No hay pruebas automatizadas; se probó manualmente en Chrome y en vista móvil.
- Posibles mejoras: comparar dos personajes, favoritos con notas, modo sin conexión con caché y pruebas con
  Playwright.

---

## 14. Créditos

- Datos: [Rick and Morty API](https://rickandmortyapi.com) — API pública y gratuita.
- Tipografías: fuentes del sistema (sin descargas externas).
- Desarrollo asistido por IA y revisado por el integrante del equipo.

> **Aviso académico:** este repositorio documenta de forma transparente el uso de inteligencia artificial.
> Todo el código fue probado y puede ser explicado por el integrante durante la presentación.
