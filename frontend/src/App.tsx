import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { Host } from '@refmdio/plugin-sdk'

import { useScrapState } from './hooks/useScrapState'
import { Composer } from './ui/Composer'
import { PostCard } from './ui/PostCard'
import { Sidebar, SidebarContent } from './ui/Sidebar'
import { Icon } from './ui/Icon'
import type { RecordItem, ScrapCommentData, ScrapPostData } from './types'

const COMPACT_BREAKPOINT = 1280

const STYLE = `
.scrap{ height:100%; overflow-y:auto; }
.scrap [data-view="content"]{ white-space: normal; }
.scrap [data-view="content"] h1,
.scrap [data-view="content"] h2,
.scrap [data-view="content"] h3,
.scrap [data-view="content"] h4,
.scrap [data-view="content"] h5,
.scrap [data-view="content"] h6,
.scrap [data-view="content"] p,
.scrap [data-view="content"] ul,
.scrap [data-view="content"] ol,
.scrap [data-view="content"] li,
.scrap [data-view="content"] pre,
.scrap [data-view="content"] blockquote,
.scrap [data-view="content"] table { display:block; }
.scrap [data-view="content"] > *{ margin: .4rem 0; }
.scrap .toolbar-btn{ height:1.75rem; width:1.75rem; display:inline-flex; align-items:center; justify-content:center; border-radius:.375rem }
.scrap .toolbar-btn:hover{ background-color: var(--accent-400, rgba(120,120,120,.12)); }
.scrap .tab-btn{ padding:0.35rem 0.65rem; border-radius:0.5rem; display:inline-flex; align-items:center; gap:0.35rem; font-size:0.75rem; border:1px solid transparent; color: var(--muted-foreground,#666); transition: background-color .2s ease, border-color .2s ease, color .2s ease; }
.scrap .tab-btn svg{ flex-shrink:0 }
.scrap .tab-btn:hover{ background: color-mix(in srgb, var(--primary) 12%, transparent); border-color: color-mix(in srgb, var(--primary) 28%, transparent); color: var(--primary,#3b82f6); }
.scrap .tab-btn.active{ background: color-mix(in srgb, var(--primary) 18%, transparent); border-color: color-mix(in srgb, var(--primary) 45%, transparent); color: var(--primary,#3b82f6); box-shadow: 0 0 0 1px color-mix(in srgb, var(--primary) 30%, transparent) inset; }
.scrap .tab-group .tab-btn{ margin-right:0.25rem; }
.scrap .comment{ border-left: 4px solid var(--border, rgba(120,120,120,.20)); padding-left: 1rem; margin: .25rem 0; }
.scrap .comment .comment-header{ display:flex; align-items:center; justify-content:space-between; margin-bottom:.25rem; }
.scrap .comment .meta{ display:flex; align-items:center; gap:.5rem; color: var(--muted-foreground,#666); font-size:.75rem; }
.scrap .comment .avatar{ height:1.25rem; width:1.25rem; border-radius: 9999px; background: var(--muted,#eee); display:flex; align-items:center; justify-content:center; font-size:.625rem; }
.scrap textarea{ font-family: inherit; }
.scrap textarea.dz-active{ outline: 2px dashed var(--primary, #3b82f6); outline-offset: 2px; background-color: rgba(59,130,246,0.06); }
.scrap .tag{ padding: 0.25rem 0.5rem; border-radius: 999px; border: 1px solid var(--border, rgba(120,120,120,.18)); font-size: 0.75rem; display: inline-flex; gap: 0.5rem; align-items: center; transition: background-color .2s ease, border-color .2s ease, color .2s ease; }
.scrap .tag.active{ background: color-mix(in srgb, var(--primary) 18%, transparent); border-color: color-mix(in srgb, var(--primary) 55%, transparent); color: var(--primary); }
.scrap .tag.active svg{ color: var(--primary); }
.scrap .card{ background: var(--card,#fff); border: 1px solid var(--border, rgba(120,120,120,.14)); border-radius: 0.75rem; padding: 0.75rem; box-shadow: none; transition: background-color .2s ease, border-color .2s ease, box-shadow .2s ease; }
.scrap .card.pinned{ background: color-mix(in srgb, var(--primary) 12%, transparent); border-color: color-mix(in srgb, var(--primary) 45%, transparent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary) 18%, transparent); }
.scrap .card.pinned .btn-icon,
.scrap .card.pinned .btn-ghost{ color: var(--primary); }
@media (min-width: 640px){ .scrap .card{ padding: 1rem; } }
.scrap .card-header{ display:flex; align-items:center; justify-content:space-between; gap:0.75rem; margin-bottom:0.75rem; }
.scrap .card-header .tab-group{ display:flex; align-items:center; gap:0.5rem; }
.scrap .card-header .status-text{ color: var(--muted-foreground,#666); font-size: 0.75rem; min-height:1rem; }
.scrap .card-body{ display:flex; flex-direction:column; gap:0.75rem; }
.scrap .card-footer{ display:flex; align-items:center; justify-content:space-between; gap:0.75rem; font-size:0.75rem; color:var(--muted-foreground,#666); }
.scrap .card-footer .hint{ display:none; }
@media (min-width: 640px){ .scrap .card-footer .hint{ display:inline; } }
.scrap .btn-ghost{ background: transparent; color: inherit; border: none; cursor:pointer; border-radius: 0.5rem; padding: 0.35rem 0.5rem; height:1.75rem; display:inline-flex; align-items:center; gap:0.35rem; font-size:0.75rem; }
.scrap .btn-ghost:hover{ background: rgba(120,120,120,0.12); color: var(--foreground,#111); }
.scrap .btn-ghost.compact{ padding:0 0.5rem; }
.scrap .btn-icon{ width:1.75rem; justify-content:center; }
.scrap .meta-block{ display:flex; align-items:center; gap:0.5rem; color: var(--muted-foreground,#666); font-size:0.75rem; }
.scrap .sidebar-panel{ width:18rem; flex-shrink:0; }
.scrap .tags-list{ display:flex; flex-wrap:wrap; gap:0.5rem; width:100%; }
.scrap .meta-block .avatar{ height:2rem; width:2rem; border-radius:999px; background: var(--muted,#eee); display:flex; align-items:center; justify-content:center; font-size:0.875rem; font-weight:600; }
.scrap .meta-inline{ display:flex; align-items:center; gap:0.5rem; font-size:0.75rem; color: var(--muted-foreground,#666); }
.scrap .meta-inline span{ display:flex; align-items:center; gap:0.25rem; }
.scrap .comment-toggle{ display:inline-flex; align-items:center; gap:0.35rem; font-size:0.75rem; }
.scrap .card-preview{ color: var(--muted-foreground,#666); }
.scrap .card-actions{ display:flex; align-items:center; gap:0.35rem; }
.scrap .btn-ghost.btn-icon{ height:1.75rem; width:1.75rem; padding:0; justify-content:center; }
.scrap .toolbar-divider{ width:1px; height:1.25rem; background: var(--border, rgba(120,120,120,.18)); margin:0 0.5rem; }
.scrap .toolbar-btn-sm{ height:1.5rem; width:1.5rem; }
.scrap .card-comments{ border-top:1px solid var(--border, rgba(120,120,120,.18)); margin-top:0.75rem; padding-top:0.75rem; display:flex; flex-direction:column; gap:0.75rem; }
.scrap .card-comments .add-comment{ color: var(--muted-foreground,#666); font-size:0.75rem; }
.scrap .card-comments .add-comment:hover{ color: var(--foreground,#111); }
`

export function App({ host }: { host: Host }) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [isCompact, setIsCompact] = useState(true)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const {
    renderer,
    uploader,
    state,
    filteredPosts,
    tagCloud,
    setComposer,
    setComposerTab,
    submitComposer,
    toggleSort,
    setSearch,
    toggleTag,
    togglePin,
    deletePost,
    beginEdit,
    cancelEdit,
    updateEditDraft,
    setEditTab,
    saveEdit,
    setCommentsOpen,
    setCommentDraft,
    setCommentTab,
    submitComment,
  } = useScrapState(host)

  const commentsByPost = useMemo(() => {
    const map = new Map<string, Array<RecordItem<ScrapCommentData>>>()
    for (const comment of state.comments) {
      const postId = comment.data?.postId
      if (!postId) continue
      if (!map.has(postId)) {
        map.set(postId, [])
      }
      map.get(postId)!.push(comment)
    }
    return map
  }, [state.comments])

  const docId = state.docId ?? null
  const token = state.token ?? null

  useEffect(() => {
    if (typeof window === 'undefined') return
    const element = containerRef.current
    if (!element) return

    const updateCompact = () => {
      const width = element.getBoundingClientRect().width
      setIsCompact(width < COMPACT_BREAKPOINT)
    }

    updateCompact()

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateCompact)
      observer.observe(element)
      return () => observer.disconnect()
    }

    const handleResize = () => updateCompact()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!isCompact) {
      setFiltersOpen(false)
    }
  }, [isCompact])

  const postCountLabel = `${filteredPosts.length} ${filteredPosts.length === 1 ? 'post' : 'posts'}`
  const activeFiltersCount = state.filters.tags.length + (state.filters.search ? 1 : 0)
  const sortLabel = state.filters.desc ? 'Newest first' : 'Oldest first'
  const sortArrow = state.filters.desc ? '↓' : '↑'

  return (
    <>
      <div className="h-full w-full scrap">
        <div ref={containerRef} className="h-full w-full">
          <style>{STYLE}</style>
          <div className="max-w-6xl mx-auto w-full p-3 sm:p-6 text-sm">
            <div className="flex gap-6 items-start">
              <div className="flex-1 min-w-0 space-y-4">
                <Composer
                  host={host}
                  renderer={renderer}
                  uploader={uploader}
                  value={state.composer}
                  tab={state.composerTab}
                  statusMessage={state.statusMessage}
                  docId={docId}
                  token={token}
                  onChange={setComposer}
                  onTabChange={setComposerTab}
                  onSubmit={submitComposer}
                />
                <div className="flex items-center justify-between px-1">
                  <div className="text-muted-foreground">{postCountLabel}</div>
                  <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-1.5 text-primary hover:underline whitespace-nowrap" onClick={toggleSort}>
                      <span aria-hidden="true" className="inline-flex items-center justify-center text-base leading-none">
                        {sortArrow}
                      </span>
                      <span>{sortLabel}</span>
                    </button>
                    {isCompact ? (
                      <button
                        type="button"
                        className={`inline-flex items-center gap-1.5 text-primary hover:underline whitespace-nowrap ${filtersOpen ? 'font-semibold' : ''}`}
                        onClick={() => setFiltersOpen((prev) => !prev)}
                        aria-expanded={filtersOpen}
                        aria-controls="scrap-mobile-filters"
                      >
                        <Icon name="search" className="h-3.5 w-3.5" />
                        <span>
                          Filters{activeFiltersCount ? ` (${activeFiltersCount})` : ''}
                        </span>
                      </button>
                    ) : null}
                  </div>
                </div>
                {isCompact && filtersOpen ? (
                  <div id="scrap-mobile-filters" className="px-1">
                    <div className="card">
                      <div className="space-y-4">
                        <SidebarContent
                          filters={state.filters}
                          onSearchChange={setSearch}
                          onToggleTag={toggleTag}
                          tagCloud={tagCloud}
                          filteredCount={filteredPosts.length}
                          totalCount={state.posts.length}
                        />
                        {activeFiltersCount ? (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                            onClick={() => {
                              setSearch('')
                              const activeTags = [...state.filters.tags]
                              for (const tag of activeTags) {
                                toggleTag(tag)
                              }
                            }}
                          >
                            Clear filters
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : null}

              {filteredPosts.length ? (
                <div className="space-y-4">
                  {filteredPosts.map((post) => {
                      const comments = commentsByPost.get(post.id) ?? []
                      const explicitOpen = state.openComments[post.id]
                      const commentsOpen = explicitOpen ?? true
                      return (
                        <PostCard
                          key={post.id}
                          host={host}
                          renderer={renderer}
                          uploader={uploader}
                          post={post}
                          comments={comments}
                          docId={docId}
                          token={token}
                          editDraft={state.editDrafts[post.id]}
                          commentsOpen={commentsOpen}
                          commentDraft={state.commentDrafts[post.id] ?? ''}
                          commentTab={state.commentTabs[post.id] ?? 'write'}
                          onToggleComments={setCommentsOpen}
                          onTogglePin={togglePin}
                          onDeletePost={deletePost}
                          onBeginEdit={beginEdit}
                          onCancelEdit={cancelEdit}
                          onUpdateEditDraft={updateEditDraft}
                          onSetEditTab={setEditTab}
                          onSaveEdit={saveEdit}
                          onCommentDraftChange={setCommentDraft}
                          onCommentTabChange={setCommentTab}
                          onSubmitComment={submitComment}
                        />
                      )
                    })}
                  </div>
                ) : (
                  <div className="mt-2 space-y-4 text-xs text-muted-foreground">
                    {state.filters.tags.length || state.filters.search ? 'No posts match your filters' : 'No posts yet'}
                  </div>
                )}
              </div>

              {!isCompact ? (
                <div className="sidebar-panel">
                  <Sidebar
                    filters={state.filters}
                    onSearchChange={setSearch}
                    onToggleTag={toggleTag}
                    tagCloud={tagCloud}
                    filteredCount={filteredPosts.length}
                    totalCount={state.posts.length}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
