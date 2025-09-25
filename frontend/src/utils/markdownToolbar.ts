import type { createUploader } from '@refmdio/plugin-sdk'

export type ToolbarAction =
  | 'bold'
  | 'italic'
  | 'heading'
  | 'quote'
  | 'code'
  | 'link'
  | 'doclink'
  | 'image'
  | 'attach'
  | 'list'
  | 'list-ordered'
  | 'table'
export function uploadResultToMarkdown(result: { url: string; filename: string; contentType?: string | null }) {
  const { url, filename, contentType } = result
  const label = filename.replace(/\]/g, '')
  if (contentType && /^image\//.test(contentType)) {
    return `![${label}](${url})`
  }
  return `[${label}](${url})`
}

export function performToolbarAction(
  textarea: HTMLTextAreaElement,
  action: ToolbarAction,
  options: {
    onChange: (value: string) => void
    uploader: ReturnType<typeof createUploader>
  },
) {
  const wrap = (before: string, after = '') => {
    const start = textarea.selectionStart ?? 0
    const end = textarea.selectionEnd ?? 0
    const value = textarea.value ?? ''
    const selected = value.slice(start, end)
    const insert = before + selected + after
    textarea.value = value.slice(0, start) + insert + value.slice(end)
    textarea.selectionStart = textarea.selectionEnd = start + before.length + selected.length + after.length
    textarea.focus()
    options.onChange(textarea.value)
  }

  const insertPrefix = (prefix: string) => {
    const start = textarea.selectionStart ?? 0
    const value = textarea.value ?? ''
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    textarea.value = value.slice(0, lineStart) + prefix + value.slice(lineStart)
    textarea.selectionStart = textarea.selectionEnd = start + prefix.length
    textarea.focus()
    options.onChange(textarea.value)
  }

  const insertSnippet = (snippet: string) => {
    const value = textarea.value ?? ''
    const needsNL = !value.endsWith('\n')
    textarea.value = value + (needsNL ? '\n' : '') + snippet + '\n'
    textarea.selectionStart = textarea.selectionEnd = textarea.value.length
    textarea.focus()
    options.onChange(textarea.value)
  }

  const uploader = options.uploader

  switch (action) {
    case 'bold':
      wrap('**', '**')
      break
    case 'italic':
      wrap('*', '*')
      break
    case 'heading':
      insertPrefix('# ')
      break
    case 'quote':
      insertPrefix('> ')
      break
    case 'code':
      wrap('`', '`')
      break
    case 'link': {
      const url = typeof prompt === 'function' ? prompt('Enter URL') : ''
      if (url) wrap('[', `](${url})`)
      break
    }
    case 'doclink': {
      const id = typeof prompt === 'function' ? prompt('Document ID to link (e.g. abc-123)') : ''
      if (id) wrap('[[', `${id}]]`)
      break
    }
    case 'image': {
      uploader
        .pickAndUpload('image/*', false, (result) => {
          const label = result.filename.replace(/\]/g, '')
          return `![${label}](${result.url})`
        })
        .then((snippets) => snippets.forEach(insertSnippet))
        .catch(() => {})
      break
    }
    case 'attach': {
      uploader
        .pickAndUpload('*/*', true, uploadResultToMarkdown)
        .then((snippets) => snippets.forEach(insertSnippet))
        .catch(() => {})
      break
    }
    case 'list':
      insertPrefix('- ')
      break
    case 'list-ordered':
      insertPrefix('1. ')
      break
    case 'table':
      insertSnippet('| Column | Column |\n| --- | --- |\n| Cell | Cell |')
      break
    default:
      break
  }
}
