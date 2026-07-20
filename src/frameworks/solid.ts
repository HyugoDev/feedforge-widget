import { createEffect, onCleanup } from 'solid-js'
import type { Component } from 'solid-js'
import { loadFeedForgeWidget } from '../core'

export interface FeedForgeWidgetProps {
    /** Token del feed publico */
    token: string
    class?: string
    style?: string | Record<string, string>
}

export const FeedForgeWidget: Component<FeedForgeWidgetProps> = (props) => {
    loadFeedForgeWidget()

    const el = document.createElement('feedforge-widget') as HTMLElement & { token?: string }

    createEffect(() => {
        el.token = props.token
    })

    createEffect(() => {
        if (props.class) el.className = props.class
    })

    createEffect(() => {
        const style = props.style
        if (!style) return
        el.style.cssText =
            typeof style === 'string'
                ? style
                : Object.entries(style)
                      .map(([key, value]) => `${key}:${value}`)
                      .join(';')
    })

    onCleanup(() => el.remove())

    return el
}
