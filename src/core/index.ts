const WIDGET_URL = 'https://feedforge.hyugodev.me/widget.js'

export const TAG_NAME = 'feedforge-widget'

export type FeedForgeWidgetStatus = 'loading' | 'ready' | 'error'

// Singleton: todas las instancias y frameworks comparten la misma promesa de
// carga, sin importar cuántos widgets se monten en la página.
let widgetLoadPromise: Promise<void> | null = null

/**
 * Carga el script del widget una sola vez y lo define como custom element
 * (`<feedforge-widget>`). Es framework-agnostic: lo usan los adapters de
 * React, Solid, Angular, o cualquier consumidor vanilla.
 */
export function loadFeedForgeWidget(): Promise<void> {
    if (typeof customElements !== 'undefined' && customElements.get(TAG_NAME)) {
        return Promise.resolve()
    }

    widgetLoadPromise ??= new Promise((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>(`script[src="${WIDGET_URL}"]`)

        const script = existing ?? document.createElement('script')
        script.src = WIDGET_URL
        script.async = true

        script.addEventListener('load', () => resolve(), { once: true })
        script.addEventListener('error', () => reject(new Error(`Failed to load ${WIDGET_URL}`)), { once: true })

        if (!existing) document.head.appendChild(script)
    })

    return widgetLoadPromise
}
