import { describe, it, expect, beforeEach } from 'vitest'
import { VirtualScrollManager, calculateVirtualScroll } from '../../packages/core/src/plugins/virtual-scroll'
import { generateUsers } from '../utils/mockData'

describe('VirtualScrollManager', () => {
  const largeDataset = generateUsers(10000)
  let virtualScroll: VirtualScrollManager<any>

  beforeEach(() => {
    virtualScroll = new VirtualScrollManager(largeDataset, {
      rowHeight: 48,
      containerHeight: 600,
      overscan: 5
    })
  })

  describe('Initialization', () => {
    it('should initialize with correct config', () => {
      expect(virtualScroll).toBeDefined()
    })

    it('should calculate visible rows correctly', () => {
      const visibleRows = virtualScroll.getVisibleRows()
      // Container 600px / 48px row = ~12 rows visible + overscan
      expect(visibleRows.length).toBeGreaterThan(10)
      expect(visibleRows.length).toBeLessThan(25)
    })

    it('should handle custom overscan', () => {
      const customVS = new VirtualScrollManager(largeDataset, {
        rowHeight: 48,
        containerHeight: 600,
        overscan: 20
      })
      const rows = customVS.getVisibleRows()
      expect(rows.length).toBeGreaterThan(virtualScroll.getVisibleRows().length)
    })
  })

  describe('Scrolling', () => {
    it('should update visible rows on scroll', () => {
      const initialRows = virtualScroll.getVisibleRows()
      virtualScroll.handleScroll(500)
      const scrolledRows = virtualScroll.getVisibleRows()

      expect(initialRows[0].id).not.toBe(scrolledRows[0].id)
    })

    it('should handle scroll to bottom', () => {
      const maxScroll = largeDataset.length * 48 - 600
      virtualScroll.handleScroll(maxScroll)
      const rows = virtualScroll.getVisibleRows()
      expect(rows[rows.length - 1]).toBeDefined()
    })

    it('should handle scroll to top', () => {
      virtualScroll.handleScroll(5000)
      virtualScroll.handleScroll(0)
      const rows = virtualScroll.getVisibleRows()
      expect(rows[0].id).toBe(largeDataset[0].id)
    })

    it('should handle rapid scrolling', () => {
      for (let i = 0; i < 100; i++) {
        virtualScroll.handleScroll(i * 100)
      }
      expect(virtualScroll.getVisibleRows()).toBeDefined()
    })
  })

  describe('Configuration', () => {
    it('should update row height', () => {
      virtualScroll.updateConfig({ rowHeight: 60 })
      const rows = virtualScroll.getVisibleRows()
      expect(rows.length).toBeLessThan(15) // Fewer rows fit with taller height
    })

    it('should update container height', () => {
      virtualScroll.updateConfig({ containerHeight: 1200 })
      const rows = virtualScroll.getVisibleRows()
      expect(rows.length).toBeGreaterThan(20) // More rows fit in taller container
    })

    it('should update overscan', () => {
      const initialLength = virtualScroll.getVisibleRows().length
      virtualScroll.updateConfig({ overscan: 20 })
      const newLength = virtualScroll.getVisibleRows().length
      expect(newLength).toBeGreaterThan(initialLength)
    })
  })

  describe('State', () => {
    it('should return scroll state', () => {
      virtualScroll.handleScroll(1000)
      const state = virtualScroll.getState()
      expect(state.scrollTop).toBe(1000)
      expect(state.startIndex).toBeGreaterThan(0)
      expect(state.endIndex).toBeGreaterThan(state.startIndex)
    })

    it('should calculate virtual height', () => {
      const state = virtualScroll.getState()
      const expectedHeight = largeDataset.length * 48
      expect(state.virtualHeight).toBe(expectedHeight)
    })

    it('should calculate offset correctly', () => {
      virtualScroll.handleScroll(1000)
      const state = virtualScroll.getState()
      expect(state.offsetY).toBeGreaterThan(0)
    })
  })

  describe('Performance', () => {
    it('should handle 100k rows efficiently', () => {
      const massiveDataset = generateUsers(100000)
      const startTime = performance.now()
      const massiveVS = new VirtualScrollManager(massiveDataset, {
        rowHeight: 48,
        containerHeight: 600
      })
      massiveVS.handleScroll(5000)
      const rows = massiveVS.getVisibleRows()
      const endTime = performance.now()

      expect(rows).toBeDefined()
      expect(endTime - startTime).toBeLessThan(100) // Should be instant
    })

    it('should maintain O(1) rendering complexity', () => {
      const data1k = generateUsers(1000)
      const data100k = generateUsers(100000)

      const start1k = performance.now()
      const vs1k = new VirtualScrollManager(data1k, {
        rowHeight: 48,
        containerHeight: 600
      })
      vs1k.getVisibleRows()
      const time1k = performance.now() - start1k

      const start100k = performance.now()
      const vs100k = new VirtualScrollManager(data100k, {
        rowHeight: 48,
        containerHeight: 600
      })
      vs100k.getVisibleRows()
      const time100k = performance.now() - start100k

      // Time should not increase linearly with data size
      expect(time100k / time1k).toBeLessThan(10)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty dataset', () => {
      const emptyVS = new VirtualScrollManager([], {
        rowHeight: 48,
        containerHeight: 600
      })
      expect(emptyVS.getVisibleRows()).toHaveLength(0)
    })

    it('should handle single row', () => {
      const singleVS = new VirtualScrollManager([largeDataset[0]], {
        rowHeight: 48,
        containerHeight: 600
      })
      expect(singleVS.getVisibleRows()).toHaveLength(1)
    })

    it('should handle container smaller than row', () => {
      const smallVS = new VirtualScrollManager(largeDataset, {
        rowHeight: 100,
        containerHeight: 50
      })
      expect(smallVS.getVisibleRows().length).toBeGreaterThan(0)
    })

    it('should handle negative scroll', () => {
      expect(() => virtualScroll.handleScroll(-100)).not.toThrow()
      const rows = virtualScroll.getVisibleRows()
      expect(rows[0].id).toBe(largeDataset[0].id)
    })

    it('should handle excessive scroll', () => {
      const maxScroll = largeDataset.length * 48 * 10 // Way beyond end
      expect(() => virtualScroll.handleScroll(maxScroll)).not.toThrow()
    })
  })

  describe('Helper Functions', () => {
    it('calculateVirtualScroll should return correct values', () => {
      const result = calculateVirtualScroll({
        scrollTop: 1000,
        rowHeight: 48,
        containerHeight: 600,
        totalRows: 10000,
        overscan: 5
      })

      expect(result.startIndex).toBeGreaterThanOrEqual(0)
      expect(result.endIndex).toBeGreaterThan(result.startIndex)
      expect(result.offsetY).toBeGreaterThanOrEqual(0)
    })

    it('should handle zero scroll', () => {
      const result = calculateVirtualScroll({
        scrollTop: 0,
        rowHeight: 48,
        containerHeight: 600,
        totalRows: 100,
        overscan: 5
      })

      expect(result.startIndex).toBe(0)
      expect(result.offsetY).toBe(0)
    })
  })

  describe('Data Updates', () => {
    it('should update data and maintain scroll position', () => {
      virtualScroll.handleScroll(1000)
      const newData = generateUsers(5000)
      virtualScroll.updateData(newData)
      const rows = virtualScroll.getVisibleRows()
      expect(rows).toBeDefined()
      expect(rows.length).toBeGreaterThan(0)
    })

    it('should handle data size reduction', () => {
      virtualScroll.handleScroll(9000)
      const smallData = generateUsers(100)
      virtualScroll.updateData(smallData)
      const rows = virtualScroll.getVisibleRows()
      expect(rows).toBeDefined()
    })
  })
})
