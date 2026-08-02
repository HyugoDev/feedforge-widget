import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { createComponent, createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { FeedForgeWidget } from './solid'
import { loadFeedForgeWidget } from '../core'

vi.mock('../core', () => ({
    TAG_NAME: 'feedforge-widget',
    loadFeedForgeWidget: vi.fn(),
}))

const loadMock = vi.mocked(loadFeedForgeWidget)

beforeEach(() => {
    loadMock.mockReset()
})

afterEach(() => {
    document.body.innerHTML = ''
})

describe('FeedForgeWidget (Solid)', () => {
    it('monta el custom element con el token al cargar correctamente', async () => {
        loadMock.mockResolvedValue(undefined)
        const dispose = render(
            () => createComponent(FeedForgeWidget, { token: 'token-a' }),
            document.body,
        )

        await vi.waitFor(() => {
            expect(document.querySelector('feedforge-widget')).toHaveAttribute('token', 'token-a')
        })

        dispose()
    })

    it('sincroniza el atributo token cuando el token cambia', async () => {
        loadMock.mockResolvedValue(undefined)
        const [token, setToken] = createSignal('token-a')
        // `get` en las props emula lo que genera el compilador JSX de Solid
        // (un getter reactivo, no una función).
        const props: { token: string } = { get token() { return token() } }
        const dispose = render(
            () => createComponent(FeedForgeWidget, props),
            document.body,
        )

        await vi.waitFor(() => {
            expect(document.querySelector('feedforge-widget')).toHaveAttribute('token', 'token-a')
        })

        setToken('token-b')

        await vi.waitFor(() => {
            expect(document.querySelector('feedforge-widget')).toHaveAttribute('token', 'token-b')
        })

        dispose()
    })

    it('no monta el widget si se desmonta antes de que cargue', async () => {
        let resolveLoad!: () => void
        loadMock.mockReturnValue(
            new Promise<void>((resolve) => { resolveLoad = resolve }),
        )

        const dispose = render(
            () => createComponent(FeedForgeWidget, { token: 'token-a' }),
            document.body,
        )

        dispose()
        resolveLoad()

        await vi.waitFor(() => {
            expect(document.querySelector('feedforge-widget')).toBeNull()
        })
    })

    it('muestra el mensaje de error si la carga falla', async () => {
        loadMock.mockRejectedValue(new Error('boom'))
        const dispose = render(
            () => createComponent(FeedForgeWidget, { token: 'token-a' }),
            document.body,
        )

        await vi.waitFor(() => {
            expect(document.body.textContent).toContain('No se pudo cargar el feed')
        })

        dispose()
    })
})
