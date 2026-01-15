import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RowSelectionManager } from '../../packages/core/src/plugins/row-selection'

describe('RowSelectionManager', () => {
  let selection: RowSelectionManager
  const mockRowIds = ['row-1', 'row-2', 'row-3', 'row-4', 'row-5']

  beforeEach(() => {
    selection = new RowSelectionManager({
      mode: 'multiple',
      enableSelectAll: true,
      preserveSelection: true
    })
    selection.setRowIds(mockRowIds)
  })

  describe('Initialization', () => {
    it('should initialize with default config', () => {
      const defaultSelection = new RowSelectionManager()
      expect(defaultSelection).toBeDefined()
      expect(defaultSelection.getSelectedCount()).toBe(0)
    })

    it('should initialize with custom config', () => {
      const customSelection = new RowSelectionManager({
        mode: 'single',
        selectOnRowClick: true
      })
      expect(customSelection).toBeDefined()
    })

    it('should start with no selections', () => {
      const state = selection.getState()
      expect(state.selectedRows.size).toBe(0)
      expect(state.allSelected).toBe(false)
      expect(state.someSelected).toBe(false)
    })
  })

  describe('Single Row Selection', () => {
    it('should select a single row', () => {
      selection.selectRow('row-1')
      expect(selection.isRowSelected('row-1')).toBe(true)
      expect(selection.getSelectedCount()).toBe(1)
    })

    it('should deselect a single row', () => {
      selection.selectRow('row-1')
      selection.deselectRow('row-1')
      expect(selection.isRowSelected('row-1')).toBe(false)
      expect(selection.getSelectedCount()).toBe(0)
    })

    it('should toggle row selection', () => {
      selection.toggleRow('row-1')
      expect(selection.isRowSelected('row-1')).toBe(true)
      selection.toggleRow('row-1')
      expect(selection.isRowSelected('row-1')).toBe(false)
    })

    it('should select multiple rows in multiple mode', () => {
      selection.selectRow('row-1')
      selection.selectRow('row-2')
      selection.selectRow('row-3')
      expect(selection.getSelectedCount()).toBe(3)
    })
  })

  describe('Single Selection Mode', () => {
    beforeEach(() => {
      selection = new RowSelectionManager({ mode: 'single' })
      selection.setRowIds(mockRowIds)
    })

    it('should only allow one row selected at a time', () => {
      selection.selectRow('row-1')
      selection.selectRow('row-2')
      expect(selection.getSelectedCount()).toBe(1)
      expect(selection.isRowSelected('row-2')).toBe(true)
      expect(selection.isRowSelected('row-1')).toBe(false)
    })

    it('should not allow select all in single mode', () => {
      selection.selectAll()
      expect(selection.getSelectedCount()).toBe(0)
    })
  })

  describe('None Selection Mode', () => {
    beforeEach(() => {
      selection = new RowSelectionManager({ mode: 'none' })
      selection.setRowIds(mockRowIds)
    })

    it('should not allow any selection', () => {
      selection.selectRow('row-1')
      expect(selection.getSelectedCount()).toBe(0)
    })
  })

  describe('Select All', () => {
    it('should select all rows', () => {
      selection.selectAll()
      expect(selection.getSelectedCount()).toBe(mockRowIds.length)
      expect(selection.getState().allSelected).toBe(true)
    })

    it('should deselect all rows', () => {
      selection.selectAll()
      selection.deselectAll()
      expect(selection.getSelectedCount()).toBe(0)
      expect(selection.getState().allSelected).toBe(false)
    })

    it('should toggle select all', () => {
      selection.toggleSelectAll()
      expect(selection.getState().allSelected).toBe(true)
      selection.toggleSelectAll()
      expect(selection.getState().allSelected).toBe(false)
    })

    it('should set allSelected flag correctly', () => {
      selection.selectAll()
      const state = selection.getState()
      expect(state.allSelected).toBe(true)
      expect(state.someSelected).toBe(false)
    })

    it('should set someSelected flag correctly', () => {
      selection.selectRow('row-1')
      selection.selectRow('row-2')
      const state = selection.getState()
      expect(state.allSelected).toBe(false)
      expect(state.someSelected).toBe(true)
    })
  })

  describe('State Management', () => {
    it('should return current state', () => {
      selection.selectRow('row-1')
      const state = selection.getState()
      expect(state.selectedRows).toBeInstanceOf(Set)
      expect(state.selectedRows.has('row-1')).toBe(true)
      expect(state.allSelected).toBe(false)
      expect(state.someSelected).toBe(true)
    })

    it('should return immutable state', () => {
      selection.selectRow('row-1')
      const state = selection.getState()
      // Should not be able to modify returned state
      expect(() => {
        (state as any).selectedRows = new Set()
      }).toThrow()
    })

    it('should return copied selectedRows Set', () => {
      selection.selectRow('row-1')
      const state1 = selection.getState()
      const state2 = selection.getState()
      expect(state1.selectedRows).not.toBe(state2.selectedRows)
      expect(state1.selectedRows.size).toBe(state2.selectedRows.size)
    })
  })

  describe('Row ID Management', () => {
    it('should update row IDs', () => {
      selection.selectRow('row-1')
      const newIds = ['row-1', 'row-6', 'row-7']
      selection.setRowIds(newIds)
      // row-1 should still be selected (preserveSelection: true)
      expect(selection.isRowSelected('row-1')).toBe(true)
    })

    it('should remove invalid selections when preserveSelection is false', () => {
      selection = new RowSelectionManager({ preserveSelection: false })
      selection.setRowIds(mockRowIds)
      selection.selectRow('row-1')
      selection.selectRow('row-2')

      // Update with new IDs that don't include row-1
      selection.setRowIds(['row-2', 'row-3', 'row-4'])

      expect(selection.isRowSelected('row-1')).toBe(false)
      expect(selection.isRowSelected('row-2')).toBe(true)
    })

    it('should preserve selections when preserveSelection is true', () => {
      selection.selectRow('row-1')
      selection.setRowIds(['row-5', 'row-6'])
      // row-1 should still be in selectedRows even though it's not in current rowIds
      expect(selection.getSelectedRows().has('row-1')).toBe(true)
    })
  })

  describe('Event Listeners', () => {
    it('should call onSelectionChange callback', () => {
      const callback = vi.fn()
      selection = new RowSelectionManager({ onSelectionChange: callback })
      selection.setRowIds(mockRowIds)

      selection.selectRow('row-1')
      expect(callback).toHaveBeenCalled()
    })

    it('should allow subscribing to changes', () => {
      const listener = vi.fn()
      const unsubscribe = selection.onChange(listener)

      selection.selectRow('row-1')
      expect(listener).toHaveBeenCalledTimes(1)

      unsubscribe()
      selection.selectRow('row-2')
      // Should not be called again after unsubscribe
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('should emit state to all listeners', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      selection.onChange(listener1)
      selection.onChange(listener2)

      selection.selectRow('row-1')

      expect(listener1).toHaveBeenCalled()
      expect(listener2).toHaveBeenCalled()
    })

    it('should pass correct state to listeners', () => {
      const listener = vi.fn()
      selection.onChange(listener)

      selection.selectRow('row-1')

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedRows: expect.any(Set),
          allSelected: false,
          someSelected: true
        })
      )
    })
  })

  describe('Helper Methods', () => {
    it('should check if row is selected', () => {
      expect(selection.isRowSelected('row-1')).toBe(false)
      selection.selectRow('row-1')
      expect(selection.isRowSelected('row-1')).toBe(true)
    })

    it('should get selected rows as Set', () => {
      selection.selectRow('row-1')
      selection.selectRow('row-3')
      const selected = selection.getSelectedRows()
      expect(selected).toBeInstanceOf(Set)
      expect(selected.size).toBe(2)
      expect(selected.has('row-1')).toBe(true)
      expect(selected.has('row-3')).toBe(true)
    })

    it('should get selected count', () => {
      expect(selection.getSelectedCount()).toBe(0)
      selection.selectRow('row-1')
      expect(selection.getSelectedCount()).toBe(1)
      selection.selectRow('row-2')
      expect(selection.getSelectedCount()).toBe(2)
    })

    it('should clear all selections', () => {
      selection.selectRow('row-1')
      selection.selectRow('row-2')
      selection.clear()
      expect(selection.getSelectedCount()).toBe(0)
    })
  })

  describe('Cleanup', () => {
    it('should cleanup listeners on destroy', () => {
      const listener = vi.fn()
      selection.onChange(listener)
      selection.destroy()

      selection.selectRow('row-1')
      // Listener should not be called after destroy
      expect(listener).not.toHaveBeenCalled()
    })

    it('should clear selections on destroy', () => {
      selection.selectRow('row-1')
      selection.destroy()
      expect(selection.getSelectedCount()).toBe(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty row IDs', () => {
      selection.setRowIds([])
      selection.selectAll()
      expect(selection.getSelectedCount()).toBe(0)
      expect(selection.getState().allSelected).toBe(false)
    })

    it('should handle selecting non-existent row', () => {
      selection.selectRow('non-existent')
      // Should not throw, just add to selection
      expect(selection.isRowSelected('non-existent')).toBe(true)
    })

    it('should handle deselecting non-selected row', () => {
      expect(() => selection.deselectRow('row-1')).not.toThrow()
    })

    it('should handle duplicate selections', () => {
      selection.selectRow('row-1')
      selection.selectRow('row-1')
      expect(selection.getSelectedCount()).toBe(1)
    })

    it('should handle rapid toggle', () => {
      for (let i = 0; i < 100; i++) {
        selection.toggleRow('row-1')
      }
      expect(selection.isRowSelected('row-1')).toBe(false)
    })
  })

  describe('Performance', () => {
    it('should handle large selection sets efficiently', () => {
      const largeIds = Array.from({ length: 10000 }, (_, i) => `row-${i}`)
      selection.setRowIds(largeIds)

      const startTime = performance.now()
      selection.selectAll()
      const endTime = performance.now()

      expect(selection.getSelectedCount()).toBe(10000)
      expect(endTime - startTime).toBeLessThan(100)
    })

    it('should perform lookups efficiently', () => {
      const largeIds = Array.from({ length: 10000 }, (_, i) => `row-${i}`)
      selection.setRowIds(largeIds)
      selection.selectAll()

      const startTime = performance.now()
      for (let i = 0; i < 1000; i++) {
        selection.isRowSelected(`row-${i}`)
      }
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(50)
    })
  })
})
