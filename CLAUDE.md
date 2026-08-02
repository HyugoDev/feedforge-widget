# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos

Bun es el runtime y gestor de paquetes (no npm/pnpm).

| Comando          | Descripción                                                        |
|------------------|--------------------------------------------------------------------|
| `bun install`    | Instala dependencias.                                              |
| `bun run dev`    | Servidor de desarrollo Vite sobre `index.html` (demo con React).   |
| `bun run build`  | Compila la librería (`vite build`) y genera los `.d.ts` (`tsc -p tsconfig.build.json`). Salida en `dist/`. |
| `bun run preview`| Sirve los archivos compilados de `dist/`.                          |
| `bun publish`    | Publica a npm; `prepublishOnly`/`prepack` corren `bun run build` automáticamente. |

No hay test suite ni linter configurados. La verificación de tipo se hace con
`tsc` como parte de `bun run build` (`noEmit` en `tsconfig.json`). Para
comprobar tipos sin emitir: `bunx tsc --noEmit`.

## Arquitectura

Es una librería npm publicada (`@juguitostudio/feedforge-widget`) que embebe un
**custom element** `<feedforge-widget>` cargado desde el CDN de FeedForge
(`https://feedforge.hyugodev.me/widget.js`). La librería NO implementa el feed:
solo carga el script del CDN una vez y expone wrappers por framework.

### `src/core/index.ts` — el loader framework-agnostic

`loadFeedForgeWidget()` es el corazón de todo:

1. **Deduplica** la carga del script CDN a una sola promesa compartida
   (`widgetLoadPromise`) entre todas las instancias y frameworks. Si el custom
   element ya está registrado, resuelve de inmediato.
2. **Reintenta** tras un fallo: si la promesa se rechaza se resetea a `null`,
   de modo que una llamada posterior vuelve a intentarlo.
3. Se reutiliza un `<script>` existente con la misma URL si ya está en el DOM.

`TAG_NAME` (`'feedforge-widget'`) es el nombre del custom element y se exporta
para que los wrappers lo usen.

### Wrappers por framework (`src/frameworks/`)

- `react.tsx` — export principal del paquete. Estado `'loading' | 'ready' | 'error'`;
  monta el custom element tras `customElements.whenDefined(TAG_NAME)` y limpia el
  contenedor en el cleanup del `useEffect`. Declara el custom element en el JSX
  vía module augmentation de `react`.
- `solid.ts` — monta el elemento en un `div` creado programáticamente; sincroniza
  el atributo `token` con `createEffect(on(...))`. **No** usa JSX del host.
- `angular.ts` — componente standalone con selector `ff-feed-forge` y
  `CUSTOM_ELEMENTS_SCHEMA`; el template delega en `<feedforge-widget>`.

Los tres reciben **exclusivamente** `token` (string requerido). Esta es una
decisión de diseño deliberada: la apariencia (colores, layout, tema) se configura
desde el dashboard de FeedForge, no desde el sitio embebido. No añadas props como
`className`/`style`.

### Contrato de configuración

- `WIDGET_SCRIPT_VERSION` en `src/core/index.ts` **debe coincidir** con el header
  de versión de `widget.js` en el proyecto `feedforge` separado. Va como query
  `?v=` en la URL para romper la caché del navegador al publicar una versión nueva.
- El `exports` map de `package.json` define las subrutas del paquete: `.` (React),
  `./core`, `./solid`, `./angular`. `dist/` es la única salida publicada (`files`).
- Los frameworks son `peerDependencies` (React ≥18, Solid ≥1.6, Angular ≥16) y
  quedan **externalizados** en `vite.config.ts` (no se bundle-arean).

### Archivos de demo (no se publican)

- `src/main.tsx` + `index.html` — demo de Vite. Excluida de la generación de
  tipos por `tsconfig.build.json`.

## Convenciones

- Los comentarios, docblocks y el README están escritos en **español**; mantén
  ese idioma al documentar.
- `tsconfig.json` tiene `verbatimModuleSyntax` y `erasableSyntaxOnly`: importa
  tipos con `import type` y evita sintaxis no erasable (p. ej. enums).
- Sin runtime del framework en el paquete: cualquier consumo de React/Solid/
  Angular debe importarse desde el paquete del consumidor, no bundler-se.
