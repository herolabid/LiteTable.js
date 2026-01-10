/**
 * @herolabid/litetable-react
 *
 * React adapter for LiteTable
 * Clean hooks-based API for React applications
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
