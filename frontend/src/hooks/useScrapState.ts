import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Host } from '@refmdio/plugin-sdk'
import { createHostContext, createMarkdownRenderer, createRecordStore, createUploader } from '@refmdio/plugin-sdk'

import { resolveIdentity } from '../services/identity'
import { addPinMetadata, parsePinMetadata, removePinMetadata } from '../utils/pin'
import { aggregateTags, extractTags } from '../utils/tags'
import type {
  ComposerTab,
  FiltersState,
  RecordItem,
  ScrapCommentData,
  ScrapPostData,
  ScrapState,
} from '../types'

export const INITIAL_FILTERS: FiltersState = { search: '', tags: [], desc: true }

export type ScrapStateContext = {
  context: ReturnType<typeof createHostContext>
  renderer: ReturnType<typeof createMarkdownRenderer>
  uploader: ReturnType<typeof createUploader>
  postsStore: ReturnType<typeof createRecordStore>
  commentsStore: ReturnType<typeof createRecordStore>
  state: ScrapState
  filteredPosts: Array<RecordItem<ScrapPostData>>
  tagCloud: Array<[string, number]>
  setComposer: (value: string) => void
  setComposerTab: (tab: ComposerTab) => void
  submitComposer: () => Promise<void>
  toggleSort: () => void
  setSearch: (value: string) => void
  toggleTag: (tag: string) => void
  togglePin: (post: RecordItem<ScrapPostData>) => Promise<void>
  deletePost: (post: RecordItem<ScrapPostData>) => Promise<void>
  beginEdit: (post: RecordItem<ScrapPostData>) => void
  cancelEdit: (postId: string) => void
  updateEditDraft: (postId: string, value: string) => void
  setEditTab: (postId: string, tab: ComposerTab) => void
  saveEdit: (post: RecordItem<ScrapPostData>) => Promise<void>
  setCommentsOpen: (postId: string, open: boolean) => void
  setCommentDraft: (postId: string, value: string) => void
  setCommentTab: (postId: string, tab: ComposerTab) => void
  submitComment: (post: RecordItem<ScrapPostData>) => Promise<void>
  refreshStores: () => Promise<void>
}

export function useScrapState(host: Host): ScrapStateContext {
  const context = useMemo(() => createHostContext(host, { pluginId: 'scrap' }), [host])
  const renderer = useMemo(() => createMarkdownRenderer(host), [host])

  const [state, setState] = useState<ScrapState>({
    docId: context.docId,
    token: context.token,
    identity: null,
    posts: [],
    comments: [],
    loading: false,
    statusMessage: '',
    filters: INITIAL_FILTERS,
    composer: '',
    composerTab: 'write',
    commentDrafts: {},
    commentTabs: {},
    openComments: {},
    editDrafts: {},
  })

  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    setState((prev) => ({ ...prev, docId: context.docId, token: context.token }))
  }, [context.docId, context.token])

  const docIdRef = useRef(state.docId)
  const tokenRef = useRef(state.token)
  useEffect(() => {
    docIdRef.current = state.docId ?? context.docId
    tokenRef.current = state.token ?? context.token
  }, [state.docId, state.token, context.docId, context.token])

  const uploader = useMemo(
    () =>
      createUploader({
        context,
        onStatus: (status) => {
          const message =
            status === 'uploading'
              ? 'Uploading…'
              : status === 'success'
                ? 'Uploaded'
                : status === 'error'
                  ? 'Upload failed'
                  : ''
          setState((prev) => ({ ...prev, statusMessage: message }))
        },
      }),
    [context],
  )

  const postsStore = useMemo(
    () =>
      createRecordStore<ScrapPostData>({
        context,
        kind: 'post',
        docId: () => docIdRef.current ?? context.docId,
        token: () => tokenRef.current ?? context.token,
      }),
    [context],
  )

  const commentsStore = useMemo(
    () =>
      createRecordStore<ScrapCommentData>({
        context,
        kind: 'comment',
        docId: () => docIdRef.current ?? context.docId,
        token: () => tokenRef.current ?? context.token,
      }),
    [context],
  )

  useEffect(() => {
    let mounted = true
    resolveIdentity(host).then((identity) => {
      if (mounted) {
        setState((prev) => ({ ...prev, identity }))
      }
    })
    return () => {
      mounted = false
    }
  }, [host])

  useEffect(() => {
    const unsubscribePosts = postsStore.subscribe((items) => {
      setState((prev) => ({ ...prev, posts: items }))
    })
    const unsubscribeComments = commentsStore.subscribe((items) => {
      setState((prev) => ({ ...prev, comments: items }))
    })
    return () => {
      unsubscribePosts()
      unsubscribeComments()
    }
  }, [postsStore, commentsStore])

  const refreshStores = useCallback(async () => {
    if (!stateRef.current.docId) return
    setState((prev) => ({ ...prev, loading: true, statusMessage: '' }))
    try {
      await Promise.all([postsStore.list(), commentsStore.list()])
    } catch (err) {
      console.error('[scrap] failed to refresh stores', err)
      setState((prev) => ({ ...prev, statusMessage: 'Failed to load data' }))
    } finally {
      setState((prev) => ({ ...prev, loading: false }))
    }
  }, [postsStore, commentsStore])

  useEffect(() => {
    refreshStores()
  }, [refreshStores])

  const setComposer = useCallback((value: string) => {
    setState((prev) => ({ ...prev, composer: value }))
  }, [])

  const setComposerTab = useCallback((tab: ComposerTab) => {
    setState((prev) => ({ ...prev, composerTab: tab }))
  }, [])

  const submitComposer = useCallback(async () => {
    const value = stateRef.current.composer.trim()
    const docId = stateRef.current.docId
    if (!value || !docId) return
    setState((prev) => ({ ...prev, statusMessage: 'Posting…' }))
    try {
      await context.execAction('scrap.create_record', {
        docId,
        kind: 'post',
        data: {
          content: value,
          authorId: stateRef.current.identity?.id,
          authorName: stateRef.current.identity?.name,
        } satisfies ScrapPostData,
      })
      setState((prev) => ({ ...prev, composer: '', composerTab: 'write', statusMessage: 'Posted' }))
      await postsStore.list()
    } catch (err) {
      console.error('[scrap] create post failed', err)
      setState((prev) => ({ ...prev, statusMessage: 'Post failed' }))
    }
  }, [context, postsStore])

  const toggleSort = useCallback(() => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, desc: !prev.filters.desc },
    }))
  }, [])

  const setSearch = useCallback((value: string) => {
    setState((prev) => ({ ...prev, filters: { ...prev.filters, search: value } }))
  }, [])

  const toggleTag = useCallback((tag: string) => {
    setState((prev) => {
      const active = prev.filters.tags.includes(tag)
      return {
        ...prev,
        filters: {
          ...prev.filters,
          tags: active ? prev.filters.tags.filter((t) => t !== tag) : [...prev.filters.tags, tag],
        },
      }
    })
  }, [])

  const togglePin = useCallback(
    async (post: RecordItem<ScrapPostData>) => {
      const meta = parsePinMetadata(post.data?.content ?? '')
      const nextContent = meta.isPinned
        ? removePinMetadata(post.data?.content ?? '')
        : addPinMetadata(post.data?.content ?? '', stateRef.current.identity?.id ?? 'user')
      try {
        await context.execAction('scrap.update_record', {
          id: post.id,
          patch: { content: nextContent, pinned: !meta.isPinned },
        })
        await postsStore.list()
      } catch (err) {
        console.error('[scrap] pin toggle failed', err)
        setState((prev) => ({ ...prev, statusMessage: 'Failed to toggle pin' }))
      }
    },
    [context, postsStore],
  )

  const deletePost = useCallback(
    async (post: RecordItem<ScrapPostData>) => {
      if (typeof confirm === 'function' && !confirm('Delete post?')) return
      try {
        await context.execAction('scrap.delete_record', { id: post.id })
        await postsStore.list()
      } catch (err) {
        console.error('[scrap] delete failed', err)
        setState((prev) => ({ ...prev, statusMessage: 'Failed to delete post' }))
      }
    },
    [context, postsStore],
  )

  const beginEdit = useCallback((post: RecordItem<ScrapPostData>) => {
    const meta = parsePinMetadata(post.data?.content ?? '')
    setState((prev) => ({
      ...prev,
      editDrafts: { ...prev.editDrafts, [post.id]: { draft: meta.content, tab: 'write' } },
    }))
  }, [])

  const cancelEdit = useCallback((postId: string) => {
    setState((prev) => {
      const next = { ...prev.editDrafts }
      delete next[postId]
      return { ...prev, editDrafts: next }
    })
  }, [])

  const updateEditDraft = useCallback((postId: string, value: string) => {
    setState((prev) => {
      const entry = prev.editDrafts[postId]
      if (!entry) return prev
      return {
        ...prev,
        editDrafts: { ...prev.editDrafts, [postId]: { ...entry, draft: value } },
      }
    })
  }, [])

  const setEditTab = useCallback((postId: string, tab: ComposerTab) => {
    setState((prev) => {
      const entry = prev.editDrafts[postId]
      if (!entry) return prev
      return {
        ...prev,
        editDrafts: { ...prev.editDrafts, [postId]: { ...entry, tab } },
      }
    })
  }, [])

  const saveEdit = useCallback(
    async (post: RecordItem<ScrapPostData>) => {
      const entry = stateRef.current.editDrafts[post.id]
      if (!entry) return
      const next = entry.draft.trim()
      if (!next) {
        cancelEdit(post.id)
        return
      }
      const meta = parsePinMetadata(post.data?.content ?? '')
      const patched = meta.isPinned && meta.pinnedBy ? addPinMetadata(next, meta.pinnedBy) : next
      try {
        await context.execAction('scrap.update_record', { id: post.id, patch: { content: patched } })
        await postsStore.list()
        cancelEdit(post.id)
      } catch (err) {
        console.error('[scrap] update failed', err)
        setState((prev) => ({ ...prev, statusMessage: 'Failed to update post' }))
      }
    },
    [context, postsStore, cancelEdit],
  )

  const setCommentsOpen = useCallback((postId: string, open: boolean) => {
    setState((prev) => ({
      ...prev,
      openComments: { ...prev.openComments, [postId]: open },
    }))
  }, [])

  const setCommentDraft = useCallback((postId: string, value: string) => {
    setState((prev) => ({
      ...prev,
      commentDrafts: { ...prev.commentDrafts, [postId]: value },
    }))
  }, [])

  const setCommentTab = useCallback((postId: string, tab: ComposerTab) => {
    setState((prev) => ({
      ...prev,
      commentTabs: { ...prev.commentTabs, [postId]: tab },
    }))
  }, [])

  const submitComment = useCallback(
    async (post: RecordItem<ScrapPostData>) => {
      const draft = stateRef.current.commentDrafts[post.id]?.trim()
      const docId = stateRef.current.docId
      if (!draft || !docId) return
      try {
        await context.execAction('scrap.create_record', {
          docId,
          kind: 'comment',
          data: {
            postId: post.id,
            content: draft,
            authorId: stateRef.current.identity?.id,
            authorName: stateRef.current.identity?.name,
          } satisfies ScrapCommentData,
        })
        setState((prev) => ({
          ...prev,
          commentDrafts: { ...prev.commentDrafts, [post.id]: '' },
          commentTabs: { ...prev.commentTabs, [post.id]: 'write' },
        }))
        await commentsStore.list()
      } catch (err) {
        console.error('[scrap] comment failed', err)
        setState((prev) => ({ ...prev, statusMessage: 'Failed to add comment' }))
      }
    },
    [context, commentsStore],
  )

  const filteredPosts = useMemo(() => {
    const sorted = state.posts.slice().sort((a, b) => {
      const metaA = parsePinMetadata(a.data?.content ?? '')
      const metaB = parsePinMetadata(b.data?.content ?? '')
      if (metaA.isPinned !== metaB.isPinned) {
        return metaA.isPinned ? -1 : 1
      }
      const ta = new Date(a.createdAt ?? a.updatedAt ?? 0).getTime()
      const tb = new Date(b.createdAt ?? b.updatedAt ?? 0).getTime()
      return state.filters.desc ? tb - ta : ta - tb
    })
    if (!state.filters.search && !state.filters.tags.length) return sorted
    const searchLower = state.filters.search.toLowerCase()
    return sorted.filter((post) => {
      const meta = parsePinMetadata(post.data?.content ?? '')
      const content = meta.content.toLowerCase()
      const matchesSearch = !state.filters.search || content.includes(searchLower)
      const tags = extractTags(meta.content).map((tag) => tag.toLowerCase())
      const matchesTags = !state.filters.tags.length || state.filters.tags.some((tag) => tags.includes(tag.toLowerCase()))
      return matchesSearch && matchesTags
    })
  }, [state.posts, state.filters])

  const tagCloud = useMemo(() => aggregateTags(state.posts), [state.posts])

  return {
    context,
    renderer,
    uploader,
    postsStore,
    commentsStore,
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
    refreshStores,
  }
}
