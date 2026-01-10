# @litetable/core

> Framework-agnostic table library core - The engine behind LiteTable.js

[![npm version](https://img.shields.io/npm/v/@litetable/core.svg)](https://www.npmjs.com/package/@litetable/core)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@litetable/core)](https://bundlephobia.com/package/@litetable/core)

## Installation

```bash
npm install @litetable/core
```

## What is this?

`@litetable/core` is the **headless core** of LiteTable.js. It provides:
- ✅ Table state management
- ✅ Sorting, filtering, pagination logic
- ✅ Event system for reactive updates
- ✅ Full TypeScript support
- ✅ **Zero dependencies**
- ✅ **~8KB minified + gzipped**

## Usage

### Basic Example

```typescript
import { LiteTable } from '@litetable/core'

interface User {
  id: number
  name: string
  email: string
}

const users: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
]

const table = new LiteTable<User>({
  data: users,
  columns: [
    { id: 'id', header: 'ID', sortable: true },
    { id: 'name', header: 'Name', sortable: true },
    { id: 'email', header: 'Email', sortable: true }
  ],
  pagination: { page: 1, pageSize: 10 }
})

// Get current rows
const rows = table.getRows()

// Sort
table.sortBy('name', 'asc')

// Search
table.search('John')

// Paginate
table.nextPage()
```

## API Reference

### `new LiteTable<T>(options)`

Create a new table instance.

**Options:**
- `data: T[]` - Array of data
- `columns: Column<T>[]` - Column definitions
- `pagination?: boolean | PaginationConfig` - Enable pagination
- `searchable?: boolean` - Enable global search (default: `true`)
- `filterFn?: FilterFn<T>` - Custom filter function
- `defaultSort?: SortState` - Initial sort state

### Instance Methods

#### Data Access
- `getRows(): T[]` - Get current visible rows (paginated)
- `getAllRows(): T[]` - Get all rows (filtered & sorted, no pagination)
- `getColumns(): Column<T>[]` - Get all columns
- `getVisibleColumns(): Column<T>[]` - Get visible columns only
- `getState(): TableState<T>` - Get current state (immutable)
- `getRowById(id: string): T | undefined` - Get row by ID

#### Sorting
- `sortBy(columnId: string, direction?: SortDirection)` - Sort by column
- `clearSort()` - Clear sorting

#### Filtering
- `search(term: string)` - Set search term

#### Pagination
- `goToPage(page: number)` - Go to specific page
- `nextPage()` - Go to next page
- `prevPage()` - Go to previous page
- `setPageSize(size: number)` - Change page size

#### Column Control
- `toggleColumn(columnId: string)` - Toggle column visibility
- `showColumn(columnId: string)` - Show column
- `hideColumn(columnId: string)` - Hide column

#### Lifecycle
- `reset()` - Reset to initial state
- `setData(data: T[])` - Update data
- `destroy()` - Cleanup & remove listeners

#### Events
- `on(eventType: TableEventType, listener: TableEventListener<T>): () => void` - Subscribe to events
- `off(eventType: TableEventType, listener: TableEventListener<T>)` - Unsubscribe

**Event Types:** `'sort' | 'search' | 'paginate' | 'columnToggle' | 'reset'`

## TypeScript

Full type safety with generics:

```typescript
import { LiteTable, Column, TableOptions } from '@litetable/core'

interface Product {
  id: number
  name: string
  price: number
}

const columns: Column<Product>[] = [
  { id: 'name', header: 'Product Name' },
  { id: 'price', header: 'Price' }
]

const options: TableOptions<Product> = {
  data: products,
  columns
}

const table = new LiteTable<Product>(options)
```

## Performance

Optimized for speed:
- **O(n log n)** sorting with native sort
- **O(n)** filtering with early returns
- **O(1)** pagination with array slicing
- Minimal re-computation with cached results

## Framework Adapters

For React, Vue, or Vanilla JS, use the framework adapters:
- [`@litetable/react`](../react) - React hooks
- [`@litetable/vue`](../vue) - Vue composables
- [`@litetable/vanilla`](../vanilla) - Vanilla JS

## License

MIT
