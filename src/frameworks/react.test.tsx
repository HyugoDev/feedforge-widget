import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { FeedForgeWidget } from './react'
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

describe('FeedForgeWidget (React)', () => {
    it('monta el custom element con el token al cargar correctamente', async () => {
        loadMock.mockResolvedValue(undefined)
        render(<FeedForgeWidget token="token-a" />)

        await waitFor(() => {
            expect(document.querySelector('feedforge-widget')).toHaveAttribute('token', 'token-a')
        })
    })

    it('re-monta el widget al cambiar el token', async () => {
        loadMock.mockResolvedValue(undefined)
        const { rerender } = render(<FeedForgeWidget token="token-a" />)

        await waitFor(() => {
            expect(document.querySelector('feedforge-widget')).toHaveAttribute('token', 'token-a')
        })

        rerender(<FeedForgeWidget token="token-b" />)

        await waitFor(() => {
            expect(document.querySelector('feedforge-widget')).toHaveAttribute('token', 'token-b')
        })
    })

    it('muestra el mensaje de error si la carga falla', async () => {
        loadMock.mockRejectedValue(new Error('boom'))
        render(<FeedForgeWidget token="token-a" />)

        expect(await screen.findByText('No se pudo cargar el feed')).toBeInTheDocument()
    })

    it('limpia el contenedor al desmontar', async () => {
        loadMock.mockResolvedValue(undefined)
        const { unmount } = render(<FeedForgeWidget token="token-a" />)

        await waitFor(() => {
            expect(document.querySelector('feedforge-widget')).toBeInTheDocument()
        })

        unmount()
        expect(document.querySelector('feedforge-widget')).not.toBeInTheDocument()
    })
})
