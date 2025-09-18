import React from 'react'

import { Icon } from './Icon'
import type { IconName } from './Icon'
import type { ToolbarAction } from '../utils/markdownToolbar'

const LABELS: Record<ToolbarAction, string> = {
  bold: 'Bold',
  italic: 'Italic',
  heading: 'Heading',
  quote: 'Quote',
  code: 'Code',
  link: 'Link',
  doclink: 'Document link',
  image: 'Image',
  attach: 'Attach files',
  list: 'Bullet list',
  'list-ordered': 'Numbered list',
  table: 'Table',
}

const ICONS: Record<ToolbarAction, IconName> = {
  bold: 'bold',
  italic: 'italic',
  heading: 'heading',
  quote: 'quote',
  code: 'code',
  link: 'link',
  doclink: 'file-text',
  image: 'image',
  attach: 'paperclip',
  list: 'list',
  'list-ordered': 'list-ordered',
  table: 'table',
}

export type MarkdownToolbarProps = {
  actions: Array<ToolbarAction | 'divider'>
  onAction: (action: ToolbarAction) => void
  size?: 'sm' | 'md'
  className?: string
  iconClassName?: string
}

export function MarkdownToolbar({ actions, onAction, size = 'md', className, iconClassName }: MarkdownToolbarProps) {
  const isSmall = size === 'sm'
  const buttonCls = `toolbar-btn${isSmall ? ' toolbar-btn-sm' : ''}`
  const iconCls = iconClassName ?? (isSmall ? 'h-3 w-3' : 'h-3 w-3')

  return (
    <div className={`flex items-center gap-1 text-xs text-muted-foreground ${className ?? ''}`.trim()}>
      {actions.map((item, index) => {
        if (item === 'divider') {
          return <span key={`divider-${index}`} className="toolbar-divider" />
        }
        return (
          <button
            key={item}
            type="button"
            className={buttonCls}
            title={LABELS[item]}
            onClick={(event) => {
              event.preventDefault()
              onAction(item)
            }}
          >
            <Icon name={ICONS[item]} className={iconCls} />
          </button>
        )
      })}
    </div>
  )
}
