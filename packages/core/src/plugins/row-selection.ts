/**
 * Row Selection Plugin
 *
 * Enables selecting rows via checkboxes or clicks with support for:
 * - Single/Multiple selection modes
 * - Select All functionality
 * - Programmatic selection
 * - Selection events
 */

export type SelectionMode = 'single' | 'multiple' | 'none'

export interface RowSelectionConfig {
  /** Selection mode */
  mode?: SelectionMode

  /** Allow selecting rows by clicking (not just checkbox) */
  selectOnRowClick?: boolean

  /** Enable "Select All" checkbox in header */
  enableSelectAll?: boolean

  /** Preserve selection when data changes */
  preserveSelection?: boolean

  /** Callback when selection changes */
  onSelectionChange?: (selectedRows: Set<string>) => void
}

export interface RowSelectionState {
  /** Set of selected row IDs */
  selectedRows: Set<string>

  /** Whether all rows are selected */
  allSelected: boolean

  /** Whether some (but not all) rows are selected */
  someSelected: boolean
}

/**
 * Row Selection Manager
 */
export class RowSelectionManager {
  private config: Required<RowSelectionConfig>
  private state: RowSelectionState
  private rowIds: Set<string> = new Set()
  private listeners: Set<(state: RowSelectionState) => void> = new Set()

  constructor(config: RowSelectionConfig = {}) {
    this.config = {
      mode: config.mode ?? 'multiple',
      selectOnRowClick: config.selectOnRowClick ?? false,
      enableSelectAll: config.enableSelectAll ?? true,
      preserveSelection: config.preserveSelection ?? true,
      onSelectionChange: config.onSelectionChange ?? (() => {}),
    }

    this.state = {
      selectedRows: new Set(),
      allSelected: false,
      someSelected: false,
    }
  }

  /**
   * Set available row IDs (call this when data changes)
   */
  setRowIds(rowIds: string[]): void {
    this.rowIds = new Set(rowIds)

    // Remove selections for rows that no longer exist
    if (!this.config.preserveSelection) {
      const validSelection = new Set(
        [...this.state.selectedRows].filter(id => this.rowIds.has(id))
      )
      this.state.selectedRows = validSelection
    }

    this.updateState()
  }

  /**
   * Select a row
   */
  selectRow(rowId: string): void {
    if (this.config.mode === 'none') return

    if (this.config.mode === 'single') {
      // Single mode: clear others, select this one
      this.state.selectedRows.clear()
      this.state.selectedRows.add(rowId)
    } else {
      // Multiple mode: add to selection
      this.state.selectedRows.add(rowId)
    }

    this.updateState()
  }

  /**
   * Deselect a row
   */
  deselectRow(rowId: string): void {
    this.state.selectedRows.delete(rowId)
    this.updateState()
  }

  /**
   * Toggle row selection
   */
  toggleRow(rowId: string): void {
    if (this.state.selectedRows.has(rowId)) {
      this.deselectRow(rowId)
    } else {
      this.selectRow(rowId)
    }
  }

  /**
   * Select all rows
   */
  selectAll(): void {
    if (this.config.mode !== 'multiple') return

    this.state.selectedRows = new Set(this.rowIds)
    this.updateState()
  }

  /**
   * Deselect all rows
   */
  deselectAll(): void {
    this.state.selectedRows.clear()
    this.updateState()
  }

  /**
   * Toggle select all
   */
  toggleSelectAll(): void {
    if (this.state.allSelected) {
      this.deselectAll()
    } else {
      this.selectAll()
    }
  }

  /**
   * Check if row is selected
   */
  isRowSelected(rowId: string): boolean {
    return this.state.selectedRows.has(rowId)
  }

  /**
   * Get selected row IDs
   */
  getSelectedRows(): Set<string> {
    return new Set(this.state.selectedRows)
  }

  /**
   * Get selected row count
   */
  getSelectedCount(): number {
    return this.state.selectedRows.size
  }

  /**
   * Get state
   */
  getState(): Readonly<RowSelectionState> {
    return Object.freeze({
      selectedRows: new Set(this.state.selectedRows),
      allSelected: this.state.allSelected,
      someSelected: this.state.someSelected,
    })
  }

  /**
   * Subscribe to selection changes
   */
  onChange(listener: (state: RowSelectionState) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Clear selection
   */
  clear(): void {
    this.deselectAll()
  }

  /**
   * Update internal state and emit
   */
  private updateState(): void {
    const totalRows = this.rowIds.size
    const selectedCount = this.state.selectedRows.size

    this.state.allSelected = totalRows > 0 && selectedCount === totalRows
    this.state.someSelected = selectedCount > 0 && selectedCount < totalRows

    // Emit to listeners
    this.listeners.forEach(listener => listener(this.getState()))

    // Call config callback
    this.config.onSelectionChange(this.getSelectedRows())
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.listeners.clear()
    this.state.selectedRows.clear()
  }
}
