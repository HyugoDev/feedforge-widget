import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
    build: {
        sourcemap: true,
        lib: {
            entry: {
                index: resolve(import.meta.dirname, 'src/index.ts'),
                core: resolve(import.meta.dirname, 'src/core/index.ts'),
                solid: resolve(import.meta.dirname, 'src/frameworks/solid.ts'),
                angular: resolve(import.meta.dirname, 'src/frameworks/angular.ts'),
            },
            name: 'FeedForgeWidget',
            formats: ['es', 'cjs'],
            fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
        },
        rolldownOptions: {
            // Dependencias que no deben bundle-arse dentro de la librería:
            // cada consumidor aporta la suya (peerDependencies).
            external: [
                'react',
                'react-dom',
                'react/jsx-runtime',
                'solid-js',
                '@angular/core',
            ],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    'react/jsx-runtime': 'jsxRuntime',
                    'solid-js': 'SolidJS',
                    '@angular/core': 'ng.core',
                },
            },
        },
    },
})
