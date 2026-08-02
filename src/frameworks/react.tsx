'use client'

import { useEffect, useRef, useState } from 'react'
import type React from 'react'
import { loadFeedForgeWidget, TAG_NAME } from '../core'
import type { FeedForgeWidgetProps } from '../core'

export type { FeedForgeWidgetProps } from '../core'

type Status = 'loading' | 'ready' | 'error'

/**
 * Renderiza el widget público de FeedForge.
 *
 * Carga el script del CDN una sola vez (deduplicado por el core) y monta el
 * custom element `<feedforge-widget>` con el `token` proporcionado. La
 * apariencia (colores, layout, etc.) se personaliza desde el dashboard, así
 * que este componente no expone `className`, `style` ni ningún otro atributo.
 */
export function FeedForgeWidget({ token }: Readonly<FeedForgeWidgetProps>) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [status, setStatus] = useState<Status>('loading')

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        let cancelled = false

        const mountWidget = () => {
            if (cancelled || containerRef.current !== container) return

            container.replaceChildren()
            const widget = document.createElement(TAG_NAME)
            widget.setAttribute('token', token)
            container.appendChild(widget)
        }

        loadFeedForgeWidget()
            .then(() => {
                if (!cancelled) {
                    setStatus('ready')
                    mountWidget()
                }
            })
            .catch(() => {
                if (!cancelled) setStatus('error')
            })

        return () => {
            cancelled = true
            container.replaceChildren()
        }
    }, [token])

    if (status === 'error') {
        return <div>No se pudo cargar el feed</div>
    }

    return <div ref={containerRef} hidden={status === 'loading'} />
}

declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            readonly [TAG_NAME]: React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement>,
                HTMLElement
            > & FeedForgeWidgetProps
        }
    }
}
