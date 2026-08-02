import { createEffect, on, onCleanup } from 'solid-js'
import type { Component } from 'solid-js'
import { loadFeedForgeWidget, TAG_NAME } from '../core'
import type { FeedForgeWidgetProps } from '../core'

export type { FeedForgeWidgetProps } from '../core'

/**
 * Custom element `<feedforge-widget>` tipado para acceso seguro al atributo
 * `token`.
 */
interface FeedForgeWidgetElement extends HTMLElement {
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
    let widget: FeedForgeWidgetElement | null = null
    onCleanup(() => { cancelled = true })

    // El efecto nace en el owner del componente: Solid lo disposa al desmontar.
    // Mientras la carga no haya terminado `widget` es null → no-op, sin leak.
    createEffect(on(() => props.token, (token) => {
        widget?.setAttribute('token', token)
    }))

    loadFeedForgeWidget()
        .then(() => {
            if (cancelled) return
            const el = document.createElement(TAG_NAME) as FeedForgeWidgetElement
            // Lectura reactiva: el token más reciente aunque haya cambiado durante la carga.
            el.setAttribute('token', props.token)
            widget = el
            host.append(el)
        })
        .catch(() => {
            if (!cancelled) host.textContent = 'No se pudo cargar el feed'
        })

    return host
}
