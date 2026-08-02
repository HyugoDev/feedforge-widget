/**
 * Props del widget FeedForge, compartidas por los wrappers de framework.
 *
 * La apariencia del widget se configura desde el dashboard de FeedForge, por
 * lo que el único parámetro que reciben los componentes es el `token` del feed
 * público.
 */
export interface FeedForgeWidgetProps {
    /** Token público del feed (se obtiene en el dashboard de FeedForge). */
    token: string
}
