import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { FeedForgeFeed } from './index'

const container = document.getElementById('app')
if (!container) throw new Error('No se encontro el elemento #app')

createRoot(container).render(
    <StrictMode>
        <FeedForgeFeed token="demo-token" />
    </StrictMode>,
)
