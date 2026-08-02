import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TAG_NAME } from './index'

/**
 * URL del script del widget. Debe mantenerse en sincronía con
 * `WIDGET_SCRIPT_URL` de `./index.ts` (ver el comentario de versión ahí).
 */
const WIDGET_SCRIPT_URL = 'https://feedforge.hyugodev.me/widget.js?v=5.2'

/**
 * Mock del `CustomElementRegistry` para controlar `get`/`define`/`whenDefined`
 * sin contaminar el registry real de happy-dom (que no es reseteable).
 */
class MockCustomElementRegistry {
    private definitions = new Map<string, unknown>()
    private pending = new Map<string, Array<() => void>>()

    define(name: string, ctor: unknown): void {
        this.definitions.set(name, ctor)
        const resolvers = this.pending.get(name)
        this.pending.delete(name)
        resolvers?.forEach((resolve) => resolve())
    }

    get(name: string): unknown {
        return this.definitions.get(name)
    }

    whenDefined(name: string): Promise<void> {
        if (this.definitions.has(name)) return Promise.resolve()
        return new Promise((resolve) => {
            const resolvers = this.pending.get(name) ?? []
            resolvers.push(resolve)
            this.pending.set(name, resolvers)
        })
    }
}

let registry: MockCustomElementRegistry

beforeEach(() => {
    registry = new MockCustomElementRegistry()
    vi.stubGlobal('customElements', registry)
    vi.resetModules()
    document.querySelectorAll('script').forEach((script) => script.remove())
})

afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
})

/** Captura los scripts que el core intenta inyectar en `<head>`. */
const captureScripts = () => {
    const scripts: HTMLScriptElement[] = []
    vi.spyOn(document.head, 'appendChild').mockImplementation((node: Node) => {
        scripts.push(node as HTMLScriptElement)
        return node
    })
    return scripts
}

/**
 * Simula un `<script src>` preexistente en `document.scripts` sin conectarlo
 * al DOM (happy-dom lanza si un script externo se conecta al documento).
 */
const seedExistingScript = (readyState?: string) => {
    const existing = document.createElement('script')
    existing.src = WIDGET_SCRIPT_URL
    if (readyState) {
        Object.defineProperty(existing, 'readyState', { value: readyState, configurable: true })
    }
    vi.spyOn(document, 'scripts', 'get').mockReturnValue(
        [existing] as unknown as HTMLCollectionOf<HTMLScriptElement>,
    )
    return existing
}

describe('loadFeedForgeWidget', () => {
    it('resuelve de inmediato si el custom element ya está registrado (sin inyectar script)', async () => {
        const { loadFeedForgeWidget } = await import('./index')
        registry.define(TAG_NAME, class {})

        const appendSpy = vi.spyOn(document.head, 'appendChild')

        await expect(loadFeedForgeWidget()).resolves.toBeUndefined()
        expect(appendSpy).not.toHaveBeenCalled()
    })

    it('deduplica llamadas concurrentes en una sola promesa y un solo script', async () => {
        const { loadFeedForgeWidget } = await import('./index')
        const scripts = captureScripts()

        const first = loadFeedForgeWidget()
        const second = loadFeedForgeWidget()

        expect(second).toBe(first)
        expect(scripts).toHaveLength(1)
        expect(scripts[0].src).toBe(WIDGET_SCRIPT_URL)
        expect(scripts[0].async).toBe(true)

        registry.define(TAG_NAME, class {})
        scripts[0].dispatchEvent(new Event('load'))
        await expect(first).resolves.toBeUndefined()
    })

    it('resuelve cuando el script carga y registra el custom element', async () => {
        const { loadFeedForgeWidget } = await import('./index')
        const scripts = captureScripts()

        const promise = loadFeedForgeWidget()
        registry.define(TAG_NAME, class {})
        scripts[0].dispatchEvent(new Event('load'))

        await expect(promise).resolves.toBeUndefined()
    })

    it('resuelve si el registro del elemento es asíncrono tras el load', async () => {
        const { loadFeedForgeWidget } = await import('./index')
        const scripts = captureScripts()

        const promise = loadFeedForgeWidget()
        scripts[0].dispatchEvent(new Event('load'))
        registry.define(TAG_NAME, class {})

        await expect(promise).resolves.toBeUndefined()
    })

    it('rechaza ante un error de red y permite reintentos', async () => {
        const { loadFeedForgeWidget } = await import('./index')
        const scripts = captureScripts()

        const first = loadFeedForgeWidget()
        scripts[0].dispatchEvent(new Event('error'))
        await expect(first).rejects.toThrow(/No se pudo cargar el widget/)

        // El reintento inyecta un script nuevo (la promesa compartida se reinicia).
        const retry = loadFeedForgeWidget()
        expect(scripts).toHaveLength(2)

        registry.define(TAG_NAME, class {})
        scripts[1].dispatchEvent(new Event('load'))
        await expect(retry).resolves.toBeUndefined()
    })

    it('reutiliza un script existente con la misma URL sin re-insertarlo', async () => {
        const { loadFeedForgeWidget } = await import('./index')
        const existing = seedExistingScript()

        const appendSpy = vi.spyOn(document.head, 'appendChild')
        const promise = loadFeedForgeWidget()

        expect(appendSpy).not.toHaveBeenCalled()

        registry.define(TAG_NAME, class {})
        existing.dispatchEvent(new Event('load'))
        await expect(promise).resolves.toBeUndefined()
    })

    it('resuelve de inmediato si un script preexistente ya terminó y registró el elemento', async () => {
        const { loadFeedForgeWidget } = await import('./index')
        seedExistingScript('complete')

        registry.define(TAG_NAME, class {})
        await expect(loadFeedForgeWidget()).resolves.toBeUndefined()
    })

    it('rechaza (no cuelga) si un script preexistente ya terminó sin registrar el elemento', async () => {
        const { loadFeedForgeWidget } = await import('./index')
        seedExistingScript('complete')

        await expect(loadFeedForgeWidget()).rejects.toThrow(/no se registró/)
    })

    it('rechaza fuera del navegador', async () => {
        const { loadFeedForgeWidget } = await import('./index')
        vi.stubGlobal('document', undefined)
        vi.stubGlobal('customElements', undefined)

        await expect(loadFeedForgeWidget()).rejects.toThrow(/solo está disponible en el navegador/)
    })
})
