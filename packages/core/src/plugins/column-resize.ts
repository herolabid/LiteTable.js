/**
 * Column Resizing Plugin
 *
 * Enables drag-to-resize columns with:
 * - Mouse drag interaction
 * - Min/max width constraints
 * - Programmatic resizing
 * - Resize events
 *
 * ZERO DEPENDENCIES - Pure JavaScript with mouse events
 */

export interface ColumnResizeConfig {
  /** Minimum column width in pixels */
  minWidth?: number

  /** Maximum column width in pixels */
  maxWidth?: number

  /** Enable double-click to auto-fit */
  autoFit?: boolean

  /** Callback when column is resized */
  onResize?: (columnId: string, width: number) => void

  /** Resize handle width in pixels */
  handleWidth?: number
}

export interface ColumnWidthState {
  /** Map of column ID to width */
  widths: Map<string, number>

  /** Currently resizing column */
  resizing: string | null
}

/**
 * Column Resize Manager
 * ZERO DEPENDENCIES - Pure DOM events
 */
export class ColumnResizeManager {
  private config: Required<Omit<ColumnResizeConfig, 'onResize'>> & {
    onResize?: ColumnResizeConfig['onResize']
  }
  private state: ColumnWidthState
  private listeners: Set<(state: ColumnWidthState) => void> = new Set()

  // Resize state
  private activeColumnId: string | null = null
  private startX = 0
  private startWidth = 0

  constructor(config: ColumnResizeConfig = {}) {
    this.config = {
      minWidth: config.minWidth ?? 50,
      maxWidth: config.maxWidth ?? 1000,
      autoFit: config.autoFit ?? true,
      handleWidth: config.handleWidth ?? 8,
      onResize: config.onResize,
    }

    this.state = {
      widths: new Map(),
      resizing: null,
    }
  }

  /**
   * Start resizing a column
   * Call this on mousedown on resize handle
   */
  startResize(columnId: string, startX: number, currentWidth: number): void {
    this.activeColumnId = columnId
    this.startX = startX
    this.startWidth = currentWidth
    this.state.resizing = columnId

    // Add global mouse event listeners
    document.addEventListener('mousemove', this.handleMouseMove)
    document.addEventListener('mouseup', this.handleMouseUp)

    // Prevent text selection during resize
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'

    this.emit()
  }

  /**
   * Handle mouse move during resize
   */
  private handleMouseMove = (event: MouseEvent): void => {
    if (!this.activeColumnId) return

    const deltaX = event.clientX - this.startX
    const newWidth = this.startWidth + deltaX

    // Apply min/max constraints
    const constrainedWidth = Math.max(
      this.config.minWidth,
      Math.min(this.config.maxWidth, newWidth)
    )

    // Update width
    this.setColumnWidth(this.activeColumnId, constrainedWidth)
  }

  /**
   * Handle mouse up (end resize)
   */
  private handleMouseUp = (): void => {
    if (!this.activeColumnId) return

    // Remove global listeners
    document.removeEventListener('mousemove', this.handleMouseMove)
    document.removeEventListener('mouseup', this.handleMouseUp)

    // Restore cursor and selection
    document.body.style.userSelect = ''
    document.body.style.cursor = ''

    // Call resize callback
    if (this.config.onResize) {
      const width = this.state.widths.get(this.activeColumnId) ?? this.startWidth
      this.config.onResize(this.activeColumnId, width)
    }

    this.activeColumnId = null
    this.state.resizing = null
    this.emit()
  }

  /**
   * Set column width programmatically
   */
  setColumnWidth(columnId: string, width: number): void {
    const constrainedWidth = Math.max(
      this.config.minWidth,
      Math.min(this.config.maxWidth, width)
    )

    this.state.widths.set(columnId, constrainedWidth)
    this.emit()
  }

  /**
   * Get column width
   */
  getColumnWidth(columnId: string): number | undefined {
    return this.state.widths.get(columnId)
  }

  /**
   * Reset column width to default
   */
  resetColumnWidth(columnId: string): void {
    this.state.widths.delete(columnId)
    this.emit()
  }

  /**
   * Reset all column widths
   */
  resetAllWidths(): void {
    this.state.widths.clear()
    this.emit()
  }

  /**
   * Auto-fit column width based on content
   * Note: This requires access to DOM element
   */
  autoFitColumn(columnId: string, cellWidths: number[]): void {
    if (!this.config.autoFit) return

    // Calculate max width from cell contents
    const maxWidth = Math.max(...cellWidths, this.config.minWidth)
    const constrainedWidth = Math.min(maxWidth, this.config.maxWidth)

    this.setColumnWidth(columnId, constrainedWidth)
  }

  /**
   * Check if column is currently being resized
   */
  isResizing(columnId?: string): boolean {
    if (columnId) {
      return this.state.resizing === columnId
    }
    return this.state.resizing !== null
  }

  /**
   * Get current state
   */
  getState(): Readonly<ColumnWidthState> {
    return Object.freeze({
      widths: new Map(this.state.widths),
      resizing: this.state.resizing,
    })
  }

  /**
   * Subscribe to state changes
   */
  onChange(listener: (state: ColumnWidthState) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Emit state change
   */
  private emit(): void {
    this.listeners.forEach(listener => listener(this.getState()))
  }

  /**
   * Cleanup
   */
  destroy(): void {
    // Remove any active listeners
    if (this.activeColumnId) {
      document.removeEventListener('mousemove', this.handleMouseMove)
      document.removeEventListener('mouseup', this.handleMouseUp)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }

    this.listeners.clear()
    this.state.widths.clear()
  }
}

/**
 * Utility: Create resize handle element
 * Helper function for rendering resize handle
 */
export function createResizeHandle(config?: {
  width?: number
  className?: string
}): HTMLDivElement {
  const handle = document.createElement('div')
  handle.className = config?.className ?? 'column-resize-handle'
  handle.style.cssText = `
    position: absolute;
    top: 0;
    right: 0;
    width: ${config?.width ?? 8}px;
    height: 100%;
    cursor: col-resize;
    user-select: none;
    z-index: 10;
  `

  return handle
}

/**
 * Utility: Measure cell width
 * Useful for auto-fit functionality
 */
export function measureCellWidth(element: HTMLElement): number {
  // Create temporary element for measurement
  const temp = document.createElement('span')
  temp.style.cssText = `
    visibility: hidden;
    position: absolute;
    white-space: nowrap;
  `
  temp.textContent = element.textContent

  document.body.appendChild(temp)
  const width = temp.getBoundingClientRect().width
  document.body.removeChild(temp)

  return width
}
