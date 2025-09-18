import React from 'react'

export type IconName =
  | 'arrow-down'
  | 'arrow-up'
  | 'bold'
  | 'italic'
  | 'heading'
  | 'quote'
  | 'code'
  | 'link'
  | 'doclink'
  | 'image'
  | 'paperclip'
  | 'file-text'
  | 'list'
  | 'list-ordered'
  | 'table'
  | 'message'
  | 'pin'
  | 'edit'
  | 'trash'
  | 'search'
  | 'x'
  | 'eye'
  | 'hash'
  | 'share'

const paths: Record<IconName, React.ReactNode> = {
  'arrow-down': (
    <>
      <path d="M12 5v14" />
      <path d="M6 13l6 6 6-6" />
    </>
  ),
  'arrow-up': (
    <>
      <path d="M12 19V5" />
      <path d="M6 11l6-6 6 6" />
    </>
  ),
  bold: (
    <>
      <path d="M7 5h7a3 3 0 010 6H7z" />
      <path d="M7 11h8a3 3 0 010 6H7z" />
    </>
  ),
  italic: (
    <>
      <path d="M19 4h-9" />
      <path d="M14 20H5" />
      <path d="M15 4L9 20" />
    </>
  ),
  heading: (
    <>
      <path d="M6 4v16" />
      <path d="M18 4v16" />
      <path d="M6 12h12" />
    </>
  ),
  quote: (
    <>
      <path d="M6 17h3l2-5V7H5v5h3z" />
      <path d="M14 17h3l2-5V7h-6v5h3z" />
    </>
  ),
  code: (
    <>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </>
  ),
  link: (
    <>
      <path d="M10 13a5 5 0 007.07 0l1.17-1.17a5 5 0 10-7.07-7.07L10 5" />
      <path d="M14 11a5 5 0 01-7.07 0L5.76 9.83a5 5 0 017.07-7.07L14 5" />
    </>
  ),
  doclink: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="m16 11 2 2 4-4" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="M21 15l-5-5L5 21" />
    </>
  ),
  paperclip: (
    <path d="M21.44 11.05l-8.49 8.49a6 6 0 0 1-8.49-8.49l8.49-8.49a4 4 0 1 1 5.66 5.66l-8.49 8.49a2 2 0 1 1-2.83-2.83l7.78-7.78" />
  ),
  'file-text': (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </>
  ),
  list: (
    <>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <circle cx="4" cy="6" r="1" />
      <circle cx="4" cy="12" r="1" />
      <circle cx="4" cy="18" r="1" />
    </>
  ),
  'list-ordered': (
    <>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <path d="M4 19h2l-2 2h2" />
      <path d="M6 6H4V4h2" />
      <path d="M5 12h1" />
    </>
  ),
  table: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18" />
      <path d="M9 5v14" />
    </>
  ),
  message: <path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z" />,
  pin: <path d="M16 3l-1.5 5.5L20 10l-6 2-2 9-2-9-6-2 5.5-1.5L10 3z" />,
  edit: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5l4 4-11 11-4 1 1-4z" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </>
  ),
  x: (
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>
  ),
  eye: (
    <>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  hash: (
    <>
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
      <line x1="3" y1="10" x2="21" y2="8" />
      <line x1="3" y1="16" x2="21" y2="14" />
    </>
  ),
  share: (
    <>
      <path d="M4 12v5a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-5" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </>
  ),
}

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      className={className ?? 'h-4 w-4'}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}
