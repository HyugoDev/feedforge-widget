import { defineConfig } from 'vitest/config'

export default defineConfig({
    resolve: {
        // solid-js distingue builds browser/server en su export map; sin esta
        // condición los tests resuelven al build de servidor y `render` lanza.
        conditions: ['browser'],
    },
    test: {
        environment: 'happy-dom',
        include: ['src/**/*.test.{ts,tsx}'],
    },
})
