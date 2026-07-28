# FeedForge Widget

> **Widget público de FeedForge** — Integra un feed de FeedForge en cualquier
> sitio web con React, Solid, Angular o JavaScript vanilla.

El widget se carga desde el CDN de FeedForge como un custom element
(`<feedforge-widget>`). Esta librería expone wrappers por framework que se
encargan de cargar el script una sola vez y montar el elemento por ti.

---

## Índice

- [Instalación](#instalación)
- [Uso](#uso)
  - [React](#react)
  - [Solid](#solid)
  - [Angular](#angular)
  - [Vanilla JavaScript / HTML](#vanilla-javascript--html)
- [Cuando el widget carga: `loadFeedForgeWidget`](#cuando-el-widget-carga-loadfeedforgewidget)
- [Por qué el único parámetro es `token`](#por-qué-el-único-parámetro-es-token)
- [Token del feed](#token-del-feed)
- [Resolución de problemas](#resolución-de-problemas)
- [Desarrollo](#desarrollo)
- [Licencia](#licencia)

## Instalación

```bash
# npm
npm install @juguitostudio/feedforge-widget

# yarn
yarn add @juguitostudio/feedforge-widget

# pnpm
pnpm add @juguitostudio/feedforge-widget

# bun
bun add @juguitostudio/feedforge-widget
```

> ⚠️ **Peer dependencies**: si usas los wrappers por framework, el paquete
> asume que tu proyecto ya tiene instalado el runtime correspondiente —
> **React ≥ 18**, **Solid ≥ 1.6** o **Angular ≥ 16**. El wrapper de vanilla
> no tiene dependencias.

## Uso

Todos los wrappers comparten **una sola firma**: el parámetro `token`.

### React

```tsx
import { FeedForgeWidget } from '@juguitostudio/feedforge-widget'

export function App() {
    return <FeedForgeWidget token="tu-token-publico" />
}
```

| Prop     | Tipo     | Descripción |
|----------|----------|-------------|
| `token`  | `string` | **Requerido.** Token público del feed. |

### Solid

```tsx
import { FeedForgeWidget } from '@juguitostudio/feedforge-widget/solid'

export function App() {
    return <FeedForgeWidget token="tu-token-publico" />
}
```

| Prop     | Tipo     | Descripción |
|----------|----------|-------------|
| `token`  | `string` | **Requerido.** Token público del feed. |

### Angular

En el `template` el selector del wrapper es `<ff-feed-forge>` y el `token`
pasa como input.

```ts
import { Component } from '@angular/core'
import { FeedForgeWidget } from '@juguitostudio/feedforge-widget/angular'

@Component({
    standalone: true,
    imports: [FeedForgeWidget],
    template: `<ff-feed-forge token="tu-token-publico" />`,
})
export class AppComponent {}
```

| Input    | Tipo     | Descripción |
|----------|----------|-------------|
| `token`  | `string` | **Requerido.** Token público del feed. |

### Vanilla JavaScript / HTML

Importa `loadFeedForgeWidget()` y espera a que se resuelva la promesa antes de
colocar el `<feedforge-widget>` en el DOM. Una vez cargado, puedes usarlo como
cualquier otro custom element.

```html
<script type="module">
    import { loadFeedForgeWidget } from '@juguitostudio/feedforge-widget/core'

    await loadFeedForgeWidget()
</script>

<feedforge-widget token="tu-token-publico"></feedforge-widget>
```

También puedes omitir `loadFeedForgeWidget()` y colocar la etiqueta
directamente; simplemente importa el script y el navegador se encargará del
upgrade:

```html
<script src="https://feedforge.hyugodev.me/widget.js" async></script>
<feedforge-widget token="tu-token-publico"></feedforge-widget>
```

## Cuando el widget carga: `loadFeedForgeWidget`

`loadFeedForgeWidget()` es la función framework-agnostic que:

1. **Deduplica** la carga del script (`<script src="https://feedforge.hyugodev.me/widget.js">`)
   a una sola promesa compartida entre todas las instancias y frameworks.
2. **Registra** el custom element `<feedforge-widget>` en el registry del
   navegador.
3. **Permite reintentos** si la carga falló (la promesa se descarta y una
   nueva llamada intenta de nuevo).

Los wrappers de React, Solid y Angular la llaman por ti. Solo la necesitas
para uso vanilla o si quieres precargar el widget.

## Por qué el único parámetro es `token`

La apariencia del feed (colores, tipografía, layout, tamaños, modo claro/oscuro)
**se configura desde el dashboard de FeedForge**, no desde el sitio que lo
embebe.

Por eso `FeedForgeWidget` no acepta `className`, `class`, `style` ni ningún
otro parámetro: pasar el token es lo único necesario para renderizar el feed,
y cualquier personalización visual vive en el dashboard. Esto evita que el
widget se acople a convenciones de UI del sitio embebido y mantiene una
fuente única de verdad para el diseño.

## Token del feed

1. Ve a [FeedForge](https://feedforge.hyugodev.me) e inicia sesión.
2. Crea un feed **público**.
3. Copia el token generado en el dashboard.
4. Pásalo al componente como `token="..."`.

> El token público es de solo lectura y no expone datos privados: sirve
> exclusivamente para identificar el feed a mostrar.

## Resolución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| El widget no aparece | Error de red bloqueando `feedforge.hyugodev.me` | Revisa CSP / ad-blockers / firewall. |
| Veo “No se pudo cargar el feed” | El CDN o el script están caídos | Reintenta recargando; `loadFeedForgeWidget` reintenta solo. |
| El token es inválido | Token mal copiado o feed eliminado | Verifica el token en el dashboard. |
| Apariencia no aplica | La configuración se edita en el dashboard, no en el sitio | Edita el feed en [FeedForge](https://feedforge.hyugodev.me). |

## Desarrollo

### Requisitos

- [Bun](https://bun.sh) 1.0+ como runtime y gestor de paquetes.
- Node.js 18+ si vas a probar los wrappers en otro entorno.

### Comandos

| Comando        | Descripción |
|----------------|-------------|
| `bun run dev`     | Inicia el servidor de desarrollo (Vite) sobre `index.html`. |
| `bun run build`   | Compila la librería y genera tipos (`vite build` + `tsc`). |
| `bun run preview` | Sirve los archivos compilados en `dist/`. |

### Estructura del proyecto

```
feedforge-widget/
├── src/
│   ├── core/
│   │   └── index.ts          # loadFeedForgeWidget() — loader framework-agnostic
│   ├── frameworks/
│   │   ├── react.tsx         # <FeedForgeWidget /> para React
│   │   ├── solid.ts          # <FeedForgeWidget /> para Solid
│   │   └── angular.ts        # <ff-feed-forge> para Angular
│   ├── index.ts              # Export principal (React)
│   └── main.tsx              # Demo de Vite (no se publica)
├── dist/                     # Salida del build (publicado en npm)
├── vite.config.ts            # Vite lib mode con múltiples entry points
├── tsconfig.json             # Configuración base de TypeScript
├── tsconfig.build.json       # Generación de declaraciones (.d.ts)
└── package.json
```

## Licencia

MIT — libre para uso personal y comercial.
