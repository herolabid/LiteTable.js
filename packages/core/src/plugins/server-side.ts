/**
 * Server-Side Operations Plugin
 *
 * Enables remote data loading with server-side:
 * - Pagination
 * - Sorting
 * - Filtering
 * - AJAX requests
 *
 * ZERO DEPENDENCIES - Pure fetch API
 */

export interface ServerSideConfig {
  /** API endpoint URL */
  url: string

  /** HTTP method */
  method?: 'GET' | 'POST'

  /** Enable server-side pagination */
  pagination?: boolean

  /** Enable server-side sorting */
  sorting?: boolean

  /** Enable server-side filtering */
  filtering?: boolean

  /** Request headers */
  headers?: Record<string, string>

  /** Transform request params before sending */
  transformRequest?: (params: ServerRequestParams) => Record<string, unknown>

  /** Transform response data */
  transformResponse?: (response: ServerResponse) => ServerTransformedData

  /** Debounce delay for search (ms) */
  searchDebounce?: number

  /** Error handler */
  onError?: (error: Error) => void
}

export interface ServerRequestParams {
  /** Current page (1-indexed) */
  page: number

  /** Page size */
  pageSize: number

  /** Sort column ID */
  sortBy?: string

  /** Sort direction */
  sortDirection?: 'asc' | 'desc'

  /** Search term */
  search?: string

  /** Additional custom params */
  [key: string]: unknown
}

export interface ServerResponse {
  /** Array of data rows */
  data: unknown[]

  /** Total number of rows (for pagination) */
  total: number

  /** Current page */
  page?: number

  /** Last page number */
  lastPage?: number

  /** Additional metadata */
  [key: string]: unknown
}

export interface ServerTransformedData {
  data: unknown[]
  total: number
}

export interface ServerSideState {
  /** Loading state */
  loading: boolean

  /** Error state */
  error: Error | null

  /** Current data */
  data: unknown[]

  /** Total rows on server */
  totalRows: number

  /** Last request params */
  lastParams: ServerRequestParams | null
}

/**
 * Server-Side Data Manager
 *
 * Handles AJAX requests and state management for server-side operations
 * ZERO DEPENDENCIES - Uses native fetch API
 */
export class ServerSideManager {
  private config: Required<
    Omit<ServerSideConfig, 'transformRequest' | 'transformResponse' | 'onError'>
  > & {
    transformRequest?: ServerSideConfig['transformRequest']
    transformResponse?: ServerSideConfig['transformResponse']
    onError?: ServerSideConfig['onError']
  }
  private state: ServerSideState
  private listeners: Set<(state: ServerSideState) => void> = new Set()
  private abortController: AbortController | null = null
  private debounceTimeout: ReturnType<typeof setTimeout> | null = null

  constructor(config: ServerSideConfig) {
    this.config = {
      url: config.url,
      method: config.method ?? 'GET',
      pagination: config.pagination ?? true,
      sorting: config.sorting ?? true,
      filtering: config.filtering ?? true,
      headers: config.headers ?? {
        'Content-Type': 'application/json',
      },
      searchDebounce: config.searchDebounce ?? 300,
      transformRequest: config.transformRequest,
      transformResponse: config.transformResponse,
      onError: config.onError,
    }

    this.state = {
      loading: false,
      error: null,
      data: [],
      totalRows: 0,
      lastParams: null,
    }
  }

  /**
   * Fetch data from server
   *
   * @performance Uses native fetch API with AbortController
   */
  async fetchData(params: ServerRequestParams): Promise<void> {
    // Cancel previous request if still pending
    if (this.abortController) {
      this.abortController.abort()
    }

    // Create new abort controller
    this.abortController = new AbortController()

    // Update state: loading
    this.updateState({
      loading: true,
      error: null,
      lastParams: params,
    })

    try {
      // Transform params if needed
      const requestParams = this.config.transformRequest
        ? this.config.transformRequest(params)
        : this.buildDefaultParams(params)

      // Build URL
      const url = this.buildUrl(requestParams)

      // Make request
      const response = await fetch(url, {
        method: this.config.method,
        headers: this.config.headers,
        signal: this.abortController.signal,
        body:
          this.config.method === 'POST'
            ? JSON.stringify(requestParams)
            : undefined,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // Parse response
      const json = (await response.json()) as ServerResponse

      // Transform response if needed
      const transformed = this.config.transformResponse
        ? this.config.transformResponse(json)
        : { data: json.data, total: json.total }

      // Update state: success
      this.updateState({
        loading: false,
        data: transformed.data,
        totalRows: transformed.total,
      })
    } catch (error) {
      // Ignore abort errors
      if ((error as Error).name === 'AbortError') {
        return
      }

      const err = error as Error

      // Update state: error
      this.updateState({
        loading: false,
        error: err,
        data: [],
        totalRows: 0,
      })

      // Call error handler
      if (this.config.onError) {
        this.config.onError(err)
      }
    } finally {
      this.abortController = null
    }
  }

  /**
   * Fetch with debounce (for search)
   */
  fetchDataDebounced(params: ServerRequestParams): void {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout)
    }

    this.debounceTimeout = setTimeout(() => {
      this.fetchData(params)
    }, this.config.searchDebounce)
  }

  /**
   * Build default request params
   */
  private buildDefaultParams(
    params: ServerRequestParams
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {}

    if (this.config.pagination) {
      result.page = params.page
      result.pageSize = params.pageSize
    }

    if (this.config.sorting && params.sortBy) {
      result.sortBy = params.sortBy
      result.sortDirection = params.sortDirection
    }

    if (this.config.filtering && params.search) {
      result.search = params.search
    }

    // Add any custom params
    Object.keys(params).forEach(key => {
      if (!['page', 'pageSize', 'sortBy', 'sortDirection', 'search'].includes(key)) {
        result[key] = params[key]
      }
    })

    return result
  }

  /**
   * Build request URL
   */
  private buildUrl(params: Record<string, unknown>): string {
    if (this.config.method === 'POST') {
      return this.config.url
    }

    // GET: Add query params
    const url = new URL(this.config.url, window.location.origin)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })

    return url.toString()
  }

  /**
   * Get current state
   */
  getState(): Readonly<ServerSideState> {
    return Object.freeze({ ...this.state })
  }

  /**
   * Subscribe to state changes
   */
  onChange(listener: (state: ServerSideState) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Update state and emit
   */
  private updateState(partial: Partial<ServerSideState>): void {
    this.state = { ...this.state, ...partial }
    this.listeners.forEach(listener => listener(this.getState()))
  }

  /**
   * Cancel pending request
   */
  cancel(): void {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }

    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout)
      this.debounceTimeout = null
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.cancel()
    this.listeners.clear()
  }
}
