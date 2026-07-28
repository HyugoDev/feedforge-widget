import { createEffect, on, onCleanup } from 'solid-js'
import type { Component } from 'solid-js'
import { loadFeedForgeWidget, TAG_NAME } from '../core'

/**
 * Props del componente {@link FeedForgeWidget}.
 *
 * La apariencia del widget se configura desde el dashboard de FeedForge, por
 * lo que el único parámetro que recibe el componente es el `token` del feed
 * público.
 */
export interface FeedForgeWidgetProps {
    /** Token público del feed (se obtiene en el dashboard de FeedForge). */
    token: string
}

/**
 * Renderiza el widget público de FeedForge en Solid.
 *
 * Carga el script del CDN una sola vez (deduplicado por el core) y monta el
 * custom element `<feedforge-widget>` con el `token` proporcionado. La
 * apariencia se personaliza desde el dashboard, así que no se exponen `class`,
 * `style` ni ningún otro atributo.
 */
export const FeedForgeWidget: Component<FeedForgeWidgetProps> = (props) => {
    const host: HTMLDivElement = document.createElement('div')

    let cancelled = false
    onCleanup(() => { cancelled = true })

    loadFeedForgeWidget()
        .then(() => {
            if (cancelled) return
            const widget = document.createElement(TAG_NAME)
            widget.setAttribute('token', props.token)
            host.append(widget)

            createEffect(on(() => props.token, (next) => {
                widget.setAttribute('token', next)
            }, { defer: true }))
        })
        .catch(() => {
            if (!cancelled) host.textContent = 'No se pudo cargar el feed'
        })

    return host
}
