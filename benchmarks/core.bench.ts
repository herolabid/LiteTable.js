/**
 * Performance Benchmarks for @litetable/core
 *
 * Tests core operations with various dataset sizes to ensure:
 * - Sub-millisecond operations for small datasets (< 100 rows)
 * - Linear time complexity O(n) for filtering
 * - O(n log n) for sorting
 * - O(1) for pagination
 */

import { describe, bench } from 'vitest'
import { LiteTable } from '../packages/core/src'

// ============================================
// Test Data Generators
// ============================================

interface User {
  id: number
  name: string
  email: string
  age: number
  country: string
  createdAt: Date
}

function generateUsers(count: number): User[] {
  const countries = ['USA', 'UK', 'Canada', 'Germany', 'France', 'Japan']
  const firstNames = [
    'John',
    'Jane',
    'Bob',
    'Alice',
    'Charlie',
    'Diana',
    'Eve',
    'Frank',
  ]
  const lastNames = [
    'Smith',
    'Johnson',
    'Williams',
    'Brown',
    'Jones',
    'Garcia',
    'Miller',
  ]

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
    email: `user${i + 1}@example.com`,
    age: 20 + (i % 50),
    country: countries[i % countries.length],
    createdAt: new Date(Date.now() - i * 86400000),
  }))
}

const columns = [
  { id: 'id', header: 'ID', sortable: true },
  { id: 'name', header: 'Name', sortable: true, filterable: true },
  { id: 'email', header: 'Email', sortable: true, filterable: true },
  { id: 'age', header: 'Age', sortable: true },
  { id: 'country', header: 'Country', sortable: true, filterable: true },
  { id: 'createdAt', header: 'Created', sortable: true },
]

// ============================================
// Benchmark: Table Initialization
// ============================================

describe('Table Initialization', () => {
  bench('Init with 100 rows', () => {
    const data = generateUsers(100)
    new LiteTable({ data, columns })
  })

  bench('Init with 1,000 rows', () => {
    const data = generateUsers(1000)
    new LiteTable({ data, columns })
  })

  bench('Init with 10,000 rows', () => {
    const data = generateUsers(10000)
    new LiteTable({ data, columns })
  })

  bench('Init with pagination (10,000 rows)', () => {
    const data = generateUsers(10000)
    new LiteTable({
      data,
      columns,
      pagination: { page: 1, pageSize: 25 },
    })
  })
})

// ============================================
// Benchmark: Sorting
// ============================================

describe('Sorting Performance', () => {
  bench('Sort 100 rows (string column)', () => {
    const data = generateUsers(100)
    const table = new LiteTable({ data, columns })
    table.sortBy('name', 'asc')
  })

  bench('Sort 1,000 rows (string column)', () => {
    const data = generateUsers(1000)
    const table = new LiteTable({ data, columns })
    table.sortBy('name', 'asc')
  })

  bench('Sort 10,000 rows (string column)', () => {
    const data = generateUsers(10000)
    const table = new LiteTable({ data, columns })
    table.sortBy('name', 'asc')
  })

  bench('Sort 10,000 rows (number column)', () => {
    const data = generateUsers(10000)
    const table = new LiteTable({ data, columns })
    table.sortBy('age', 'asc')
  })

  bench('Sort 10,000 rows (date column)', () => {
    const data = generateUsers(10000)
    const table = new LiteTable({ data, columns })
    table.sortBy('createdAt', 'desc')
  })

  bench('Re-sort already sorted data (10,000 rows)', () => {
    const data = generateUsers(10000)
    const table = new LiteTable({ data, columns })
    table.sortBy('name', 'asc')
    table.sortBy('name', 'desc') // Reverse sort
  })
})

// ============================================
// Benchmark: Filtering/Search
// ============================================

describe('Filtering Performance', () => {
  bench('Search 100 rows (term: "John")', () => {
    const data = generateUsers(100)
    const table = new LiteTable({ data, columns })
    table.search('John')
  })

  bench('Search 1,000 rows (term: "John")', () => {
    const data = generateUsers(1000)
    const table = new LiteTable({ data, columns })
    table.search('John')
  })

  bench('Search 10,000 rows (term: "John")', () => {
    const data = generateUsers(10000)
    const table = new LiteTable({ data, columns })
    table.search('John')
  })

  bench('Search 10,000 rows (term: "USA")', () => {
    const data = generateUsers(10000)
    const table = new LiteTable({ data, columns })
    table.search('USA')
  })

  bench('Clear search (10,000 rows)', () => {
    const data = generateUsers(10000)
    const table = new LiteTable({ data, columns })
    table.search('John')
    table.search('') // Clear
  })

  bench('Multiple searches on same instance (10,000 rows)', () => {
    const data = generateUsers(10000)
    const table = new LiteTable({ data, columns })
    table.search('John')
    table.search('Jane')
    table.search('USA')
    table.search('')
  })
})

// ============================================
// Benchmark: Pagination
// ============================================

describe('Pagination Performance', () => {
  bench('Paginate 10,000 rows (page 1, size 25)', () => {
    const data = generateUsers(10000)
    const table = new LiteTable({
      data,
      columns,
      pagination: { page: 1, pageSize: 25 },
    })
    table.getRows()
  })

  bench('Navigate to page 100 (10,000 rows, size 25)', () => {
    const data = generateUsers(10000)
    const table = new LiteTable({
      data,
      columns,
      pagination: { page: 1, pageSize: 25 },
    })
    table.goToPage(100)
  })

  bench('Change page size (10,000 rows)', () => {
    const data = generateUsers(10000)
    const table = new LiteTable({
      data,
      columns,
      pagination: { page: 1, pageSize: 25 },
    })
    table.setPageSize(50)
  })

  bench('Next/Prev page navigation (10,000 rows)', () => {
    const data = generateUsers(10000)
    const table = new LiteTable({
      data,
      columns,
      pagination: { page: 1, pageSize: 25 },
    })
    table.nextPage()
    table.nextPage()
    table.prevPage()
  })
})

// ============================================
// Benchmark: Combined Operations
// ============================================

describe('Combined Operations (Real-world scenarios)', () => {
  bench('Search + Sort + Paginate (10,000 rows)', () => {
    const data = generateUsers(10000)
    const table = new LiteTable({
      data,
      columns,
      pagination: { page: 1, pageSize: 25 },
    })
    table.search('John')
    table.sortBy('age', 'desc')
    table.goToPage(2)
  })

  bench('Multiple operations sequence (10,000 rows)', () => {
    const data = generateUsers(10000)
    const table = new LiteTable({
      data,
      columns,
      pagination: { page: 1, pageSize: 25 },
    })

    // Simulate user interactions
    table.search('USA')
    table.sortBy('name', 'asc')
    table.nextPage()
    table.nextPage()
    table.search('') // Clear search
    table.sortBy('age', 'desc')
    table.setPageSize(50)
  })

  bench('Reset after operations (10,000 rows)', () => {
    const data = generateUsers(10000)
    const table = new LiteTable({
      data,
      columns,
      pagination: { page: 1, pageSize: 25 },
    })

    table.search('USA')
    table.sortBy('name', 'asc')
    table.goToPage(5)
    table.reset() // Reset to initial state
  })
})

// ============================================
// Benchmark: Column Operations
// ============================================

describe('Column Operations', () => {
  bench('Toggle column visibility (10,000 rows)', () => {
    const data = generateUsers(10000)
    const table = new LiteTable({ data, columns })
    table.toggleColumn('email')
  })

  bench('Show/Hide multiple columns (10,000 rows)', () => {
    const data = generateUsers(10000)
    const table = new LiteTable({ data, columns })
    table.hideColumn('email')
    table.hideColumn('country')
    table.showColumn('email')
  })

  bench('Get visible columns (10,000 rows)', () => {
    const data = generateUsers(10000)
    const table = new LiteTable({ data, columns })
    table.hideColumn('email')
    table.hideColumn('country')
    table.getVisibleColumns()
  })
})

// ============================================
// Benchmark: Data Updates
// ============================================

describe('Data Updates', () => {
  bench('Update data (100 → 1,000 rows)', () => {
    const data = generateUsers(100)
    const table = new LiteTable({ data, columns })
    const newData = generateUsers(1000)
    table.setData(newData)
  })

  bench('Update data (1,000 → 10,000 rows)', () => {
    const data = generateUsers(1000)
    const table = new LiteTable({ data, columns })
    const newData = generateUsers(10000)
    table.setData(newData)
  })

  bench('Update data with existing sort/filter', () => {
    const data = generateUsers(1000)
    const table = new LiteTable({ data, columns })
    table.search('John')
    table.sortBy('age', 'desc')

    const newData = generateUsers(1000)
    table.setData(newData)
  })
})

// ============================================
// Benchmark: Memory & Cleanup
// ============================================

describe('Memory & Cleanup', () => {
  bench('Create and destroy instance (10,000 rows)', () => {
    const data = generateUsers(10000)
    const table = new LiteTable({ data, columns })
    table.destroy()
  })

  bench('Event listener overhead (10,000 rows)', () => {
    const data = generateUsers(10000)
    const table = new LiteTable({ data, columns })

    const listener = () => {
      // Empty listener
    }

    table.on('sort', listener)
    table.on('search', listener)
    table.on('paginate', listener)

    table.sortBy('name', 'asc')
    table.search('John')
    table.nextPage()

    table.destroy()
  })
})
