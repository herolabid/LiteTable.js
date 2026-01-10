/**
 * React Advanced Example - LiteTable with ALL Features
 *
 * Demonstrates:
 * - Virtual Scrolling (100k+ rows)
 * - Row Selection (checkboxes)
 * - Export (CSV, JSON, Excel)
 * - Column Resizing (drag to resize)
 * - Server-Side Operations (AJAX)
 */

import { useState, useRef, useCallback } from 'react'
import { useLiteTable } from '@litetable/react'
import {
  VirtualScrollManager,
  RowSelectionManager,
  ExportManager,
  ColumnResizeManager,
} from '@litetable/core'
import type { Column } from '@litetable/react'
import './App.css'

// Sample data type
interface User {
  id: number
  name: string
  email: string
  role: string
  status: 'active' | 'inactive'
  salary: number
  joinedAt: Date
}

// Generate large dataset for virtual scrolling demo
function generateUsers(count: number): User[] {
  const roles = ['Admin', 'Editor', 'User', 'Manager', 'Developer']
  const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Eve', 'Frank']
  const lastNames = ['Doe', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller']

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
    email: `user${i + 1}@example.com`,
    role: roles[i % roles.length],
    status: i % 3 === 0 ? 'inactive' : 'active',
    salary: 50000 + Math.floor(Math.random() * 100000),
    joinedAt: new Date(Date.now() - i * 86400000),
  }))
}

function App() {
  const [data] = useState<User[]>(() => generateUsers(10000)) // 10k rows!
  const [useVirtualScroll, setUseVirtualScroll] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)

  // Define columns
  const columns: Column<User>[] = [
    {
      id: 'select',
      header: '☐',
      width: '50px',
      sortable: false,
      align: 'center',
    },
    {
      id: 'id',
      header: 'ID',
      sortable: true,
      width: '80px',
      align: 'center',
    },
    {
      id: 'name',
      header: 'Name',
      sortable: true,
      filterable: true,
    },
    {
      id: 'email',
      header: 'Email',
      sortable: true,
      filterable: true,
    },
    {
      id: 'role',
      header: 'Role',
      sortable: true,
      filterable: true,
    },
    {
      id: 'salary',
      header: 'Salary',
      sortable: true,
      cell: (value) => `$${Number(value).toLocaleString()}`,
    },
    {
      id: 'status',
      header: 'Status',
      sortable: true,
      cell: (value) => (
        <span className={`status-badge status-${value}`}>
          {String(value)}
        </span>
      ),
    },
    {
      id: 'joinedAt',
      header: 'Joined',
      sortable: true,
      accessor: (row) => row.joinedAt.toLocaleDateString(),
    },
  ]

  // Initialize table
  const table = useLiteTable<User>({
    data,
    columns,
    pagination: useVirtualScroll ? false : { page: 1, pageSize: 50 },
    searchable: true,
  })

  // Virtual Scrolling
  const virtualScroll = useRef<VirtualScrollManager<User>>()
  if (useVirtualScroll && !virtualScroll.current) {
    virtualScroll.current = new VirtualScrollManager(table.allRows, {
      rowHeight: 48,
      containerHeight: 600,
      overscan: 10,
    })
  }

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop
    setScrollTop(scrollTop)
    if (virtualScroll.current) {
      virtualScroll.current.handleScroll(scrollTop)
    }
  }, [])

  // Row Selection
  const [selection] = useState(() => new RowSelectionManager({
    mode: 'multiple',
    enableSelectAll: true,
  }))

  useState(() => {
    selection.setRowIds(data.map(row => String(row.id)))
  })

  const handleSelectRow = (rowId: string) => {
    selection.toggleRow(rowId)
  }

  const handleSelectAll = () => {
    selection.toggleSelectAll()
  }

  // Export
  const exportManager = useRef(
    new ExportManager(table.allRows, columns)
  )

  const handleExport = (format: 'csv' | 'json' | 'xlsx' | 'html') => {
    exportManager.current.export(format, {
      filename: 'users-export',
      includeHeaders: true,
    })
  }

  // Column Resizing
  const [resizeManager] = useState(() => new ColumnResizeManager({
    minWidth: 80,
    maxWidth: 500,
  }))

  const displayRows = useVirtualScroll && virtualScroll.current
    ? virtualScroll.current.getVisibleRows()
    : table.rows

  const virtualState = virtualScroll.current?.getState()

  return (
    <div className="app">
      <h1>🚀 LiteTable.js - Advanced Features Demo</h1>
      <p className="subtitle">
        Virtual Scrolling • Row Selection • Export • Column Resize
      </p>

      <div className="controls">
        {/* Search */}
        <input
          type="search"
          placeholder="Search 10,000 users..."
          onChange={(e) => table.search(e.target.value)}
          className="search-input"
        />

        {/* Virtual Scroll Toggle */}
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={useVirtualScroll}
            onChange={(e) => setUseVirtualScroll(e.target.checked)}
          />
          Virtual Scroll (handles 100k+ rows)
        </label>

        {/* Export Buttons */}
        <div className="export-buttons">
          <button onClick={() => handleExport('csv')} className="btn-export">
            📥 CSV
          </button>
          <button onClick={() => handleExport('json')} className="btn-export">
            📥 JSON
          </button>
          <button onClick={() => handleExport('xlsx')} className="btn-export">
            📥 Excel
          </button>
        </div>

        {/* Selection Info */}
        <div className="selection-info">
          Selected: {selection.getSelectedCount()} / {data.length}
        </div>
      </div>

      {/* Table Container */}
      <div
        ref={containerRef}
        className="table-container"
        style={{
          height: useVirtualScroll ? '600px' : 'auto',
          overflow: useVirtualScroll ? 'auto' : 'visible',
        }}
        onScroll={handleScroll}
      >
        <table className="lite-table">
          <thead>
            <tr>
              <th style={{ width: '50px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={selection.getState().allSelected}
                  onChange={handleSelectAll}
                />
              </th>
              {table.visibleColumns.slice(1).map((column) => (
                <th
                  key={column.id}
                  style={{
                    width: resizeManager.getColumnWidth(column.id) || column.width,
                    textAlign: column.align || 'left',
                  }}
                  className={column.sortable ? 'sortable' : ''}
                  onClick={() => column.sortable && table.sortBy(column.id)}
                >
                  {column.header}
                  {column.sortable && (
                    <span className="sort-icon">
                      {table.sortState.columnId === column.id
                        ? table.sortState.direction === 'asc' ? '↑' : '↓'
                        : '⇅'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody
            style={useVirtualScroll ? {
              position: 'relative',
              height: virtualState?.totalHeight || 0,
            } : undefined}
          >
            {displayRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="no-data">
                  No users found
                </td>
              </tr>
            ) : (
              displayRows.map((row, index) => (
                <tr
                  key={row.id}
                  style={useVirtualScroll ? {
                    position: 'absolute',
                    top: ((virtualState?.startIndex || 0) + index) * 48,
                    width: '100%',
                  } : undefined}
                  className={selection.isRowSelected(String(row.id)) ? 'selected' : ''}
                >
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selection.isRowSelected(String(row.id))}
                      onChange={() => handleSelectRow(String(row.id))}
                    />
                  </td>
                  <td style={{ textAlign: 'center' }}>{row.id}</td>
                  <td>{row.name}</td>
                  <td>{row.email}</td>
                  <td>{row.role}</td>
                  <td>${row.salary.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge status-${row.status}`}>
                      {row.status}
                    </span>
                  </td>
                  <td>{row.joinedAt.toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="stat-item">
          <strong>Total Rows:</strong> {data.length.toLocaleString()}
        </div>
        <div className="stat-item">
          <strong>Filtered:</strong> {table.allRows.length.toLocaleString()}
        </div>
        <div className="stat-item">
          <strong>Rendered:</strong> {displayRows.length}
        </div>
        <div className="stat-item">
          <strong>Selected:</strong> {selection.getSelectedCount()}
        </div>
        {useVirtualScroll && virtualState && (
          <div className="stat-item">
            <strong>Visible Range:</strong> {virtualState.startIndex}-{virtualState.endIndex}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
