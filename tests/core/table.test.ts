import { describe, it, expect, beforeEach } from 'vitest'
import { LiteTable } from '../../packages/core/src/table'
import { generateUsers, mockColumns } from '../utils/mockData'
import type { Column } from '../../packages/core/src/types'

describe('LiteTable Core', () => {
  const users = generateUsers(50)
  let table: LiteTable<any>

  beforeEach(() => {
    table = new LiteTable({
      data: users,
      columns: mockColumns
    })
  })

  describe('Initialization', () => {
    it('should initialize with data and columns', () => {
      expect(table).toBeDefined()
      expect(table.getRows()).toHaveLength(50)
      expect(table.getColumns()).toHaveLength(7)
    })

    it('should return visible columns only', () => {
      table.hideColumn('email')
      const visibleColumns = table.getVisibleColumns()
      expect(visibleColumns).toHaveLength(6)
      expect(visibleColumns.find(col => col.id === 'email')).toBeUndefined()
    })

    it('should handle empty data', () => {
      const emptyTable = new LiteTable({
        data: [],
        columns: mockColumns
      })
      expect(emptyTable.getRows()).toHaveLength(0)
    })

    it('should handle custom getRowId', () => {
      const customTable = new LiteTable({
        data: users,
        columns: mockColumns,
        getRowId: (row) => `user-${row.id}`
      })
      const firstRow = customTable.getRowById('user-1')
      expect(firstRow).toBeDefined()
      expect(firstRow?.id).toBe(1)
    })
  })

  describe('Sorting', () => {
    it('should sort by column ascending', () => {
      table.sortBy('name', 'asc')
      const rows = table.getRows()
      expect(rows[0].name).toBeLessThan(rows[1].name)
    })

    it('should sort by column descending', () => {
      table.sortBy('name', 'desc')
      const rows = table.getRows()
      expect(rows[0].name).toBeGreaterThan(rows[1].name)
    })

    it('should sort numbers correctly', () => {
      table.sortBy('age', 'asc')
      const rows = table.getRows()
      expect(rows[0].age).toBeLessThanOrEqual(rows[1].age)
    })

    it('should clear sorting', () => {
      table.sortBy('name', 'asc')
      table.clearSort()
      const state = table.getState()
      expect(state.sortState.columnId).toBeNull()
      expect(state.sortState.direction).toBeNull()
    })

    it('should toggle sort direction', () => {
      table.sortBy('name', 'asc')
      table.sortBy('name', 'desc')
      const state = table.getState()
      expect(state.sortState.direction).toBe('desc')
    })
  })

  describe('Filtering', () => {
    it('should filter data by search term', () => {
      table.search('John')
      const rows = table.getRows()
      expect(rows.length).toBeGreaterThan(0)
      expect(rows.every(row =>
        JSON.stringify(row).toLowerCase().includes('john')
      )).toBe(true)
    })

    it('should return all data when search is cleared', () => {
      table.search('John')
      table.search('')
      expect(table.getRows()).toHaveLength(50)
    })

    it('should filter case-insensitively', () => {
      table.search('JOHN')
      const rows = table.getRows()
      expect(rows.length).toBeGreaterThan(0)
    })

    it('should handle no results', () => {
      table.search('xyznonexistent')
      expect(table.getRows()).toHaveLength(0)
    })

    it('should support custom filter function', () => {
      const customTable = new LiteTable({
        data: users,
        columns: mockColumns,
        filterFn: (row, term) => row.department === term
      })
      customTable.search('Engineering')
      const rows = customTable.getRows()
      expect(rows.every(row => row.department === 'Engineering')).toBe(true)
    })
  })

  describe('Pagination', () => {
    beforeEach(() => {
      table = new LiteTable({
        data: users,
        columns: mockColumns,
        pagination: { page: 1, pageSize: 10 }
      })
    })

    it('should paginate data', () => {
      expect(table.getRows()).toHaveLength(10)
    })

    it('should navigate to next page', () => {
      const firstPageFirstRow = table.getRows()[0]
      table.nextPage()
      const secondPageFirstRow = table.getRows()[0]
      expect(firstPageFirstRow.id).not.toBe(secondPageFirstRow.id)
    })

    it('should navigate to previous page', () => {
      table.goToPage(2)
      const secondPageFirstRow = table.getRows()[0]
      table.prevPage()
      const firstPageFirstRow = table.getRows()[0]
      expect(firstPageFirstRow.id).not.toBe(secondPageFirstRow.id)
    })

    it('should change page size', () => {
      table.setPageSize(25)
      expect(table.getRows()).toHaveLength(25)
    })

    it('should calculate total pages correctly', () => {
      const state = table.getState()
      expect(state.paginationState?.totalPages).toBe(5) // 50 rows / 10 per page
    })

    it('should not go beyond last page', () => {
      table.goToPage(999)
      const state = table.getState()
      expect(state.paginationState?.page).toBe(5)
    })

    it('should not go before first page', () => {
      table.goToPage(-1)
      const state = table.getState()
      expect(state.paginationState?.page).toBe(1)
    })
  })

  describe('Column Visibility', () => {
    it('should hide column', () => {
      table.hideColumn('email')
      const visibleColumns = table.getVisibleColumns()
      expect(visibleColumns.find(col => col.id === 'email')).toBeUndefined()
    })

    it('should show hidden column', () => {
      table.hideColumn('email')
      table.showColumn('email')
      const visibleColumns = table.getVisibleColumns()
      expect(visibleColumns.find(col => col.id === 'email')).toBeDefined()
    })

    it('should toggle column visibility', () => {
      table.toggleColumn('email')
      expect(table.getVisibleColumns().find(col => col.id === 'email')).toBeUndefined()
      table.toggleColumn('email')
      expect(table.getVisibleColumns().find(col => col.id === 'email')).toBeDefined()
    })

    it('should handle multiple hidden columns', () => {
      table.hideColumn('email')
      table.hideColumn('age')
      table.hideColumn('salary')
      expect(table.getVisibleColumns()).toHaveLength(4)
    })
  })

  describe('State Management', () => {
    it('should return current state', () => {
      const state = table.getState()
      expect(state).toHaveProperty('originalData')
      expect(state).toHaveProperty('filteredData')
      expect(state).toHaveProperty('sortedData')
      expect(state).toHaveProperty('paginatedData')
    })

    it('should reset to initial state', () => {
      table.sortBy('name', 'asc')
      table.search('John')
      table.hideColumn('email')
      table.reset()

      const state = table.getState()
      expect(state.sortState.columnId).toBeNull()
      expect(state.searchTerm).toBe('')
      expect(table.getVisibleColumns()).toHaveLength(7)
    })
  })

  describe('Events', () => {
    it('should emit sort event', () => {
      let eventFired = false
      table.on('sort', () => { eventFired = true })
      table.sortBy('name', 'asc')
      expect(eventFired).toBe(true)
    })

    it('should emit search event', () => {
      let eventFired = false
      table.on('search', () => { eventFired = true })
      table.search('John')
      expect(eventFired).toBe(true)
    })

    it('should emit paginate event', () => {
      const paginatedTable = new LiteTable({
        data: users,
        columns: mockColumns,
        pagination: { page: 1, pageSize: 10 }
      })
      let eventFired = false
      paginatedTable.on('paginate', () => { eventFired = true })
      paginatedTable.nextPage()
      expect(eventFired).toBe(true)
    })

    it('should remove event listeners', () => {
      let eventCount = 0
      const listener = () => { eventCount++ }
      table.on('sort', listener)
      table.sortBy('name', 'asc')
      table.off('sort', listener)
      table.sortBy('age', 'desc')
      expect(eventCount).toBe(1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle sort on non-existent column', () => {
      expect(() => table.sortBy('nonexistent', 'asc')).not.toThrow()
    })

    it('should handle hide on non-existent column', () => {
      expect(() => table.hideColumn('nonexistent')).not.toThrow()
    })

    it('should handle getRowById with invalid id', () => {
      const row = table.getRowById('nonexistent')
      expect(row).toBeUndefined()
    })

    it('should handle very long search terms', () => {
      const longTerm = 'a'.repeat(1000)
      expect(() => table.search(longTerm)).not.toThrow()
    })

    it('should handle special characters in search', () => {
      expect(() => table.search('!@#$%^&*()')).not.toThrow()
    })
  })

  describe('Performance', () => {
    it('should handle large dataset efficiently', () => {
      const largeData = generateUsers(10000)
      const startTime = performance.now()
      const largeTable = new LiteTable({
        data: largeData,
        columns: mockColumns
      })
      largeTable.sortBy('name', 'asc')
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(1000) // Should complete in < 1s
    })

    it('should filter large dataset efficiently', () => {
      const largeData = generateUsers(10000)
      const largeTable = new LiteTable({
        data: largeData,
        columns: mockColumns
      })
      const startTime = performance.now()
      largeTable.search('John')
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(500) // Should complete in < 500ms
    })
  })
})
