import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { FeedForgeWidget } from './index'

const container = document.getElementById('app')
if (!container) throw new Error('No se encontro el elemento #app')

createRoot(container).render(
    <StrictMode>
        <FeedForgeWidget token="demo-token" />
    </StrictMode>,
)
