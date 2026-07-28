import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core'
import { loadFeedForgeWidget } from '../core'

/**
 * Componente de Angular que renderiza el widget público de FeedForge.
 *
 * La apariencia del widget se personaliza desde el dashboard de FeedForge, por
 * lo que el único input que recibe es el `token` del feed público.
 *
 * @example
 * ```ts
 * @Component({
 *   standalone: true,
 *   imports: [FeedForgeWidget],
 *   template: `<ff-feed-forge token="tu-token-publico" />`,
 * })
 * export class AppComponent {}
 * ```
 */
@Component({
    selector: 'ff-feed-forge',
    standalone: true,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    template: `<feedforge-widget [attr.token]="token"></feedforge-widget>`,
})
export class FeedForgeWidget {
    /** Token público del feed (se obtiene en el dashboard de FeedForge). */
    @Input({ required: true }) token!: string

    constructor() {
        void loadFeedForgeWidget()
    }
}
