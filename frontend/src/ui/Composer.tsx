import React, { useCallback, useMemo } from 'react'
import type { Host } from '@refmdio/plugin-sdk'
import type { createMarkdownRenderer, createUploader } from '@refmdio/plugin-sdk'

import type { ComposerTab } from '../types'
import { MarkdownToolbar } from './MarkdownToolbar'
import { MarkdownPreview } from './MarkdownPreview'
import { performToolbarAction } from '../utils/markdownToolbar'
import type { ToolbarAction } from '../utils/markdownToolbar'
import { useMarkdownTextarea } from '../hooks/useMarkdownTextarea'
import { Icon } from './Icon'

export type ComposerProps = {
  host: Host
  renderer: ReturnType<typeof createMarkdownRenderer>
  uploader: ReturnType<typeof createUploader>
  value: string
  tab: ComposerTab
  statusMessage: string
  docId: string | null
  token: string | null
  onChange: (value: string) => void
  onTabChange: (tab: ComposerTab) => void
  onSubmit: () => void | Promise<void>
}

const ACTIONS: Array<ToolbarAction | 'divider'> = [
  'bold',
  'italic',
  'divider',
  'heading',
  'list',
  'quote',
  'divider',
  'code',
  'link',
  'doclink',
  'attach',
]

export function Composer({ host, renderer, uploader, value, tab, statusMessage, docId, token, onChange, onTabChange, onSubmit }: ComposerProps) {
  const { textareaRef, isDragging, textareaEvents } = useMarkdownTextarea({ uploader, onChange })

  const handleToolbar = useCallback(
    (action: ToolbarAction) => {
      if (!textareaRef.current) return
      performToolbarAction(textareaRef.current, action, {
        onChange,
        uploader,
      })
    },
    [onChange, uploader],
  )

  const textareaClass = useMemo(() => {
    const base = 'w-full min-h-[280px] bg-muted/20 border rounded-md p-2 focus:outline-none'
    return isDragging ? `${base} dz-active` : base
  }, [isDragging])

  return (
    <div className="card">
      <div className="card-header">
        <div className="tab-group">
          <button
            type="button"
            className={`tab-btn ${tab === 'write' ? 'active' : ''}`}
            onClick={() => onTabChange('write')}
          >
            <Icon name="edit" className="h-3 w-3" />
            <span>Write</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${tab === 'preview' ? 'active' : ''}`}
            onClick={() => onTabChange('preview')}
          >
            <Icon name="eye" className="h-3 w-3" />
            <span>Preview</span>
          </button>
        </div>
        <div className="status-text">{statusMessage}</div>
      </div>
      {tab === 'write' ? (
        <div className="card-body">
          <textarea
            ref={textareaRef}
            placeholder="Enter a new post..."
            className={textareaClass}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                event.preventDefault()
                void onSubmit()
              }
            }}
            onPaste={textareaEvents.onPaste}
            onDrop={textareaEvents.onDrop}
            onDragEnter={textareaEvents.onDragEnter}
            onDragLeave={textareaEvents.onDragLeave}
            onDragOver={textareaEvents.onDragOver}
          />
          <div className="card-footer">
            <MarkdownToolbar actions={ACTIONS} onAction={handleToolbar} size="sm" iconClassName="h-3 w-3" />
            <div className="flex items-center gap-2">
              <span className="hint">Ctrl+Enter to send</span>
              <button className="h-7 px-3 rounded-md bg-primary text-primary-foreground" onClick={() => onSubmit()} disabled={!value.trim() || !docId}>
                Post
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-body card-preview">
          <MarkdownPreview
            renderer={renderer}
            host={host}
            value={value}
            docId={docId}
            token={token}
            className="prose prose-sm prose-neutral dark:prose-invert max-w-none"
            emptyLabel="Nothing to preview"
          />
        </div>
      )}
    </div>
  )
}
