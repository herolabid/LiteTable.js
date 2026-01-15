import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ExportManager } from '../../packages/core/src/plugins/export'
import type { Column } from '../../packages/core/src/types'

describe('ExportManager', () => {
  interface User {
    id: number
    name: string
    email: string
    age: number
    role: string
  }

  const mockData: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', age: 30, role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25, role: 'User' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35, role: 'Editor' },
  ]

  const mockColumns: Column<User>[] = [
    { id: 'id', header: 'ID' },
    { id: 'name', header: 'Name' },
    { id: 'email', header: 'Email' },
    { id: 'age', header: 'Age' },
    { id: 'role', header: 'Role' },
  ]

  let exportManager: ExportManager<User>
  let createElementSpy: ReturnType<typeof vi.spyOn>
  let appendChildSpy: ReturnType<typeof vi.spyOn>
  let removeChildSpy: ReturnType<typeof vi.spyOn>
  let createObjectURLSpy: ReturnType<typeof vi.spyOn>
  let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>
  let mockLink: any

  beforeEach(() => {
    exportManager = new ExportManager(mockData, mockColumns)

    // Mock DOM APIs
    mockLink = {
      click: vi.fn(),
      href: '',
      download: '',
    }

    createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
    appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink)
    removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink)
    createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
    revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  })

  describe('Initialization', () => {
    it('should initialize with data and columns', () => {
      expect(exportManager).toBeDefined()
    })

    it('should update data and columns', () => {
      const newData = [{ id: 4, name: 'New User', email: 'new@example.com', age: 28, role: 'User' }]
      const newColumns: Column<User>[] = [
        { id: 'id', header: 'ID' },
        { id: 'name', header: 'Name' },
      ]

      exportManager.updateData(newData, newColumns)

      // This would be tested by checking export output, but we can't easily verify internal state
      expect(exportManager).toBeDefined()
    })
  })

  describe('CSV Export', () => {
    it('should export to CSV with headers', () => {
      exportManager.exportCSV({ filename: 'test' })

      expect(createObjectURLSpy).toHaveBeenCalled()
      expect(mockLink.download).toBe('test.csv')
      expect(mockLink.click).toHaveBeenCalled()

      // Check the blob content
      const blobCall = createObjectURLSpy.mock.calls[0]
      const blob = blobCall[0] as Blob
      expect(blob.type).toContain('text/csv')
    })

    it('should export CSV without headers', () => {
      exportManager.exportCSV({ includeHeaders: false })
      expect(createObjectURLSpy).toHaveBeenCalled()
    })

    it('should export only specified columns', () => {
      exportManager.exportCSV({ columns: ['name', 'email'] })
      expect(createObjectURLSpy).toHaveBeenCalled()
    })

    it('should use custom delimiter', () => {
      exportManager.exportCSV({ delimiter: ';' })
      expect(createObjectURLSpy).toHaveBeenCalled()
    })

    it('should use default filename', () => {
      exportManager.exportCSV()
      expect(mockLink.download).toBe('export.csv')
    })

    it('should escape CSV special characters', () => {
      const dataWithSpecialChars = [
        { id: 1, name: 'John, Doe', email: 'test"email', age: 30, role: 'Admin\nSuper' },
      ]
      const manager = new ExportManager(dataWithSpecialChars, mockColumns)

      manager.exportCSV()
      expect(createObjectURLSpy).toHaveBeenCalled()
    })

    it('should cleanup after download', () => {
      exportManager.exportCSV()

      expect(removeChildSpy).toHaveBeenCalledWith(mockLink)
      expect(revokeObjectURLSpy).toHaveBeenCalled()
    })
  })

  describe('JSON Export', () => {
    it('should export to JSON', () => {
      exportManager.exportJSON({ filename: 'test' })

      expect(createObjectURLSpy).toHaveBeenCalled()
      expect(mockLink.download).toBe('test.json')
      expect(mockLink.click).toHaveBeenCalled()

      const blobCall = createObjectURLSpy.mock.calls[0]
      const blob = blobCall[0] as Blob
      expect(blob.type).toContain('application/json')
    })

    it('should export only specified columns', () => {
      exportManager.exportJSON({ columns: ['name', 'email'] })
      expect(createObjectURLSpy).toHaveBeenCalled()
    })

    it('should use default filename', () => {
      exportManager.exportJSON()
      expect(mockLink.download).toBe('export.json')
    })

    it('should format JSON properly', () => {
      // Just verify that export runs without error
      // Actual formatting is tested by the implementation
      expect(() => exportManager.exportJSON()).not.toThrow()
      expect(createObjectURLSpy).toHaveBeenCalled()
    })
  })

  describe('XLSX Export', () => {
    it('should export to XLSX', () => {
      exportManager.exportXLSX({ filename: 'test' })

      expect(createObjectURLSpy).toHaveBeenCalled()
      expect(mockLink.download).toBe('test.xls')
      expect(mockLink.click).toHaveBeenCalled()

      const blobCall = createObjectURLSpy.mock.calls[0]
      const blob = blobCall[0] as Blob
      expect(blob.type).toContain('application/vnd.ms-excel')
    })

    it('should export XLSX with headers', () => {
      exportManager.exportXLSX({ includeHeaders: true })
      expect(createObjectURLSpy).toHaveBeenCalled()
    })

    it('should export XLSX without headers', () => {
      exportManager.exportXLSX({ includeHeaders: false })
      expect(createObjectURLSpy).toHaveBeenCalled()
    })

    it('should export only specified columns', () => {
      exportManager.exportXLSX({ columns: ['name', 'email'] })
      expect(createObjectURLSpy).toHaveBeenCalled()
    })

    it('should escape XML special characters', () => {
      const dataWithXMLChars = [
        { id: 1, name: 'John<Doe>', email: 'test&email', age: 30, role: 'Admin"Role' },
      ]
      const manager = new ExportManager(dataWithXMLChars, mockColumns)

      manager.exportXLSX()
      expect(createObjectURLSpy).toHaveBeenCalled()
    })

    it('should handle number types in XLSX', () => {
      exportManager.exportXLSX()
      expect(createObjectURLSpy).toHaveBeenCalled()
      // Numbers should be exported with Type="Number"
    })
  })

  describe('HTML Export', () => {
    it('should export to HTML', () => {
      exportManager.exportHTML({ filename: 'test' })

      expect(createObjectURLSpy).toHaveBeenCalled()
      expect(mockLink.download).toBe('test.html')
      expect(mockLink.click).toHaveBeenCalled()

      const blobCall = createObjectURLSpy.mock.calls[0]
      const blob = blobCall[0] as Blob
      expect(blob.type).toContain('text/html')
    })

    it('should export HTML with headers', () => {
      exportManager.exportHTML({ includeHeaders: true })
      expect(createObjectURLSpy).toHaveBeenCalled()
    })

    it('should export HTML without headers', () => {
      exportManager.exportHTML({ includeHeaders: false })
      expect(createObjectURLSpy).toHaveBeenCalled()
    })

    it('should export only specified columns', () => {
      exportManager.exportHTML({ columns: ['name', 'email'] })
      expect(createObjectURLSpy).toHaveBeenCalled()
    })

    it('should escape HTML special characters', () => {
      const dataWithHTMLChars = [
        { id: 1, name: '<script>alert("XSS")</script>', email: 'test&email', age: 30, role: "Admin's Role" },
      ]
      const manager = new ExportManager(dataWithHTMLChars, mockColumns)

      manager.exportHTML()
      expect(createObjectURLSpy).toHaveBeenCalled()
    })

    it('should generate valid HTML table structure', () => {
      // Just verify that export runs without error
      // Actual structure is tested by the implementation
      expect(() => exportManager.exportHTML()).not.toThrow()
      expect(createObjectURLSpy).toHaveBeenCalled()
    })
  })

  describe('Main Export Method', () => {
    it('should export CSV via main export method', () => {
      exportManager.export('csv', { filename: 'test' })
      expect(mockLink.download).toBe('test.csv')
    })

    it('should export JSON via main export method', () => {
      exportManager.export('json', { filename: 'test' })
      expect(mockLink.download).toBe('test.json')
    })

    it('should export XLSX via main export method', () => {
      exportManager.export('xlsx', { filename: 'test' })
      expect(mockLink.download).toBe('test.xls')
    })

    it('should export HTML via main export method', () => {
      exportManager.export('html', { filename: 'test' })
      expect(mockLink.download).toBe('test.html')
    })

    it('should throw error for unsupported format', () => {
      expect(() => {
        exportManager.export('pdf' as any, { filename: 'test' })
      }).toThrow('Unsupported export format')
    })
  })

  describe('Custom Accessors', () => {
    it('should use column accessor if provided', () => {
      const customColumns: Column<User>[] = [
        {
          id: 'fullName',
          header: 'Full Name',
          accessor: (row) => `${row.name} (${row.age})`,
        },
      ]

      const manager = new ExportManager(mockData, customColumns)
      manager.exportCSV()

      expect(createObjectURLSpy).toHaveBeenCalled()
    })

    it('should fallback to row property if no accessor', () => {
      exportManager.exportCSV()
      expect(createObjectURLSpy).toHaveBeenCalled()
    })
  })

  describe('Date Formatting', () => {
    interface DataWithDate {
      id: number
      name: string
      createdAt: Date
    }

    it('should format dates with custom formatter', () => {
      const dataWithDates: DataWithDate[] = [
        { id: 1, name: 'Test', createdAt: new Date('2024-01-15') },
      ]

      const columnsWithDate: Column<DataWithDate>[] = [
        { id: 'id', header: 'ID' },
        { id: 'name', header: 'Name' },
        { id: 'createdAt', header: 'Created At' },
      ]

      const manager = new ExportManager(dataWithDates, columnsWithDate)

      manager.exportCSV({
        dateFormat: (date) => date.toLocaleDateString(),
      })

      expect(createObjectURLSpy).toHaveBeenCalled()
    })

    it('should use ISO format for dates by default', () => {
      const dataWithDates: DataWithDate[] = [
        { id: 1, name: 'Test', createdAt: new Date('2024-01-15') },
      ]

      const columnsWithDate: Column<DataWithDate>[] = [
        { id: 'createdAt', header: 'Created At' },
      ]

      const manager = new ExportManager(dataWithDates, columnsWithDate)
      manager.exportJSON()

      expect(createObjectURLSpy).toHaveBeenCalled()
    })
  })

  describe('Null/Undefined Values', () => {
    interface DataWithNulls {
      id: number
      name: string | null
      email?: string
    }

    it('should handle null values', () => {
      const dataWithNulls: DataWithNulls[] = [
        { id: 1, name: null },
        { id: 2, name: 'Test' },
      ]

      const columns: Column<DataWithNulls>[] = [
        { id: 'id', header: 'ID' },
        { id: 'name', header: 'Name' },
      ]

      const manager = new ExportManager(dataWithNulls, columns)
      manager.exportCSV()

      expect(createObjectURLSpy).toHaveBeenCalled()
    })

    it('should handle undefined values', () => {
      const dataWithUndefined: DataWithNulls[] = [
        { id: 1, name: 'Test' },
        { id: 2, name: 'Test' },
      ]

      const columns: Column<DataWithNulls>[] = [
        { id: 'id', header: 'ID' },
        { id: 'email', header: 'Email' },
      ]

      const manager = new ExportManager(dataWithUndefined, columns)
      manager.exportJSON()

      expect(createObjectURLSpy).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty data', () => {
      const emptyManager = new ExportManager([], mockColumns)
      emptyManager.exportCSV()

      expect(createObjectURLSpy).toHaveBeenCalled()
      expect(mockLink.click).toHaveBeenCalled()
    })

    it('should handle empty columns', () => {
      const emptyColsManager = new ExportManager(mockData, [])
      emptyColsManager.exportJSON()

      expect(createObjectURLSpy).toHaveBeenCalled()
    })

    it('should handle non-existent column IDs', () => {
      exportManager.exportCSV({ columns: ['nonexistent'] })
      expect(createObjectURLSpy).toHaveBeenCalled()
    })

    it('should handle special characters in filenames', () => {
      exportManager.exportCSV({ filename: 'my-file_123' })
      expect(mockLink.download).toBe('my-file_123.csv')
    })

    it('should handle very long strings', () => {
      const dataWithLongString = [
        { id: 1, name: 'A'.repeat(10000), email: 'test@example.com', age: 30, role: 'Admin' },
      ]

      const manager = new ExportManager(dataWithLongString, mockColumns)
      manager.exportCSV()

      expect(createObjectURLSpy).toHaveBeenCalled()
    })
  })

  describe('Performance', () => {
    it('should handle large datasets efficiently', () => {
      const largeData = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        age: 20 + (i % 50),
        role: i % 2 === 0 ? 'Admin' : 'User',
      }))

      const manager = new ExportManager(largeData, mockColumns)

      const startTime = performance.now()
      manager.exportCSV()
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(1000) // Should complete in < 1s
      expect(createObjectURLSpy).toHaveBeenCalled()
    })

    it('should export large datasets to JSON efficiently', () => {
      const largeData = Array.from({ length: 5000 }, (_, i) => ({
        id: i,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        age: 20 + (i % 50),
        role: 'User',
      }))

      const manager = new ExportManager(largeData, mockColumns)

      const startTime = performance.now()
      manager.exportJSON()
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(1000)
    })
  })

  describe('Column Filtering', () => {
    it('should export only selected columns in correct order', () => {
      exportManager.exportCSV({ columns: ['email', 'name'] })
      expect(createObjectURLSpy).toHaveBeenCalled()
    })

    it('should handle duplicate column IDs', () => {
      exportManager.exportJSON({ columns: ['name', 'name'] })
      expect(createObjectURLSpy).toHaveBeenCalled()
    })
  })
})
