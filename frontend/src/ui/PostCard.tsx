import React from 'react'
import type { Host } from '@refmdio/plugin-sdk'
import type { createMarkdownRenderer, createUploader } from '@refmdio/plugin-sdk'

import type {
  ComposerTab,
  EditDraft,
  RecordItem,
  ScrapCommentData,
  ScrapPostData,
} from '../types'
import { parsePinMetadata } from '../utils/pin'
import { timeAgo } from '../utils/time'
import { MarkdownPreview } from './MarkdownPreview'
import { Icon } from './Icon'
import { CommentsSection } from './CommentsSection'
import { MarkdownToolbar } from './MarkdownToolbar'
import { performToolbarAction } from '../utils/markdownToolbar'
import type { ToolbarAction } from '../utils/markdownToolbar'
import { useMarkdownTextarea } from '../hooks/useMarkdownTextarea'

export type PostCardProps = {
  host: Host
  renderer: ReturnType<typeof createMarkdownRenderer>
  uploader: ReturnType<typeof createUploader>
  post: RecordItem<ScrapPostData>
  comments: Array<RecordItem<ScrapCommentData>>
  docId: string | null
  token: string | null
  editDraft: EditDraft | undefined
  commentsOpen: boolean
  commentDraft: string
  commentTab: ComposerTab
  onToggleComments: (postId: string, open: boolean) => void
  onTogglePin: (post: RecordItem<ScrapPostData>) => void
  onDeletePost: (post: RecordItem<ScrapPostData>) => void
  onBeginEdit: (post: RecordItem<ScrapPostData>) => void
  onCancelEdit: (postId: string) => void
  onUpdateEditDraft: (postId: string, value: string) => void
  onSetEditTab: (postId: string, tab: ComposerTab) => void
  onSaveEdit: (post: RecordItem<ScrapPostData>) => void
  onCommentDraftChange: (postId: string, value: string) => void
  onCommentTabChange: (postId: string, tab: ComposerTab) => void
  onSubmitComment: (post: RecordItem<ScrapPostData>) => void
}

const EDIT_ACTIONS: Array<ToolbarAction | 'divider'> = [
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

export function PostCard({
  host,
  renderer,
  uploader,
  post,
  comments,
  docId,
  token,
  editDraft,
  commentsOpen,
  commentDraft,
  commentTab,
  onToggleComments,
  onTogglePin,
  onDeletePost,
  onBeginEdit,
  onCancelEdit,
  onUpdateEditDraft,
  onSetEditTab,
  onSaveEdit,
  onCommentDraftChange,
  onCommentTabChange,
  onSubmitComment,
}: PostCardProps) {
  const meta = parsePinMetadata(post.data?.content ?? '')
  const editing = Boolean(editDraft)
  const { textareaRef, isDragging, textareaEvents } = useMarkdownTextarea({
    uploader,
    onChange: (value) => onUpdateEditDraft(post.id, value),
    value: editDraft?.draft ?? '',
  })

  const editClass = isDragging
    ? 'w-full min-h-[180px] bg-muted/20 border rounded-md p-2 focus:outline-none dz-active'
    : 'w-full min-h-[180px] bg-muted/20 border rounded-md p-2 focus:outline-none'

  const commentCount = comments.length

  return (
    <div className={`card ${meta.isPinned ? 'pinned' : ''}`}>
      <div className="card-header">
        <div className="meta-block">
          {meta.isPinned ? <Icon name="pin" className="h-4 w-4 text-primary" /> : null}
          <div className="avatar">{initial(post.data?.authorName)}</div>
          <div className="meta-inline">
            <span className="font-medium text-foreground">{post.data?.authorName ?? 'User'}</span>
            <span>{timeAgo(post.updatedAt ?? post.createdAt ?? null)}</span>
          </div>
        </div>
        <div className="card-actions">
          {commentCount > 0 ? (
            <button
              type="button"
              className="btn-ghost compact comment-toggle"
              onClick={() => onToggleComments(post.id, !commentsOpen)}
              title="Toggle comments"
            >
              <Icon name="message" className="h-3 w-3" />
              <span>{commentCount}</span>
            </button>
          ) : null}
          <button
            type="button"
            className={`btn-ghost btn-icon ${meta.isPinned ? 'text-primary' : ''}`}
            onClick={() => onTogglePin(post)}
            title={meta.isPinned ? 'Unpin post' : 'Pin post'}
          >
            <Icon name="pin" className="h-3 w-3" />
          </button>
          <button
            type="button"
            className="btn-ghost btn-icon"
            onClick={() => (editing ? onCancelEdit(post.id) : onBeginEdit(post))}
            title={editing ? 'Cancel edit' : 'Edit post'}
          >
            <Icon name="edit" className="h-3 w-3" />
          </button>
          <button
            type="button"
            className="btn-ghost btn-icon"
            onClick={() => onDeletePost(post)}
            title="Delete post"
          >
            <Icon name="trash" className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div className="card-body">
        {editing && editDraft ? (
          <div className="space-y-2" data-edit="container">
            <div className="flex items-center gap-2 mb-2 tab-group">
              <button
                type="button"
                className={`tab-btn ${editDraft.tab === 'write' ? 'active' : ''}`}
                onClick={() => onSetEditTab(post.id, 'write')}
              >
                <Icon name="edit" className="h-3 w-3" />
                <span>Write</span>
              </button>
              <button
                type="button"
                className={`tab-btn ${editDraft.tab === 'preview' ? 'active' : ''}`}
                onClick={() => onSetEditTab(post.id, 'preview')}
              >
                <Icon name="eye" className="h-3 w-3" />
                <span>Preview</span>
              </button>
            </div>
            {editDraft.tab === 'write' ? (
              <textarea
                ref={textareaRef}
                className={editClass}
                value={editDraft.draft}
                onChange={(event) => onUpdateEditDraft(post.id, event.target.value)}
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
                value={editDraft.draft}
                docId={docId}
                token={token}
                className="prose prose-sm max-w-none"
                emptyLabel="Nothing to preview"
              />
            )}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <MarkdownToolbar
                actions={EDIT_ACTIONS}
                size="sm"
                iconClassName="h-3 w-3"
                onAction={(action) => {
                  if (!textareaRef.current) return
                  performToolbarAction(textareaRef.current, action, {
                    onChange: (value) => onUpdateEditDraft(post.id, value),
                    uploader,
                  })
                }}
              />
              <div className="flex items-center gap-2">
                <button className="btn-ghost" onClick={() => onCancelEdit(post.id)}>
                  Cancel
                </button>
                <button className="h-7 px-3 rounded-md bg-primary text-primary-foreground" onClick={() => onSaveEdit(post)} disabled={!editDraft.draft.trim()}>
                  Save
                </button>
              </div>
            </div>
          </div>
        ) : (
          <MarkdownPreview
            renderer={renderer}
            host={host}
            value={meta.content}
            docId={docId}
            token={token}
            className="prose prose-sm prose-neutral dark:prose-invert max-w-none"
          />
        )}
      </div>
      <CommentsSection
        host={host}
        renderer={renderer}
        uploader={uploader}
        docId={docId}
        token={token}
        comments={comments}
        draft={commentDraft}
        tab={commentTab}
        onDraftChange={(value) => onCommentDraftChange(post.id, value)}
        onTabChange={(value) => onCommentTabChange(post.id, value)}
        onSubmit={() => onSubmitComment(post)}
        open={commentsOpen}
      />
    </div>
  )
}

function initial(name?: string | null) {
  return (name ?? 'U').trim().charAt(0).toUpperCase() || 'U'
}
