/**
 * React Example - LiteTable
 *
 * Clean, minimal example demonstrating all features
 */

import { useState } from 'react'
import { useLiteTable, useDebouncedSearch } from '@litetable/react'
import type { Column } from '@litetable/react'
import './App.css'

// Sample data type
interface User {
  id: number
  name: string
  email: string
  role: string
  status: 'active' | 'inactive'
  joinedAt: Date
}

// Sample data
const sampleUsers: User[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    status: 'active',
    joinedAt: new Date('2024-01-15'),
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'User',
    status: 'active',
    joinedAt: new Date('2024-02-20'),
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'User',
    status: 'inactive',
    joinedAt: new Date('2024-03-10'),
  },
  {
    id: 4,
    name: 'Alice Williams',
    email: 'alice@example.com',
    role: 'Editor',
    status: 'active',
    joinedAt: new Date('2024-01-05'),
  },
  {
    id: 5,
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    role: 'User',
    status: 'active',
    joinedAt: new Date('2024-04-12'),
  },
]

function App() {
  const [data, setData] = useState<User[]>(sampleUsers)

  // Define columns
  const columns: Column<User>[] = [
    {
      id: 'id',
      header: 'ID',
      sortable: true,
      width: '60px',
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

  // Initialize table with pagination
  const table = useLiteTable<User>({
    data,
    columns,
    pagination: {
      page: 1,
      pageSize: 3,
      pageSizeOptions: [3, 5, 10],
    },
    searchable: true,
  })

  // Debounced search
  const [searchValue, setSearchValue] = useDebouncedSearch(table.search, 300)

  // Sort indicator
  const getSortIcon = (columnId: string) => {
    if (table.sortState.columnId !== columnId) return '⇅'
    return table.sortState.direction === 'asc' ? '↑' : '↓'
  }

  return (
    <div className="app">
      <h1>🚀 LiteTable.js - React Example</h1>
      <p className="subtitle">
        Lightweight, performant, framework-agnostic table library
      </p>

      <div className="controls">
        {/* Search */}
        <div className="search-box">
          <input
            type="search"
            placeholder="Search users..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Column toggles */}
        <div className="column-toggles">
          <span>Columns: </span>
          {columns.map((col) => (
            <label key={col.id} className="checkbox-label">
              <input
                type="checkbox"
                checked={!table.hiddenColumns.has(col.id)}
                onChange={() => table.toggleColumn(col.id)}
              />
              {col.header}
            </label>
          ))}
        </div>

        {/* Reset */}
        <button onClick={table.reset} className="btn-reset">
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="lite-table">
          <thead>
            <tr>
              {table.visibleColumns.map((column) => (
                <th
                  key={column.id}
                  style={{
                    width: column.width,
                    textAlign: column.align || 'left',
                  }}
                  className={column.sortable ? 'sortable' : ''}
                  onClick={() =>
                    column.sortable && table.sortBy(column.id)
                  }
                >
                  {column.header}
                  {column.sortable && (
                    <span className="sort-icon">
                      {getSortIcon(column.id)}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.length === 0 ? (
              <tr>
                <td colSpan={table.visibleColumns.length} className="no-data">
                  No users found
                </td>
              </tr>
            ) : (
              table.rows.map((row) => (
                <tr key={row.id}>
                  {table.visibleColumns.map((column) => {
                    const value = column.accessor
                      ? column.accessor(row)
                      : (row as Record<string, unknown>)[column.id]

                    return (
                      <td
                        key={column.id}
                        style={{ textAlign: column.align || 'left' }}
                      >
                        {column.cell ? column.cell(value, row) : String(value)}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {table.paginationState && (
        <div className="pagination">
          <div className="pagination-info">
            Showing {table.paginationState.startIndex + 1} to{' '}
            {table.paginationState.endIndex} of{' '}
            {table.paginationState.totalRows} users
          </div>

          <div className="pagination-controls">
            <button
              onClick={table.prevPage}
              disabled={!table.paginationState.hasPrevPage}
              className="btn-page"
            >
              Previous
            </button>

            <span className="page-indicator">
              Page {table.paginationState.page} of{' '}
              {table.paginationState.totalPages}
            </span>

            <button
              onClick={table.nextPage}
              disabled={!table.paginationState.hasNextPage}
              className="btn-page"
            >
              Next
            </button>
          </div>

          <div className="page-size">
            <label>
              Rows per page:
              <select
                value={table.paginationState.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="select-page-size"
              >
                {table.paginationState.pageSizeOptions?.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stats">
        <div className="stat-item">
          <strong>Sort:</strong>{' '}
          {table.sortState.columnId
            ? `${table.sortState.columnId} (${table.sortState.direction})`
            : 'None'}
        </div>
        <div className="stat-item">
          <strong>Search:</strong> {table.searchTerm || 'None'}
        </div>
        <div className="stat-item">
          <strong>Filtered rows:</strong> {table.allRows.length}
        </div>
      </div>
    </div>
  )
}

export default App
