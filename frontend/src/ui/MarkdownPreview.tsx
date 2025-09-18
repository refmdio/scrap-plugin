import React, { useEffect, useRef } from 'react'
import type { Host } from '@refmdio/plugin-sdk'
import type { createMarkdownRenderer } from '@refmdio/plugin-sdk'

export type MarkdownPreviewProps = {
  renderer: ReturnType<typeof createMarkdownRenderer>
  host: Host
  value: string
  docId: string | null
  token: string | null
  className?: string
  emptyLabel?: string
}

export function MarkdownPreview({ renderer, host, value, docId, token, className, emptyLabel }: MarkdownPreviewProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref.current) return
    renderer.render(value, ref.current, {
      flavor: 'scrap',
      features: ['gfm', 'highlight'],
      sanitize: true,
      absolute_attachments: true,
      base_origin: host.origin,
      doc_id: docId ?? undefined,
      token: token ?? undefined,
    })
  }, [renderer, value, host.origin, docId, token])

  return <div ref={ref} className={className} data-empty={!value && emptyLabel ? 'true' : undefined}>{!value && emptyLabel ? emptyLabel : null}</div>
}
