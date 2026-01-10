/**
 * Vue Composable for LiteTable
 *
 * Clean, performant Vue 3 integration using Composition API with:
 * - Reactive refs and computed properties
 * - Proper lifecycle management
 * - Event-driven updates
 */

import { ref, computed, onUnmounted, watch, shallowRef } from 'vue'
import { LiteTable } from '@litetable/core'
import type {
  TableOptions,
  TableState,
  Column,
  SortDirection,
  PaginationState,
} from '@litetable/core'
import type { Ref, ComputedRef } from 'vue'

/**
 * Vue table instance with reactive state
 */
export interface UseLiteTableReturn<TData = unknown> {
  // Data (computed)
  rows: ComputedRef<TData[]>
  allRows: ComputedRef<TData[]>
  columns: ComputedRef<Column<TData>[]>
  visibleColumns: ComputedRef<Column<TData>[]>

  // State (refs)
  sortState: Ref<TableState<TData>['sortState']>
  searchTerm: Ref<string>
  paginationState: Ref<PaginationState | null>
  hiddenColumns: Ref<Set<string>>

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
 * Main Vue composable for LiteTable
 *
 * Usage:
 * ```vue
 * <script setup>
 * import { useLiteTable } from '@litetable/vue'
 *
 * const table = useLiteTable({
 *   data: users,
 *   columns: [
 *     { id: 'name', header: 'Name' },
 *     { id: 'email', header: 'Email' }
 *   ]
 * })
 * </script>
 * ```
 */
export function useLiteTable<TData = unknown>(
  options: TableOptions<TData>
): UseLiteTableReturn<TData> {
  // Create table instance
  const table = shallowRef(new LiteTable(options))

  // Reactive state
  const initialState = table.value.getState()
  const sortState = ref(initialState.sortState)
  const searchTerm = ref(initialState.searchTerm)
  const paginationState = ref(initialState.paginationState)
  const hiddenColumns = ref(initialState.hiddenColumns)

  // Update reactive state on table changes
  const updateState = (state: TableState<TData>): void => {
    sortState.value = state.sortState
    searchTerm.value = state.searchTerm
    paginationState.value = state.paginationState
    hiddenColumns.value = state.hiddenColumns
  }

  // Subscribe to table events
  const unsubscribers = [
    table.value.on('sort', updateState),
    table.value.on('search', updateState),
    table.value.on('paginate', updateState),
    table.value.on('columnToggle', updateState),
    table.value.on('reset', updateState),
  ]

  // Cleanup on unmount
  onUnmounted(() => {
    unsubscribers.forEach(unsub => unsub())
    table.value.destroy()
  })

  // Watch for data changes
  watch(
    () => options.data,
    newData => {
      table.value.setData(newData)
      updateState(table.value.getState())
    },
    { deep: true }
  )

  // Computed values (reactive)
  const rows = computed(() => table.value.getRows())
  const allRows = computed(() => table.value.getAllRows())
  const columns = computed(() => table.value.getColumns())
  const visibleColumns = computed(() => table.value.getVisibleColumns())

  // Action methods
  const sortBy = (columnId: string, direction?: SortDirection): void => {
    table.value.sortBy(columnId, direction)
  }

  const clearSort = (): void => {
    table.value.clearSort()
  }

  const search = (term: string): void => {
    table.value.search(term)
  }

  const goToPage = (page: number): void => {
    table.value.goToPage(page)
  }

  const nextPage = (): void => {
    table.value.nextPage()
  }

  const prevPage = (): void => {
    table.value.prevPage()
  }

  const setPageSize = (size: number): void => {
    table.value.setPageSize(size)
  }

  const toggleColumn = (columnId: string): void => {
    table.value.toggleColumn(columnId)
  }

  const showColumn = (columnId: string): void => {
    table.value.showColumn(columnId)
  }

  const hideColumn = (columnId: string): void => {
    table.value.hideColumn(columnId)
  }

  const reset = (): void => {
    table.value.reset()
  }

  const setData = (data: TData[]): void => {
    table.value.setData(data)
    updateState(table.value.getState())
  }

  const getRowById = (id: string): TData | undefined => {
    return table.value.getRowById(id)
  }

  return {
    // Data
    rows,
    allRows,
    columns,
    visibleColumns,

    // State
    sortState,
    searchTerm,
    paginationState,
    hiddenColumns,

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
    tableInstance: table.value,
  }
}

/**
 * Helper composable for debounced search
 * Optimizes performance for search input
 *
 * Usage:
 * ```vue
 * <script setup>
 * const [searchValue, debouncedSearch] = useDebouncedSearch(table.search, 300)
 * </script>
 *
 * <template>
 *   <input
 *     :value="searchValue"
 *     @input="debouncedSearch($event.target.value)"
 *   />
 * </template>
 * ```
 */
export function useDebouncedSearch(
  searchFn: (term: string) => void,
  delay = 300
): [Ref<string>, (value: string) => void] {
  const value = ref('')
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  const debouncedSearch = (newValue: string): void => {
    value.value = newValue

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      searchFn(newValue)
    }, delay)
  }

  onUnmounted(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  })

  return [value, debouncedSearch]
}
