import { NgIf } from '@angular/common'
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, signal } from '@angular/core'
import { loadFeedForgeWidget } from '../core'

export type { FeedForgeWidgetProps } from '../core'

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
    imports: [NgIf],
    template: `
        <ng-container *ngIf="error(); else feed">
            <div>No se pudo cargar el feed</div>
        </ng-container>
        <ng-template #feed>
            <feedforge-widget [attr.token]="token"></feedforge-widget>
        </ng-template>
    `,
})
export class FeedForgeWidget {
    /** Token público del feed (se obtiene en el dashboard de FeedForge). */
    @Input({ required: true }) token!: string

    /**
     * Señal interna de error: si la carga del widget falla se muestra un
     * mensaje en vez del feed. Se usa `signal()` (estable desde Angular 16) en
     * lugar de signal inputs para no romper el peer dependency `>=16`.
     */
    readonly error = signal(false)

    constructor() {
        void loadFeedForgeWidget().catch(() => this.error.set(true))
    }
}
