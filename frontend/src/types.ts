export type ScrapPostData = {
  content: string
  pinned?: boolean
  authorId?: string
  authorName?: string
}

export type ScrapCommentData = {
  postId: string
  content: string
  authorId?: string
  authorName?: string
}

export type RecordItem<T> = {
  id: string
  data: T
  createdAt?: string
  updatedAt?: string
  [key: string]: any
}

export type Identity = {
  id: string
  name: string
}

export type FiltersState = {
  search: string
  tags: string[]
  desc: boolean
}

export type ComposerTab = 'write' | 'preview'

export type EditDraft = {
  draft: string
  tab: ComposerTab
}

export type ScrapState = {
  docId: string | null
  token: string | null
  identity: Identity | null
  posts: Array<RecordItem<ScrapPostData>>
  comments: Array<RecordItem<ScrapCommentData>>
  loading: boolean
  statusMessage: string
  filters: FiltersState
  composer: string
  composerTab: ComposerTab
  commentDrafts: Record<string, string>
  commentTabs: Record<string, ComposerTab>
  openComments: Record<string, boolean>
  editDrafts: Record<string, EditDraft>
}
