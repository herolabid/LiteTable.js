/**
 * LiteTable Utility Functions
 * Pure, reusable functions for common operations
 */

import type { Column, SortDirection } from './types'

/**
 * Get nested property value from object using dot notation
 *
 * @example
 * getNestedValue({ user: { name: 'John' } }, 'user.name') // 'John'
 */
export function getNestedValue<T = unknown>(
  obj: Record<string, unknown>,
  path: string
): T | undefined {
  return path.split('.').reduce((acc, part) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, obj as unknown) as T | undefined
}

/**
 * Get value from row using column accessor or id
 * Performance-optimized with single function call
 */
export function getCellValue<TData>(
  row: TData,
  column: Column<TData>
): unknown {
  // Use custom accessor if provided
  if (column.accessor) {
    return column.accessor(row)
  }

  // Use column.id as key for simple access
  if (typeof row === 'object' && row !== null) {
    const value = (row as Record<string, unknown>)[column.id]
    return value !== undefined ? value : null
  }

  return null
}

/**
 * Compare two values for sorting
 * Handles strings, numbers, dates, booleans, and null/undefined
 *
 * Performance: Single comparison, minimal type checking
 */
export function compareValues(
  a: unknown,
  b: unknown,
  direction: SortDirection
): number {
  // Handle null/undefined - always sort to end
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1

  // String comparison (case-insensitive)
  if (typeof a === 'string' && typeof b === 'string') {
    const result = a.toLowerCase().localeCompare(b.toLowerCase())
    return direction === 'asc' ? result : -result
  }

  // Number comparison
  if (typeof a === 'number' && typeof b === 'number') {
    return direction === 'asc' ? a - b : b - a
  }

  // Date comparison
  if (a instanceof Date && b instanceof Date) {
    const diff = a.getTime() - b.getTime()
    return direction === 'asc' ? diff : -diff
  }

  // Boolean comparison
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    const result = Number(a) - Number(b)
    return direction === 'asc' ? result : -result
  }

  // Fallback to string comparison
  const aStr = String(a).toLowerCase()
  const bStr = String(b).toLowerCase()
  const result = aStr.localeCompare(bStr)
  return direction === 'asc' ? result : -result
}

/**
 * Default filter function - searches all column values
 * Performance: Early return on match, case-insensitive
 */
export function defaultFilterFn<TData>(
  row: TData,
  searchTerm: string,
  columns: Column<TData>[]
): boolean {
  if (!searchTerm) return true

  const lowerSearch = searchTerm.toLowerCase()

  // Check each column value
  for (const column of columns) {
    if (column.filterable === false) continue

    const value = getCellValue(row, column)
    if (value == null) continue

    const strValue = String(value).toLowerCase()
    if (strValue.includes(lowerSearch)) {
      return true // Early return on first match
    }
  }

  return false
}

/**
 * Create pagination state from config and data length
 */
export function createPaginationState(
  page: number,
  pageSize: number,
  totalRows: number,
  pageSizeOptions: number[] = [10, 25, 50, 100]
) {
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const startIndex = (safePage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalRows)

  return {
    page: safePage,
    pageSize,
    pageSizeOptions,
    totalRows,
    totalPages,
    startIndex,
    endIndex,
    hasPrevPage: safePage > 1,
    hasNextPage: safePage < totalPages,
  }
}

/**
 * Generate unique row ID
 */
export function generateRowId<TData>(row: TData, index: number): string {
  // Try to use 'id' property if exists
  if (typeof row === 'object' && row !== null) {
    const id = (row as Record<string, unknown>).id
    if (typeof id === 'string' || typeof id === 'number') {
      return String(id)
    }
  }

  // Fallback to index
  return `row-${index}`
}

/**
 * Debounce function for performance optimization
 * Useful for search input handling
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * Check if value is empty (null, undefined, or empty string)
 */
export function isEmpty(value: unknown): boolean {
  return value == null || value === ''
}

/**
 * Deep clone object (for immutability)
 * Performance: Only clones what's necessary
 */
export function cloneDeep<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => cloneDeep(item)) as T
  }

  const cloned = {} as T
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = cloneDeep(obj[key])
    }
  }

  return cloned
}
