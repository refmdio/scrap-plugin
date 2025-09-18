import { useCallback, useRef, useState } from 'react'
import type React from 'react'
import type { createUploader } from '@refmdio/plugin-sdk'

import { uploadResultToMarkdown } from '../utils/markdownToolbar'

export type MarkdownTextareaOptions = {
  uploader: ReturnType<typeof createUploader>
  onChange: (value: string) => void
}

export function useMarkdownTextarea({ uploader, onChange }: MarkdownTextareaOptions) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const dragDepth = useRef(0)
  const [isDragging, setIsDragging] = useState(false)

  const appendSnippets = useCallback(
    (snippets: string[]) => {
      if (!snippets.length) return
      const textarea = textareaRef.current
      if (!textarea) return
      const current = textarea.value ?? ''
      const needsNL = current && !current.endsWith('\n') ? '\n' : ''
      const joined = snippets.join('\n')
      const nextValue = `${current}${needsNL}${joined}\n`
      textarea.value = nextValue
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length
      onChange(nextValue)
    },
    [onChange],
  )

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      if (!files || files.length === 0) return
      const list = Array.isArray(files) ? files : Array.from(files)
      try {
        const results = await uploader.uploadFiles(list, uploadResultToMarkdown)
        const snippets = results.map(uploadResultToMarkdown)
        appendSnippets(snippets)
      } catch (err) {
        console.error('[scrap] upload failed', err)
      }
    },
    [appendSnippets, uploader],
  )

  const onPaste = useCallback(
    (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const files = event.clipboardData?.files
      if (files && files.length > 0) {
        event.preventDefault()
        void handleFiles(files)
      }
    },
    [handleFiles],
  )

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLTextAreaElement>) => {
      event.preventDefault()
      dragDepth.current = 0
      setIsDragging(false)
      const files = event.dataTransfer?.files
      if (files && files.length > 0) {
        void handleFiles(files)
      }
    },
    [handleFiles],
  )

  const onDragEnter = useCallback((event: React.DragEvent<HTMLTextAreaElement>) => {
    event.preventDefault()
    dragDepth.current += 1
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((event: React.DragEvent<HTMLTextAreaElement>) => {
    event.preventDefault()
    dragDepth.current = Math.max(0, dragDepth.current - 1)
    if (dragDepth.current === 0) setIsDragging(false)
  }, [])

  const onDragOver = useCallback((event: React.DragEvent<HTMLTextAreaElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }, [])

  return {
    textareaRef,
    isDragging,
    appendSnippets,
    handleFiles,
    textareaEvents: {
      onPaste,
      onDrop,
      onDragEnter,
      onDragLeave,
      onDragOver,
    },
  }
}
