/**
 * @litetable/react
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
} from '@litetable/core'

// Version
export const VERSION = '0.1.0'
