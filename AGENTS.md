# feedforge-widget

Multi-framework widget library for FeedForge. Core loads `<feedforge-widget>` custom element from CDN; React/Solid/Angular provide framework-specific wrappers.

## Commands
- `bun run dev` — Vite dev server
- `bun run build` — Build library + type declarations (`vite build && tsc -p tsconfig.build.json`)
- `bun run preview` — Preview built files

## Structure
- `src/core/index.ts` — Framework-agnostic widget loader (`loadFeedForgeWidget()`)
- `src/frameworks/*.tsx` — Framework adapters (React, Solid, Angular)
- `src/index.ts` — Main export (React component)
- Widget script loaded from `https://feedforge.hyugodev.me/widget.js`

## Build notes
- Vite lib mode with multiple entry points: `index`, `core`, `solid`, `angular`
- Type declarations generated via separate `tsc` pass (`tsconfig.build.json`)
- Peer dependencies: React 18+, Solid 1.6+, Angular 16+
- Uses Bun as runtime (`bun run`)
