/**
 * @herolabid/litetable-vue
 *
 * Vue adapter for LiteTable
 * Clean Composition API for Vue 3 applications
 */

export { useLiteTable, useDebouncedSearch } from './useLiteTable'
export type { UseLiteTableReturn } from './useLiteTable'

// Re-export core types for convenience
export type {
  TableOptions,
  Column,
  SortDirection,
  PaginationConfig,
  PaginationState,
  TableState,
  FilterFn,
  SortFn,
} from '@herolabid/litetable-core'

// Version
export const VERSION = '0.2.2'
