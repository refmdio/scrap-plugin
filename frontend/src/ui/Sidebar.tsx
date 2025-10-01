import React from 'react'

import type { FiltersState } from '../types'
import { Icon } from './Icon'

export type SidebarProps = {
  filters: FiltersState
  onSearchChange: (value: string) => void
  onToggleTag: (tag: string) => void
  tagCloud: Array<[string, number]>
  filteredCount: number
  totalCount: number
}

export function SidebarContent({ filters, onSearchChange, onToggleTag, tagCloud, filteredCount, totalCount }: SidebarProps) {
  const anyFilters = Boolean(filters.search || filters.tags.length)
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="sidebar-title">Search</div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search memos..."
            className="w-full bg-transparent border rounded-md pl-8 pr-8 py-1.5"
            value={filters.search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Icon name="search" className="h-4 w-4" />
          </span>
          <button
            type="button"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
            title="Clear"
            onClick={() => onSearchChange('')}
            disabled={!filters.search}
          >
            <Icon name="x" className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="sidebar-title">Tags</div>
        <div className="tags-list flex flex-wrap gap-2" data-id="tags">
          {tagCloud.length ? (
            tagCloud.map(([tag, count]) => (
              <button
                key={tag}
                type="button"
                className={`tag ${filters.tags.includes(tag) ? 'active' : ''}`}
                onClick={() => onToggleTag(tag)}
              >
                <Icon name="hash" className="h-3 w-3 text-muted-foreground" />
                <span>{tag}</span>
                <span className="text-xs text-muted-foreground">{count}</span>
              </button>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">No tags</span>
          )}
        </div>
        <div className="text-xs text-muted-foreground" hidden={!anyFilters}>
          {anyFilters ? `${filteredCount} / ${totalCount} memos` : ''}
        </div>
      </div>
    </div>
  )
}

export function Sidebar(props: SidebarProps) {
  return (
    <div className="sticky top-6">
      <SidebarContent {...props} />
    </div>
  )
}
