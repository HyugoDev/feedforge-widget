/**
 * Versión del script del widget. Debe coincidir con el header de
 * `public/widget.js` en el proyecto feedforge. Va como query (?v=) en la URL
 * para romper la caché del navegador cuando se publica una versión nueva.
 */
const WIDGET_SCRIPT_VERSION = '5.3' as const

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
 * Indica si un script ya terminó de ejecutarse. `HTMLScriptElement` no declara
 * `readyState` en lib.dom, por eso se hace un widen explícito del tipo.
 */
const isScriptFinished = (s: HTMLScriptElement): boolean => {
    const state = (s as HTMLScriptElement & { readyState?: string }).readyState
    return state === 'complete' || state === 'loaded'
}

/**
 * Carga el script del widget del CDN una sola vez y deja registrado el custom
 * element `<feedforge-widget>` en el `customElements` registry del navegador.
 *
 * Es framework-agnostic: la usan los adapters de React, Solid y Angular, así
 * como cualquier consumidor vanilla. La carga se deduplica automáticamente:
 * múltiples llamadas concurrentes comparten la misma promesa, y si el script
 * ya fue cargado se resuelve de inmediato.
 *
 * @throws {Error} Si se llama fuera del navegador, el script no pudo
 *                 descargarse, o un script ya cargado no registró el custom
 *                 element (CDN caído, red bloqueada, etc.).
 */
export function loadFeedForgeWidget(): Promise<void> {
    // Guard SSR completo: el loader solo tiene sentido en un navegador.
    if (typeof document === 'undefined' || typeof customElements === 'undefined') {
        return Promise.reject(
            new Error('loadFeedForgeWidget() solo está disponible en el navegador'),
        )
    }

    if (customElements.get(TAG_NAME)) {
        return Promise.resolve()
    }

    if (widgetLoadPromise) return widgetLoadPromise

    widgetLoadPromise = new Promise<void>((resolve, reject) => {
        const isSameScript = (s: HTMLScriptElement) => s.src === WIDGET_SCRIPT_URL
        const existing = Array.from(document.scripts).find(isSameScript)

        const script = existing ?? document.createElement('script')
        // Un script preexistente ya tiene la URL correcta; re-setearla es
        // innecesario (y rompe algunos entornos al tocar el atributo).
        if (script.src !== WIDGET_SCRIPT_URL) script.src = WIDGET_SCRIPT_URL
        script.async = true

        const onLoad = () => {
            cleanup()
            if (customElements.get(TAG_NAME)) {
                resolve()
                return
            }
            // El script cargó pero el elemento aún no se registró: esperarlo por
            // si el registro es asíncrono tras la carga. `whenDefined` solo
            // rechaza ante un nombre inválido; si el elemento nunca se registra,
            // esta espera queda pendiente — el path de script preexistente ya
            // terminado cubre el caso de script roto (ver más abajo).
            customElements.whenDefined(TAG_NAME).then(() => resolve(), () => reject(
                new Error(`El custom element "${TAG_NAME}" no se registró tras cargar ${WIDGET_SCRIPT_URL}`),
            ))
        }
        const onError = () => {
            cleanup()
            reject(new Error(`No se pudo cargar el widget desde ${WIDGET_SCRIPT_URL}`))
        }
        // Evita acumular listeners en reintentos posteriores sobre el mismo script.
        const cleanup = () => {
            script.removeEventListener('load', onLoad)
            script.removeEventListener('error', onError)
        }

        // Caso vanilla del README: un `<script src>` ya en el DOM que terminó de
        // ejecutarse. Su evento `load` ya ocurrió y no volverá a dispararse, así
        // que resolvemos o rechazamos de inmediato según si registró el elemento.
        if (existing && isScriptFinished(existing)) {
            if (customElements.get(TAG_NAME)) {
                resolve()
            } else {
                reject(new Error(`El custom element "${TAG_NAME}" no se registró tras cargar ${WIDGET_SCRIPT_URL}`))
            }
            return
        }

        script.addEventListener('load', onLoad, { once: true })
        script.addEventListener('error', onError, { once: true })

        if (!existing) document.head.appendChild(script)
    }).catch((error: unknown) => {
        widgetLoadPromise = null
        throw error
    })

    return widgetLoadPromise
}

export type { FeedForgeWidgetProps } from './types'
