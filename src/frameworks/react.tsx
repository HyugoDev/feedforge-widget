"use client"

import { useEffect, useRef, useState } from 'react'
import type React from 'react'
import { loadFeedForgeWidget } from '../core'

export interface FeedForgeWidgetProps {
    /** Token del feed publico */
    token: string
    className?: string
    style?: React.CSSProperties
}

export function FeedForgeWidget({ token, className, style }: Readonly<FeedForgeWidgetProps>) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

    useEffect(() => {
        let cancelled = false

        loadFeedForgeWidget()
            .then(() => {
                if (cancelled) return
                setStatus('ready')
            })
            .catch(() => {
                if (!cancelled) setStatus('error')
            })

        return () => {
            cancelled = true
        }
    }, [token])

    useEffect(() => {
        if (status !== 'ready' || !containerRef.current) return

        const container = containerRef.current
        let cancelled = false

        customElements.whenDefined('feedforge-widget').then(() => {
            if (cancelled || !containerRef.current) return

            container.innerHTML = ''

            const widget = document.createElement('feedforge-widget')
            widget.setAttribute('token', token)
            container.appendChild(widget)
        })

        return () => {
            cancelled = true
        }
    }, [status, token])

    if (status === 'error') {
        return <div ref={containerRef} className={className} style={style}>No se pudo cargar el feed</div>
    }

    if (status === 'loading') {
        return <div ref={containerRef} className={className} style={style}>Cargando...</div>
    }

    return <div ref={containerRef} className={className} style={style} />
}

declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            'feedforge-widget': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                token: string
            }
        }
    }
}
