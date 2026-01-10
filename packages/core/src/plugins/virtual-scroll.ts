/**
 * Virtual Scrolling Plugin
 *
 * Enables rendering of massive datasets (100k+ rows) by only rendering
 * visible rows in the viewport. This dramatically improves performance.
 *
 * Performance: O(1) rendering time regardless of dataset size
 */

export interface VirtualScrollConfig {
  /** Height of each row in pixels */
  rowHeight: number

  /** Number of extra rows to render above/below viewport (buffer) */
  overscan?: number

  /** Container height in pixels */
  containerHeight: number

  /** Enable virtual scrolling */
  enabled?: boolean
}

export interface VirtualScrollState {
  /** Index of first visible row */
  startIndex: number

  /** Index of last visible row */
  endIndex: number

  /** Total scrollable height */
  totalHeight: number

  /** Current scroll offset */
  scrollTop: number

  /** Visible rows (slice of data) */
  visibleRows: number

  /** Offset for positioning */
  offsetY: number
}

/**
 * Calculate virtual scroll state based on scroll position
 *
 * @performance O(1) - Simple arithmetic, no loops
 */
export function calculateVirtualScroll<TData>(
  data: TData[],
  config: VirtualScrollConfig,
  scrollTop: number
): VirtualScrollState {
  const {
    rowHeight,
    containerHeight,
    overscan = 5, // Default: render 5 extra rows on each side
  } = config

  // Total height of all rows
  const totalHeight = data.length * rowHeight

  // Calculate visible row indices
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
  const visibleRows = Math.ceil(containerHeight / rowHeight)
  const endIndex = Math.min(
    data.length,
    startIndex + visibleRows + overscan * 2
  )

  // Offset for absolute positioning
  const offsetY = startIndex * rowHeight

  return {
    startIndex,
    endIndex,
    totalHeight,
    scrollTop,
    visibleRows,
    offsetY,
  }
}

/**
 * Get slice of data for virtual scrolling
 *
 * @performance O(1) - Array slice operation
 */
export function getVirtualRows<TData>(
  data: TData[],
  state: VirtualScrollState
): TData[] {
  return data.slice(state.startIndex, state.endIndex)
}

/**
 * Virtual scroll hook for managing scroll events
 */
export class VirtualScrollManager<TData> {
  private config: Required<VirtualScrollConfig>
  private state: VirtualScrollState
  private data: TData[]
  private listeners: Set<(state: VirtualScrollState) => void> = new Set()

  constructor(data: TData[], config: VirtualScrollConfig) {
    this.data = data
    this.config = {
      rowHeight: config.rowHeight,
      overscan: config.overscan ?? 5,
      containerHeight: config.containerHeight,
      enabled: config.enabled ?? true,
    }

    // Initialize state
    this.state = calculateVirtualScroll(this.data, this.config, 0)
  }

  /**
   * Handle scroll event
   * Call this from your scroll event listener
   */
  handleScroll(scrollTop: number): void {
    this.state = calculateVirtualScroll(this.data, this.config, scrollTop)
    this.emit()
  }

  /**
   * Update data (when table data changes)
   */
  updateData(data: TData[]): void {
    this.data = data
    this.state = calculateVirtualScroll(
      this.data,
      this.config,
      this.state.scrollTop
    )
    this.emit()
  }

  /**
   * Get current visible rows
   */
  getVisibleRows(): TData[] {
    return getVirtualRows(this.data, this.state)
  }

  /**
   * Get current state
   */
  getState(): Readonly<VirtualScrollState> {
    return Object.freeze({ ...this.state })
  }

  /**
   * Subscribe to state changes
   */
  onChange(listener: (state: VirtualScrollState) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Emit state change to all listeners
   */
  private emit(): void {
    this.listeners.forEach(listener => listener(this.getState()))
  }

  /**
   * Scroll to specific index
   */
  scrollToIndex(index: number): number {
    const scrollTop = Math.max(
      0,
      Math.min(
        index * this.config.rowHeight,
        this.state.totalHeight - this.config.containerHeight
      )
    )
    this.handleScroll(scrollTop)
    return scrollTop
  }

  /**
   * Get row height
   */
  getRowHeight(): number {
    return this.config.rowHeight
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.listeners.clear()
  }
}

/**
 * Utility: Estimate row height from sample data
 * Useful when you don't know the exact row height
 */
export function estimateRowHeight(
  sampleElement: HTMLElement | null
): number {
  if (!sampleElement) return 40 // Default fallback

  const height = sampleElement.getBoundingClientRect().height
  return Math.max(20, Math.ceil(height)) // Minimum 20px
}
