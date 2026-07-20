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
    const ref = useRef<HTMLElement | null>(null)
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

    useEffect(() => {
        let cancelled = false

        loadFeedForgeWidget()
            .then(() => {
                if (!cancelled) setStatus('ready')
            })
            .catch(() => {
                if (!cancelled) setStatus('error')
            })

        return () => {
            cancelled = true
        }
    }, [])

    if (status === 'error') {
        return <div className={className} style={style}>No se pudo cargar el feed</div>
    }

    return (
        <feedforge-widget ref={ref} token={token} className={className} style={style} />
    )
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
