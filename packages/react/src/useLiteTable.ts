/**
 * React Hook for LiteTable
 *
 * Clean, performant React integration with:
 * - Proper dependency management
 * - Memoization to prevent unnecessary re-renders
 * - Event-driven updates for reactivity
 */

import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { LiteTable } from '@herolabid/litetable-core'
import type {
  TableOptions,
  TableState,
  Column,
  SortDirection,
  PaginationState,
} from '@herolabid/litetable-core'

/**
 * React table instance with reactive state
 */
export interface UseLiteTableReturn<TData = unknown> {
  // Data
  rows: TData[]
  allRows: TData[]
  columns: Column<TData>[]
  visibleColumns: Column<TData>[]

  // State
  sortState: TableState<TData>['sortState']
  searchTerm: string
  paginationState: PaginationState | null
  hiddenColumns: Set<string>

  // Actions
  sortBy: (columnId: string, direction?: SortDirection) => void
  clearSort: () => void
  search: (term: string) => void
  goToPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  setPageSize: (size: number) => void
  toggleColumn: (columnId: string) => void
  showColumn: (columnId: string) => void
  hideColumn: (columnId: string) => void
  reset: () => void
  setData: (data: TData[]) => void
  getRowById: (id: string) => TData | undefined

  // Raw instance (for advanced usage)
  tableInstance: LiteTable<TData>
}

/**
 * Main React hook for LiteTable
 *
 * Usage:
 * ```tsx
 * const table = useLiteTable({
 *   data: users,
 *   columns: [
 *     { id: 'name', header: 'Name' },
 *     { id: 'email', header: 'Email' }
 *   ]
 * })
 * ```
 */
export function useLiteTable<TData = unknown>(
  options: TableOptions<TData>
): UseLiteTableReturn<TData> {
  // Create table instance (only once)
  const tableRef = useRef<LiteTable<TData>>()

  if (!tableRef.current) {
    tableRef.current = new LiteTable(options)
  }

  const table = tableRef.current

  // Reactive state - re-render when table updates
  const [tableState, setTableState] = useState<TableState<TData>>(() =>
    table.getState()
  )

  // Subscribe to table updates
  useEffect(() => {
    const unsubscribers = [
      table.on('sort', setTableState),
      table.on('search', setTableState),
      table.on('paginate', setTableState),
      table.on('columnToggle', setTableState),
      table.on('reset', setTableState),
    ]

    // Cleanup on unmount
    return () => {
      unsubscribers.forEach(unsub => unsub())
      table.destroy()
    }
  }, [table])

  // Update data when options.data changes
  useEffect(() => {
    table.setData(options.data)
    setTableState(table.getState())
  }, [options.data, table])

  // Memoized action callbacks (stable references)
  const sortBy = useCallback(
    (columnId: string, direction?: SortDirection) => {
      table.sortBy(columnId, direction)
    },
    [table]
  )

  const clearSort = useCallback(() => {
    table.clearSort()
  }, [table])

  const search = useCallback(
    (term: string) => {
      table.search(term)
    },
    [table]
  )

  const goToPage = useCallback(
    (page: number) => {
      table.goToPage(page)
    },
    [table]
  )

  const nextPage = useCallback(() => {
    table.nextPage()
  }, [table])

  const prevPage = useCallback(() => {
    table.prevPage()
  }, [table])

  const setPageSize = useCallback(
    (size: number) => {
      table.setPageSize(size)
    },
    [table]
  )

  const toggleColumn = useCallback(
    (columnId: string) => {
      table.toggleColumn(columnId)
    },
    [table]
  )

  const showColumn = useCallback(
    (columnId: string) => {
      table.showColumn(columnId)
    },
    [table]
  )

  const hideColumn = useCallback(
    (columnId: string) => {
      table.hideColumn(columnId)
    },
    [table]
  )

  const reset = useCallback(() => {
    table.reset()
  }, [table])

  const setData = useCallback(
    (data: TData[]) => {
      table.setData(data)
      setTableState(table.getState())
    },
    [table]
  )

  const getRowById = useCallback(
    (id: string) => {
      return table.getRowById(id)
    },
    [table]
  )

  // Memoized derived values
  const rows = useMemo(() => table.getRows(), [table, tableState])
  const allRows = useMemo(() => table.getAllRows(), [table, tableState])
  const columns = useMemo(() => table.getColumns(), [table])
  const visibleColumns = useMemo(
    () => table.getVisibleColumns(),
    [table, tableState.hiddenColumns]
  )

  return {
    // Data
    rows,
    allRows,
    columns,
    visibleColumns,

    // State
    sortState: tableState.sortState,
    searchTerm: tableState.searchTerm,
    paginationState: tableState.paginationState,
    hiddenColumns: tableState.hiddenColumns,

    // Actions
    sortBy,
    clearSort,
    search,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
    toggleColumn,
    showColumn,
    hideColumn,
    reset,
    setData,
    getRowById,

    // Raw instance
    tableInstance: table,
  }
}

/**
 * Helper hook for debounced search
 * Optimizes performance for search input
 *
 * Usage:
 * ```tsx
 * const [searchValue, debouncedSearch] = useDebouncedSearch(table.search, 300)
 *
 * <input
 *   value={searchValue}
 *   onChange={(e) => debouncedSearch(e.target.value)}
 * />
 * ```
 */
export function useDebouncedSearch(
  searchFn: (term: string) => void,
  delay = 300
): [string, (value: string) => void] {
  const [value, setValue] = useState('')
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const debouncedSearch = useCallback(
    (newValue: string) => {
      setValue(newValue)

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        searchFn(newValue)
      }, delay)
    },
    [searchFn, delay]
  )

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return [value, debouncedSearch]
}
