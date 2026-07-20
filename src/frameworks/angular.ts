import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core'
import { loadFeedForgeWidget } from '../core'

@Component({
    selector: 'ff-feed-forge',
    standalone: true,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    template: `<feedforge-widget [attr.token]="token" [attr.class]="class" [attr.style]="style"></feedforge-widget>`,
})
export class FeedForgeFeedComponent {
    @Input() token!: string
    @Input() class?: string
    @Input() style?: string

    constructor() {
        loadFeedForgeWidget()
    }
}
