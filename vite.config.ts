import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
    build: {
        lib: {
            entry: {
                index: resolve(__dirname, 'src/index.ts'),
                core: resolve(__dirname, 'src/core/index.ts'),
                solid: resolve(__dirname, 'src/frameworks/solid.ts'),
                angular: resolve(__dirname, 'src/frameworks/angular.ts'),
            },
            formats: ['es', 'cjs'],
            fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
        },
        rollupOptions: {
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
