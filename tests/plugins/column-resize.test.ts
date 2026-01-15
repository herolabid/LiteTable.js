import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  ColumnResizeManager,
  createResizeHandle,
  measureCellWidth,
} from '../../packages/core/src/plugins/column-resize'

describe('ColumnResizeManager', () => {
  let resizeManager: ColumnResizeManager
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    resizeManager = new ColumnResizeManager()

    // Spy on document event listeners
    addEventListenerSpy = vi.spyOn(document, 'addEventListener')
    removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

    // Mock document.body.style
    Object.defineProperty(document.body.style, 'userSelect', {
      writable: true,
      value: '',
    })
    Object.defineProperty(document.body.style, 'cursor', {
      writable: true,
      value: '',
    })
  })

  afterEach(() => {
    resizeManager.destroy()
  })

  describe('Initialization', () => {
    it('should initialize with default config', () => {
      expect(resizeManager).toBeDefined()
      const state = resizeManager.getState()
      expect(state.widths.size).toBe(0)
      expect(state.resizing).toBeNull()
    })

    it('should initialize with custom config', () => {
      const onResize = vi.fn()
      const customManager = new ColumnResizeManager({
        minWidth: 100,
        maxWidth: 500,
        autoFit: false,
        onResize,
      })

      expect(customManager).toBeDefined()
      customManager.destroy()
    })
  })

  describe('Column Width Management', () => {
    it('should set column width', () => {
      resizeManager.setColumnWidth('col1', 200)
      expect(resizeManager.getColumnWidth('col1')).toBe(200)
    })

    it('should get column width', () => {
      resizeManager.setColumnWidth('col1', 150)
      const width = resizeManager.getColumnWidth('col1')
      expect(width).toBe(150)
    })

    it('should return undefined for non-existent column', () => {
      const width = resizeManager.getColumnWidth('nonexistent')
      expect(width).toBeUndefined()
    })

    it('should constrain width to min value', () => {
      resizeManager = new ColumnResizeManager({ minWidth: 100 })
      resizeManager.setColumnWidth('col1', 50)
      expect(resizeManager.getColumnWidth('col1')).toBe(100)
    })

    it('should constrain width to max value', () => {
      resizeManager = new ColumnResizeManager({ maxWidth: 500 })
      resizeManager.setColumnWidth('col1', 1000)
      expect(resizeManager.getColumnWidth('col1')).toBe(500)
    })

    it('should reset column width', () => {
      resizeManager.setColumnWidth('col1', 200)
      resizeManager.resetColumnWidth('col1')
      expect(resizeManager.getColumnWidth('col1')).toBeUndefined()
    })

    it('should reset all widths', () => {
      resizeManager.setColumnWidth('col1', 200)
      resizeManager.setColumnWidth('col2', 300)
      resizeManager.resetAllWidths()

      expect(resizeManager.getColumnWidth('col1')).toBeUndefined()
      expect(resizeManager.getColumnWidth('col2')).toBeUndefined()
    })
  })

  describe('Resize Interaction', () => {
    it('should start resize', () => {
      resizeManager.startResize('col1', 100, 200)

      expect(resizeManager.isResizing('col1')).toBe(true)
      expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))
      expect(document.body.style.userSelect).toBe('none')
      expect(document.body.style.cursor).toBe('col-resize')
    })

    it('should check if resizing', () => {
      expect(resizeManager.isResizing()).toBe(false)
      resizeManager.startResize('col1', 100, 200)
      expect(resizeManager.isResizing()).toBe(true)
      expect(resizeManager.isResizing('col1')).toBe(true)
      expect(resizeManager.isResizing('col2')).toBe(false)
    })

    it('should update width during mouse move', () => {
      resizeManager.startResize('col1', 100, 200)

      // Simulate mouse move
      const mouseMoveEvent = new MouseEvent('mousemove', { clientX: 150 })
      document.dispatchEvent(mouseMoveEvent)

      // Width should have increased by 50 (150 - 100)
      expect(resizeManager.getColumnWidth('col1')).toBe(250)
    })

    it('should end resize on mouse up', () => {
      resizeManager.startResize('col1', 100, 200)

      // Simulate mouse up
      const mouseUpEvent = new MouseEvent('mouseup')
      document.dispatchEvent(mouseUpEvent)

      expect(resizeManager.isResizing()).toBe(false)
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))
      expect(document.body.style.userSelect).toBe('')
      expect(document.body.style.cursor).toBe('')
    })

    it('should call onResize callback after resize', () => {
      const onResize = vi.fn()
      resizeManager = new ColumnResizeManager({ onResize })

      resizeManager.startResize('col1', 100, 200)

      // Simulate mouse move to change width
      const mouseMoveEvent = new MouseEvent('mousemove', { clientX: 150 })
      document.dispatchEvent(mouseMoveEvent)

      // Simulate mouse up
      const mouseUpEvent = new MouseEvent('mouseup')
      document.dispatchEvent(mouseUpEvent)

      expect(onResize).toHaveBeenCalledWith('col1', 250)
    })

    it('should constrain width during drag', () => {
      resizeManager = new ColumnResizeManager({ minWidth: 100, maxWidth: 300 })
      resizeManager.startResize('col1', 100, 200)

      // Try to drag beyond max width
      const mouseMoveEvent = new MouseEvent('mousemove', { clientX: 500 })
      document.dispatchEvent(mouseMoveEvent)

      expect(resizeManager.getColumnWidth('col1')).toBe(300)
    })

    it('should not update if not actively resizing', () => {
      // Don't start resize
      const mouseMoveEvent = new MouseEvent('mousemove', { clientX: 150 })
      document.dispatchEvent(mouseMoveEvent)

      // Should not throw or update any width
      expect(resizeManager.getColumnWidth('col1')).toBeUndefined()
    })
  })

  describe('Auto-fit', () => {
    it('should auto-fit column to content width', () => {
      const cellWidths = [100, 120, 90, 110]
      resizeManager.autoFitColumn('col1', cellWidths)

      // Should use max width (120)
      expect(resizeManager.getColumnWidth('col1')).toBe(120)
    })

    it('should respect min width in auto-fit', () => {
      resizeManager = new ColumnResizeManager({ minWidth: 150 })
      const cellWidths = [100, 120, 90]

      resizeManager.autoFitColumn('col1', cellWidths)

      // Should use min width (150) since max cell width (120) is less
      expect(resizeManager.getColumnWidth('col1')).toBe(150)
    })

    it('should respect max width in auto-fit', () => {
      resizeManager = new ColumnResizeManager({ maxWidth: 200 })
      const cellWidths = [300, 350, 400]

      resizeManager.autoFitColumn('col1', cellWidths)

      // Should use max width (200) since max cell width exceeds it
      expect(resizeManager.getColumnWidth('col1')).toBe(200)
    })

    it('should not auto-fit if disabled', () => {
      resizeManager = new ColumnResizeManager({ autoFit: false })
      const cellWidths = [100, 120, 90]

      resizeManager.autoFitColumn('col1', cellWidths)

      expect(resizeManager.getColumnWidth('col1')).toBeUndefined()
    })

    it('should handle empty cell widths array', () => {
      resizeManager.autoFitColumn('col1', [])

      // Should fall back to minWidth
      expect(resizeManager.getColumnWidth('col1')).toBe(50)
    })
  })

  describe('State Management', () => {
    it('should return current state', () => {
      resizeManager.setColumnWidth('col1', 200)
      resizeManager.setColumnWidth('col2', 300)

      const state = resizeManager.getState()

      expect(state.widths.size).toBe(2)
      expect(state.widths.get('col1')).toBe(200)
      expect(state.widths.get('col2')).toBe(300)
      expect(state.resizing).toBeNull()
    })

    it('should return immutable state', () => {
      const state = resizeManager.getState()

      expect(() => {
        (state as any).resizing = 'col1'
      }).toThrow()
    })

    it('should return copied widths Map', () => {
      resizeManager.setColumnWidth('col1', 200)

      const state1 = resizeManager.getState()
      const state2 = resizeManager.getState()

      expect(state1.widths).not.toBe(state2.widths)
      expect(state1.widths.get('col1')).toBe(state2.widths.get('col1'))
    })

    it('should reflect resizing state during resize', () => {
      resizeManager.startResize('col1', 100, 200)

      const state = resizeManager.getState()
      expect(state.resizing).toBe('col1')
    })
  })

  describe('Event Listeners', () => {
    it('should allow subscribing to changes', () => {
      const listener = vi.fn()
      const unsubscribe = resizeManager.onChange(listener)

      resizeManager.setColumnWidth('col1', 200)

      expect(listener).toHaveBeenCalled()
      unsubscribe()
    })

    it('should emit to all listeners', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      resizeManager.onChange(listener1)
      resizeManager.onChange(listener2)

      resizeManager.setColumnWidth('col1', 200)

      expect(listener1).toHaveBeenCalled()
      expect(listener2).toHaveBeenCalled()
    })

    it('should allow unsubscribing', () => {
      const listener = vi.fn()
      const unsubscribe = resizeManager.onChange(listener)

      unsubscribe()
      resizeManager.setColumnWidth('col1', 200)

      expect(listener).not.toHaveBeenCalled()
    })

    it('should emit state changes during resize', () => {
      const listener = vi.fn()
      resizeManager.onChange(listener)

      resizeManager.startResize('col1', 100, 200)

      expect(listener).toHaveBeenCalled()
    })

    it('should emit state changes on reset', () => {
      const listener = vi.fn()
      resizeManager.setColumnWidth('col1', 200)

      resizeManager.onChange(listener)
      resizeManager.resetColumnWidth('col1')

      expect(listener).toHaveBeenCalled()
    })
  })

  describe('Cleanup', () => {
    it('should cleanup on destroy', () => {
      const listener = vi.fn()
      resizeManager.onChange(listener)
      resizeManager.setColumnWidth('col1', 200)

      resizeManager.destroy()

      resizeManager.setColumnWidth('col2', 300)
      expect(listener).not.toHaveBeenCalled()
    })

    it('should cleanup event listeners if resizing during destroy', () => {
      resizeManager.startResize('col1', 100, 200)
      resizeManager.destroy()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))
      expect(document.body.style.userSelect).toBe('')
      expect(document.body.style.cursor).toBe('')
    })

    it('should clear all widths on destroy', () => {
      resizeManager.setColumnWidth('col1', 200)
      resizeManager.setColumnWidth('col2', 300)

      resizeManager.destroy()

      const state = resizeManager.getState()
      expect(state.widths.size).toBe(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle multiple resize starts without end', () => {
      resizeManager.startResize('col1', 100, 200)
      resizeManager.startResize('col2', 200, 300)

      // Should be resizing col2 now
      expect(resizeManager.isResizing('col2')).toBe(true)
      expect(resizeManager.isResizing('col1')).toBe(false)
    })

    it('should handle mouse up without start resize', () => {
      const mouseUpEvent = new MouseEvent('mouseup')
      expect(() => document.dispatchEvent(mouseUpEvent)).not.toThrow()
    })

    it('should handle negative width values', () => {
      resizeManager.setColumnWidth('col1', -100)
      // Should be constrained to minWidth (50)
      expect(resizeManager.getColumnWidth('col1')).toBe(50)
    })

    it('should handle very large width values', () => {
      resizeManager.setColumnWidth('col1', 999999)
      // Should be constrained to maxWidth (1000)
      expect(resizeManager.getColumnWidth('col1')).toBe(1000)
    })

    it('should handle zero width', () => {
      resizeManager.setColumnWidth('col1', 0)
      // Should be constrained to minWidth (50)
      expect(resizeManager.getColumnWidth('col1')).toBe(50)
    })
  })

  describe('Multiple Columns', () => {
    it('should manage multiple column widths independently', () => {
      resizeManager.setColumnWidth('col1', 200)
      resizeManager.setColumnWidth('col2', 300)
      resizeManager.setColumnWidth('col3', 400)

      expect(resizeManager.getColumnWidth('col1')).toBe(200)
      expect(resizeManager.getColumnWidth('col2')).toBe(300)
      expect(resizeManager.getColumnWidth('col3')).toBe(400)
    })

    it('should reset specific column without affecting others', () => {
      resizeManager.setColumnWidth('col1', 200)
      resizeManager.setColumnWidth('col2', 300)

      resizeManager.resetColumnWidth('col1')

      expect(resizeManager.getColumnWidth('col1')).toBeUndefined()
      expect(resizeManager.getColumnWidth('col2')).toBe(300)
    })
  })

  describe('Performance', () => {
    it('should handle rapid resize updates efficiently', () => {
      resizeManager.startResize('col1', 100, 200)

      const startTime = performance.now()

      // Simulate 100 rapid mouse moves
      for (let i = 0; i < 100; i++) {
        const event = new MouseEvent('mousemove', { clientX: 100 + i })
        document.dispatchEvent(event)
      }

      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(100)
    })

    it('should handle many columns efficiently', () => {
      const startTime = performance.now()

      for (let i = 0; i < 1000; i++) {
        resizeManager.setColumnWidth(`col${i}`, 200 + i)
      }

      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(100)
      expect(resizeManager.getState().widths.size).toBe(1000)
    })
  })
})

describe('createResizeHandle', () => {
  it('should create resize handle element', () => {
    const handle = createResizeHandle()

    expect(handle).toBeInstanceOf(HTMLDivElement)
    expect(handle.className).toBe('column-resize-handle')
  })

  it('should create handle with custom class', () => {
    const handle = createResizeHandle({ className: 'custom-handle' })
    expect(handle.className).toBe('custom-handle')
  })

  it('should create handle with custom width', () => {
    const handle = createResizeHandle({ width: 12 })
    expect(handle.style.width).toBe('12px')
  })

  it('should have correct default styles', () => {
    const handle = createResizeHandle()

    expect(handle.style.position).toBe('absolute')
    expect(handle.style.cursor).toBe('col-resize')
    expect(handle.style.userSelect).toBe('none')
  })
})

describe('measureCellWidth', () => {
  it('should measure cell width', () => {
    const element = document.createElement('div')
    element.textContent = 'Test Content'
    document.body.appendChild(element)

    const width = measureCellWidth(element)

    expect(width).toBeGreaterThan(0)
    expect(typeof width).toBe('number')

    document.body.removeChild(element)
  })

  it('should handle empty cell', () => {
    const element = document.createElement('div')
    element.textContent = ''

    const width = measureCellWidth(element)

    expect(width).toBeGreaterThanOrEqual(0)
  })

  it('should clean up temporary elements', () => {
    const element = document.createElement('div')
    element.textContent = 'Test'

    const initialChildCount = document.body.children.length

    measureCellWidth(element)

    expect(document.body.children.length).toBe(initialChildCount)
  })
})
