import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { Host } from '@refmdio/plugin-sdk'
import type { createMarkdownRenderer, createUploader } from '@refmdio/plugin-sdk'

import type { ComposerTab, RecordItem, ScrapCommentData } from '../types'
import { MarkdownToolbar } from './MarkdownToolbar'
import { MarkdownPreview } from './MarkdownPreview'
import { useMarkdownTextarea } from '../hooks/useMarkdownTextarea'
import { performToolbarAction } from '../utils/markdownToolbar'
import type { ToolbarAction } from '../utils/markdownToolbar'
import { timeAgo } from '../utils/time'
import { parsePinMetadata } from '../utils/pin'
import { Icon } from './Icon'

const COMMENT_ACTIONS: Array<ToolbarAction | 'divider'> = [
  'bold',
  'italic',
  'divider',
  'heading',
  'list',
  'quote',
  'divider',
  'code',
  'link',
]

export type CommentsSectionProps = {
  host: Host
  renderer: ReturnType<typeof createMarkdownRenderer>
  uploader: ReturnType<typeof createUploader>
  docId: string | null
  token: string | null
  comments: Array<RecordItem<ScrapCommentData>>
  draft: string
  tab: ComposerTab
  onDraftChange: (value: string) => void
  onTabChange: (tab: ComposerTab) => void
  onSubmit: () => void | Promise<void>
  open: boolean
}

export function CommentsSection({
  host,
  renderer,
  uploader,
  docId,
  token,
  comments,
  draft,
  tab,
  onDraftChange,
  onTabChange,
  onSubmit,
  open,
}: CommentsSectionProps) {
  const { textareaRef, isDragging, textareaEvents } = useMarkdownTextarea({
    uploader,
    onChange: onDraftChange,
    value: draft,
  })
  const [expanded, setExpanded] = useState(Boolean(draft))

  const textareaClass = useMemo(() => {
    const base = 'w-full min-h-[140px] bg-muted/20 border rounded-md p-2'
    return isDragging ? `${base} dz-active` : base
  }, [isDragging])

  const prevExpandedRef = useRef(expanded)
  const prevTabRef = useRef(tab)

  useEffect(() => {
    if (draft && !expanded) {
      setExpanded(true)
    }
  }, [draft, expanded])

  useEffect(() => {
    if (!open) {
      prevExpandedRef.current = expanded
      prevTabRef.current = tab
      return
    }
    const becameExpanded = expanded && !prevExpandedRef.current
    const switchedToWrite = expanded && tab === 'write' && prevTabRef.current !== 'write'
    if ((becameExpanded || switchedToWrite) && textareaRef.current) {
      const node = textareaRef.current
      node.focus({ preventScroll: true })
      const cursor = node.value.length
      node.setSelectionRange(cursor, cursor)
    }
    prevExpandedRef.current = expanded
    prevTabRef.current = tab
  }, [open, expanded, tab, textareaRef])

  if (!open) {
    return null
  }

  const handleExpand = () => {
    setExpanded(true)
    onTabChange('write')
  }

  const handleCancel = () => {
    onDraftChange('')
    onTabChange('write')
    setExpanded(false)
  }

  const handleSubmit = () => {
    if (!draft.trim() || !docId) return
    const result = onSubmit()
    if (result && typeof (result as Promise<void>).then === 'function') {
      ;(result as Promise<void>)
        .then(() => {
          onDraftChange('')
          onTabChange('write')
          setExpanded(false)
        })
        .catch(() => {})
    } else {
      onDraftChange('')
      onTabChange('write')
      setExpanded(false)
    }
  }

  const commentItems = comments.length
    ? comments.map((comment) => {
        const meta = parsePinMetadata(comment.data?.content ?? '')
        return (
          <div key={comment.id} className="comment">
            <div className="comment-header">
              <div className="meta">
                <div className="avatar">{initial(comment.data?.authorName)}</div>
                <span>{comment.data?.authorName ?? 'User'}</span>
                <span>•</span>
                <span>{timeAgo(comment.updatedAt ?? comment.createdAt ?? null)}</span>
              </div>
            </div>
            <MarkdownPreview
              renderer={renderer}
              host={host}
              value={meta.content}
              docId={docId}
              token={token}
              className="prose prose-sm max-w-none body"
            />
          </div>
        )
      })
    : null

  const composer = !expanded ? (
    <button type="button" className="btn-ghost add-comment" onClick={handleExpand}>
      <Icon name="message" className="h-3 w-3 mr-1" />
      <span>Add comment</span>
    </button>
  ) : (
    <>
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
          disabled={!draft.trim()}
        >
          <Icon name="eye" className="h-3 w-3" />
          <span>Preview</span>
        </button>
      </div>
      {tab === 'write' ? (
        <textarea
          ref={textareaRef}
          placeholder="Enter comment..."
          className={textareaClass}
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={(event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
              event.preventDefault()
              handleSubmit()
            }
          }}
          onPaste={textareaEvents.onPaste}
          onDrop={textareaEvents.onDrop}
          onDragEnter={textareaEvents.onDragEnter}
          onDragLeave={textareaEvents.onDragLeave}
          onDragOver={textareaEvents.onDragOver}
        />
      ) : (
        <MarkdownPreview
          renderer={renderer}
          host={host}
          value={draft}
          docId={docId}
          token={token}
          className="prose prose-sm max-w-none text-muted-foreground"
          emptyLabel="Nothing to preview"
        />
      )}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <MarkdownToolbar
          actions={COMMENT_ACTIONS}
          size="sm"
          iconClassName="h-3 w-3"
          onAction={(action) => {
            if (!textareaRef.current) return
            performToolbarAction(textareaRef.current, action, { onChange: onDraftChange, uploader })
          }}
        />
        <div className="flex items-center gap-2">
          <button type="button" className="btn-ghost" onClick={handleCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="h-7 px-3 rounded-md bg-primary text-primary-foreground"
            onClick={handleSubmit}
            disabled={!draft.trim() || !docId}
          >
            Post
          </button>
        </div>
      </div>
    </>
  )

  return (
    <div className="card-comments">
      {commentItems ? <div className="space-y-2">{commentItems}</div> : null}
      <div className="space-y-2">{composer}</div>
    </div>
  )
}
function initial(name?: string | null) {
  return (name ?? 'U').trim().charAt(0).toUpperCase() || 'U'
}
