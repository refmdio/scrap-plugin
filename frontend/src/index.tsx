import React from 'react'
import { createRoot } from 'react-dom/client'
import type { Host } from '@refmdio/plugin-sdk'
import { App } from './App'
import { canOpen, getRoute, exec } from './host'

export default async function mount(container: Element, host: Host) {
  const root = createRoot(container)
  root.render(<App host={host} />)
  return () => {
    try { root.unmount() } catch {}
  }
}

export { canOpen, getRoute, exec }
