/**
 * LiteTable Core Implementation
 *
 * Performance-first design:
 * - Minimal re-computation with cached results
 * - Immutable state pattern
 * - O(n log n) sorting with native sort
 * - O(n) filtering with early returns
 * - Event listeners for reactive updates
 */

import type {
  TableOptions,
  TableState,
  TableInstance,
  Column,
  SortDirection,
  TableEventType,
  TableEventListener,
  PaginationState,
} from './types'
import {
  getCellValue,
  compareValues,
  defaultFilterFn,
  createPaginationState,
  generateRowId,
} from './utils'

/**
 * LiteTable Core Class
 *
 * Clean, maintainable implementation with clear separation of concerns
 */
export class LiteTable<TData = unknown> implements TableInstance<TData> {
  private state: TableState<TData>
  private options: Required<Omit<TableOptions<TData>, 'pagination'>> & {
    pagination: PaginationState | null
  }
  private listeners = new Map<TableEventType, Set<TableEventListener<TData>>>()

  constructor(options: TableOptions<TData>) {
    // Initialize options with defaults
    this.options = {
      data: options.data,
      columns: options.columns,
      searchable: options.searchable ?? true,
      multiSort: options.multiSort ?? false,
      filterFn: options.filterFn ?? defaultFilterFn,
      defaultSort: options.defaultSort ?? { columnId: null, direction: null },
      getRowId: options.getRowId ?? generateRowId,
      pagination: this.initPagination(options),
    }

    // Initialize state
    this.state = this.createInitialState()

    // Process data pipeline
    this.processData()
  }

  /**
   * Initialize pagination config
   */
  private initPagination(options: TableOptions<TData>): PaginationState | null {
    if (!options.pagination) return null

    const config =
      typeof options.pagination === 'boolean' ? {} : options.pagination

    return createPaginationState(
      config.page ?? 1,
      config.pageSize ?? 10,
      options.data.length,
      config.pageSizeOptions
    )
  }

  /**
   * Create initial state
   */
  private createInitialState(): TableState<TData> {
    const hiddenColumns = new Set<string>()

    // Set initially hidden columns
    this.options.columns.forEach(col => {
      if (col.hidden) {
        hiddenColumns.add(col.id)
      }
    })

    return {
      originalData: [...this.options.data],
      filteredData: [],
      sortedData: [],
      paginatedData: [],
      sortState: { ...this.options.defaultSort },
      searchTerm: '',
      paginationState: this.options.pagination,
      hiddenColumns,
    }
  }

  /**
   * Process data through the pipeline: filter → sort → paginate
   * This is the core performance-critical path
   */
  private processData(): void {
    // Step 1: Filter
    this.state.filteredData = this.filterData(
      this.state.originalData,
      this.state.searchTerm
    )

    // Step 2: Sort
    this.state.sortedData = this.sortData(
      this.state.filteredData,
      this.state.sortState
    )

    // Step 3: Update pagination total if needed
    if (this.state.paginationState) {
      this.state.paginationState = createPaginationState(
        this.state.paginationState.page,
        this.state.paginationState.pageSize,
        this.state.sortedData.length,
        this.state.paginationState.pageSizeOptions
      )
    }

    // Step 4: Paginate
    this.state.paginatedData = this.paginateData(
      this.state.sortedData,
      this.state.paginationState
    )
  }

  /**
   * Filter data based on search term
   * Performance: O(n * m) where n = rows, m = columns
   */
  private filterData(data: TData[], searchTerm: string): TData[] {
    if (!this.options.searchable || !searchTerm) {
      return data
    }

    return data.filter(row =>
      this.options.filterFn(row, searchTerm, this.options.columns)
    )
  }

  /**
   * Sort data based on sort state
   * Performance: O(n log n) using native sort
   */
  private sortData(data: TData[], sortState: typeof this.state.sortState): TData[] {
    const { columnId, direction } = sortState

    if (!columnId || !direction) {
      return data
    }

    const column = this.options.columns.find(col => col.id === columnId)
    if (!column || column.sortable === false) {
      return data
    }

    // Clone array to avoid mutating original
    const sorted = [...data]

    sorted.sort((a, b) => {
      // Use custom sort function if provided
      if (column.sortFn) {
        return column.sortFn(a, b, direction)
      }

      // Default sort by column values
      const aValue = getCellValue(a, column)
      const bValue = getCellValue(b, column)
      return compareValues(aValue, bValue, direction)
    })

    return sorted
  }

  /**
   * Paginate data based on pagination state
   * Performance: O(1) with array slice
   */
  private paginateData(
    data: TData[],
    paginationState: PaginationState | null
  ): TData[] {
    if (!paginationState) {
      return data
    }

    const { startIndex, endIndex } = paginationState
    return data.slice(startIndex, endIndex)
  }

  /**
   * Emit event to all listeners
   */
  private emit(eventType: TableEventType): void {
    const listeners = this.listeners.get(eventType)
    if (listeners) {
      listeners.forEach(listener => listener(this.getState()))
    }
  }

  // ============================================
  // Public API Methods
  // ============================================

  /**
   * Get current visible rows (paginated if enabled)
   */
  getRows(): TData[] {
    return this.state.paginatedData
  }

  /**
   * Get all rows (no pagination, but filtered and sorted)
   */
  getAllRows(): TData[] {
    return this.state.sortedData
  }

  /**
   * Get all columns
   */
  getColumns(): Column<TData>[] {
    return this.options.columns
  }

  /**
   * Get visible columns only
   */
  getVisibleColumns(): Column<TData>[] {
    return this.options.columns.filter(
      col => !this.state.hiddenColumns.has(col.id)
    )
  }

  /**
   * Sort by column
   */
  sortBy(columnId: string, direction?: SortDirection): void {
    const column = this.options.columns.find(col => col.id === columnId)
    if (!column || column.sortable === false) {
      return
    }

    // Toggle direction if not provided
    let newDirection = direction
    if (!newDirection) {
      const current = this.state.sortState
      if (current.columnId === columnId) {
        newDirection = current.direction === 'asc' ? 'desc' : 'asc'
      } else {
        newDirection = 'asc'
      }
    }

    this.state.sortState = {
      columnId,
      direction: newDirection,
    }

    this.processData()
    this.emit('sort')
  }

  /**
   * Clear sorting
   */
  clearSort(): void {
    this.state.sortState = { columnId: null, direction: null }
    this.processData()
    this.emit('sort')
  }

  /**
   * Set search term and filter data
   */
  search(term: string): void {
    this.state.searchTerm = term

    // Reset to page 1 when searching
    if (this.state.paginationState) {
      this.state.paginationState = {
        ...this.state.paginationState,
        page: 1,
      }
    }

    this.processData()
    this.emit('search')
  }

  /**
   * Go to specific page
   */
  goToPage(page: number): void {
    if (!this.state.paginationState) return

    const safePage = Math.min(
      Math.max(1, page),
      this.state.paginationState.totalPages
    )

    this.state.paginationState = createPaginationState(
      safePage,
      this.state.paginationState.pageSize,
      this.state.sortedData.length,
      this.state.paginationState.pageSizeOptions
    )

    this.processData()
    this.emit('paginate')
  }

  /**
   * Go to next page
   */
  nextPage(): void {
    if (!this.state.paginationState?.hasNextPage) return
    this.goToPage(this.state.paginationState.page + 1)
  }

  /**
   * Go to previous page
   */
  prevPage(): void {
    if (!this.state.paginationState?.hasPrevPage) return
    this.goToPage(this.state.paginationState.page - 1)
  }

  /**
   * Set page size
   */
  setPageSize(size: number): void {
    if (!this.state.paginationState) return

    this.state.paginationState = createPaginationState(
      1, // Reset to page 1
      size,
      this.state.sortedData.length,
      this.state.paginationState.pageSizeOptions
    )

    this.processData()
    this.emit('paginate')
  }

  /**
   * Toggle column visibility
   */
  toggleColumn(columnId: string): void {
    if (this.state.hiddenColumns.has(columnId)) {
      this.state.hiddenColumns.delete(columnId)
    } else {
      this.state.hiddenColumns.add(columnId)
    }

    this.emit('columnToggle')
  }

  /**
   * Show column
   */
  showColumn(columnId: string): void {
    if (this.state.hiddenColumns.delete(columnId)) {
      this.emit('columnToggle')
    }
  }

  /**
   * Hide column
   */
  hideColumn(columnId: string): void {
    if (!this.state.hiddenColumns.has(columnId)) {
      this.state.hiddenColumns.add(columnId)
      this.emit('columnToggle')
    }
  }

  /**
   * Get current table state (immutable)
   */
  getState(): Readonly<TableState<TData>> {
    return Object.freeze({ ...this.state })
  }

  /**
   * Reset table to initial state
   */
  reset(): void {
    this.state = this.createInitialState()
    this.processData()
    this.emit('reset')
  }

  /**
   * Update data (useful for reactive updates)
   */
  setData(data: TData[]): void {
    this.state.originalData = [...data]
    this.processData()
  }

  /**
   * Get row by ID
   */
  getRowById(id: string): TData | undefined {
    return this.state.originalData.find((row, index) => {
      return this.options.getRowId(row, index) === id
    })
  }

  /**
   * Subscribe to table events
   */
  on(eventType: TableEventType, listener: TableEventListener<TData>): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }

    this.listeners.get(eventType)!.add(listener)

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(listener)
    }
  }

  /**
   * Remove event listener
   */
  off(eventType: TableEventType, listener: TableEventListener<TData>): void {
    this.listeners.get(eventType)?.delete(listener)
  }

  /**
   * Destroy table instance and cleanup
   */
  destroy(): void {
    this.listeners.clear()
  }
}
