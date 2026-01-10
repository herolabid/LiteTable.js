/**
 * LiteTable Core Types
 * Clean, well-documented type definitions for maximum type safety
 */

/**
 * Sort direction for columns
 */
export type SortDirection = 'asc' | 'desc' | null

/**
 * Column alignment options
 */
export type ColumnAlign = 'left' | 'center' | 'right'

/**
 * Filter function type - allows custom filtering logic
 */
export type FilterFn<TData> = (row: TData, searchTerm: string, columns: Column<TData>[]) => boolean

/**
 * Sort function type - allows custom sorting logic
 */
export type SortFn<TData> = (a: TData, b: TData, direction: SortDirection) => number

/**
 * Column definition for the table
 *
 * @template TData - The type of data in each row
 */
export interface Column<TData = unknown> {
  /** Unique identifier for the column */
  id: string

  /** Display header text */
  header: string

  /** Accessor function to get cell value from row data */
  accessor?: (row: TData) => unknown

  /** Enable/disable sorting for this column */
  sortable?: boolean

  /** Custom sort function */
  sortFn?: SortFn<TData>

  /** Enable/disable filtering for this column */
  filterable?: boolean

  /** Column alignment */
  align?: ColumnAlign

  /** Column width (CSS value) */
  width?: string

  /** Hide column by default */
  hidden?: boolean

  /** Custom cell renderer */
  cell?: (value: unknown, row: TData) => unknown
}

/**
 * Sorting state
 */
export interface SortState {
  /** Column ID being sorted */
  columnId: string | null

  /** Current sort direction */
  direction: SortDirection
}

/**
 * Pagination configuration
 */
export interface PaginationConfig {
  /** Current page number (1-indexed) */
  page: number

  /** Number of rows per page */
  pageSize: number

  /** Available page size options */
  pageSizeOptions?: number[]
}

/**
 * Pagination state with computed values
 */
export interface PaginationState extends PaginationConfig {
  /** Total number of rows */
  totalRows: number

  /** Total number of pages */
  totalPages: number

  /** Index of first row on current page (0-indexed) */
  startIndex: number

  /** Index of last row on current page (0-indexed) */
  endIndex: number

  /** Whether there's a previous page */
  hasPrevPage: boolean

  /** Whether there's a next page */
  hasNextPage: boolean
}

/**
 * Table configuration options
 *
 * @template TData - The type of data in each row
 */
export interface TableOptions<TData = unknown> {
  /** Array of data rows */
  data: TData[]

  /** Column definitions */
  columns: Column<TData>[]

  /** Enable pagination */
  pagination?: boolean | Partial<PaginationConfig>

  /** Enable global search/filter */
  searchable?: boolean

  /** Custom global filter function */
  filterFn?: FilterFn<TData>

  /** Enable multi-column sorting */
  multiSort?: boolean

  /** Default sort state */
  defaultSort?: SortState

  /** Unique row ID accessor */
  getRowId?: (row: TData, index: number) => string
}

/**
 * Internal table state
 */
export interface TableState<TData = unknown> {
  /** Original data */
  originalData: TData[]

  /** Filtered data (after search) */
  filteredData: TData[]

  /** Sorted data (after sort) */
  sortedData: TData[]

  /** Paginated data (current page rows) */
  paginatedData: TData[]

  /** Current sort state */
  sortState: SortState

  /** Current search term */
  searchTerm: string

  /** Pagination state (if enabled) */
  paginationState: PaginationState | null

  /** Hidden column IDs */
  hiddenColumns: Set<string>
}

/**
 * Table instance API
 *
 * @template TData - The type of data in each row
 */
export interface TableInstance<TData = unknown> {
  /** Get current visible rows */
  getRows: () => TData[]

  /** Get all columns */
  getColumns: () => Column<TData>[]

  /** Get visible columns only */
  getVisibleColumns: () => Column<TData>[]

  /** Sort by column */
  sortBy: (columnId: string, direction?: SortDirection) => void

  /** Clear sorting */
  clearSort: () => void

  /** Set search term */
  search: (term: string) => void

  /** Go to specific page */
  goToPage: (page: number) => void

  /** Go to next page */
  nextPage: () => void

  /** Go to previous page */
  prevPage: () => void

  /** Set page size */
  setPageSize: (size: number) => void

  /** Toggle column visibility */
  toggleColumn: (columnId: string) => void

  /** Show column */
  showColumn: (columnId: string) => void

  /** Hide column */
  hideColumn: (columnId: string) => void

  /** Get current table state */
  getState: () => Readonly<TableState<TData>>

  /** Reset table to initial state */
  reset: () => void

  /** Get row by ID */
  getRowById: (id: string) => TData | undefined
}

/**
 * Event types for table updates
 */
export type TableEventType =
  | 'sort'
  | 'search'
  | 'paginate'
  | 'columnToggle'
  | 'reset'

/**
 * Event listener callback
 */
export type TableEventListener<TData = unknown> = (
  state: Readonly<TableState<TData>>
) => void
