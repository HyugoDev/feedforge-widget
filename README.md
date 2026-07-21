# FeedForge Widget

> **Widget público de FeedForge** - Integra feeds de FeedForge en cualquier sitio web con React, Solid, Angular o vanilla JavaScript.

## Características

- **Multi-framework**: Compatible con React, Solid, Angular y vanilla JS
- **Lightweight**: Carga el widget desde CDN, sin bundle adicional
- **Fácil de usar**: Solo necesitas un token de feed público
- **Customizable**: Soporta clases CSS y estilos personalizados

## Instalación

### npm
```bash
npm install @juguitostudio/feedforge-widget
```

### yarn
```bash
yarn add @juguitostudio/feedforge-widget
```

### pnpm
```bash
pnpm add @juguitostudio/feedforge-widget
```

### bun
```bash
bun add @juguitostudio/feedforge-widget
```

## Uso

### React

```tsx
import { FeedForgeWidget } from '@juguitostudio/feedforge-widget'

function App() {
  return <FeedForgeWidget token="tu-token-publico" className="my-feed" />
}
```

**Props:**
- `token` (requerido): Token público del feed
- `className?`: Clases CSS para el widget
- `style?`: Estilos en línea (objeto React.CSSProperties)

### Solid

```tsx
import { FeedForgeWidget } from '@juguitostudio/feedforge-widget/solid'

function App() {
  return <FeedForgeWidget token="tu-token-publico" class="my-feed" />
}
```

**Props:**
- `token` (requerido): Token público del feed
- `class?`: Clases CSS para el widget
- `style?`: Estilos en línea (string o objeto)

### Angular

```tsx
import { FeedForgeWidget } from '@juguitostudio/feedforge-widget/angular'

@Component({
  standalone: true,
  imports: [FeedForgeWidget],
  template: `<ff-feed-forge token="tu-token-publico" class="my-feed"></ff-feed-forge>`
})
export class App {}
```

**Inputs:**
- `token` (requerido): Token público del feed
- `class?`: Clases CSS para el widget
- `style?`: Estilos en línea (string)

### Vanilla JavaScript / HTML

```html
<script type="module">
  import { loadFeedForgeWidget } from '@juguitostudio/feedforge-widget/core'
  
  await loadFeedForgeWidget()
</script>

<feedforge-widget token="tu-token-publico" class="my-feed"></feedforge-widget>
```

## Obtener un Token de Feed

1. Ve a [FeedForge](https://feedforge.hyugodev.me)
2. Crea un feed público
3. Copia el token generado
4. **¡Usalo en el componente como se muestra arriba!**

## Desarrollo

### Requisitos
- Bun 1.0+
- Node.js 18+

### Comandos

| Comando | Descripción |
|---------|-------------|
| `bun run dev` | Inicia el servidor de desarrollo (Vite) |
| `bun run build` | Compila la librería para producción |
| `bun run preview` | Vista previa de los archivos compilados |

### Estructura del proyecto

```
feedforge-widget/
├── src/
│   ├── core/
│   │   └── index.ts      # Lógica del widget (loadFeedForgeWidget)
│   ├── frameworks/
│   │   ├── react.tsx     # Componente React
│   │   ├── solid.ts      # Componente Solid
│   │   └── angular.ts    # Componente Angular
│   └── index.ts          # Export principal (React)
├── dist/                 # Archivos compilados
├── vite.config.ts        # Configuración de Vite
├── tsconfig.json         # Configuración de TypeScript
└── package.json
```

## Licencia

MIT - Libre para uso personal y comercial
