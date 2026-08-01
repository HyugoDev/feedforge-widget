/**
 * Versión del script del widget. Debe coincidir con el header de
 * `public/widget.js` en el proyecto feedforge. Va como query (?v=) en la URL
 * para romper la caché del navegador cuando se publica una versión nueva.
 */
const WIDGET_SCRIPT_VERSION = '5.2' as const

/**
 * URL del script del widget servido desde el CDN de FeedForge.
 */
const WIDGET_SCRIPT_URL = `https://feedforge.hyugodev.me/widget.js?v=${WIDGET_SCRIPT_VERSION}` as const

/**
 * Nombre del custom element registrado por el script del widget.
 */
export const TAG_NAME = 'feedforge-widget' as const

/**
 * Promesa compartida por todas las instancias y frameworks.
 * Se resetea a `null` ante un fallo para permitir reintentos posteriores.
 */
let widgetLoadPromise: Promise<void> | null = null

/**
 * Carga el script del widget del CDN una sola vez y deja registrado el custom
 * element `<feedforge-widget>` en el `customElements` registry del navegador.
 *
 * Es framework-agnostic: la usan los adapters de React, Solid y Angular, así
 * como cualquier consumidor vanilla. La carga se deduplica automáticamente:
 * múltiples llamadas concurrentes comparten la misma promesa, y si el script
 * ya fue cargado se resuelve de inmediato.
 *
 * @throws {Error} Si el script no pudo descargarse o el custom element no se
 *                 registró tras la carga (CDN caído, red bloqueada, etc.).
 */
export function loadFeedForgeWidget(): Promise<void> {
    if (typeof customElements !== 'undefined' && customElements.get(TAG_NAME)) {
        return Promise.resolve()
    }

    if (widgetLoadPromise) return widgetLoadPromise

    widgetLoadPromise = new Promise<void>((resolve, reject) => {
        const isSameScript = (s: HTMLScriptElement) => s.src === WIDGET_SCRIPT_URL
        const existing = Array.from(document.scripts).find(isSameScript)

        const script = existing ?? document.createElement('script')
        script.src = WIDGET_SCRIPT_URL
        script.async = true

        const onLoad = () => {
            if (customElements.get(TAG_NAME)) {
                resolve()
                return
            }
            customElements.whenDefined(TAG_NAME).then(() => resolve(), () => reject(
                new Error(`El custom element "${TAG_NAME}" no se registró tras cargar ${WIDGET_SCRIPT_URL}`),
            ))
        }
        const onError = () => reject(new Error(`No se pudo cargar el widget desde ${WIDGET_SCRIPT_URL}`))

        script.addEventListener('load', onLoad, { once: true })
        script.addEventListener('error', onError, { once: true })

        if (!existing) document.head.appendChild(script)
    }).catch((error: unknown) => {
        widgetLoadPromise = null
        throw error
    })

    return widgetLoadPromise
}
