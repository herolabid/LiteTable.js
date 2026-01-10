# @herolabid/litetable-react

> React adapter for LiteTable - Ultra-lightweight table library with hooks

[![npm version](https://img.shields.io/npm/v/@herolabid/litetable-react.svg)](https://www.npmjs.com/package/@herolabid/litetable-react)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@herolabid/litetable-react)](https://bundlephobia.com/package/@herolabid/litetable-react)

## Installation

```bash
npm install @herolabid/litetable-core @herolabid/litetable-react
```

## Quick Start

```tsx
import { useLiteTable } from '@herolabid/litetable-react'

function UserTable() {
  const table = useLiteTable({
    data: users,
    columns: [
      { id: 'name', header: 'Name', sortable: true },
      { id: 'email', header: 'Email', sortable: true }
    ],
    pagination: { page: 1, pageSize: 10 }
  })

  return (
    <div>
      <input
        value={table.searchTerm}
        onChange={(e) => table.search(e.target.value)}
        placeholder="Search..."
      />

      <table>
        <thead>
          <tr>
            {table.visibleColumns.map(col => (
              <th
                key={col.id}
                onClick={() => col.sortable && table.sortBy(col.id)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map(row => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>{row.email}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <button onClick={table.prevPage} disabled={!table.paginationState?.hasPrevPage}>
          Previous
        </button>
        <span>Page {table.paginationState?.page}</span>
        <button onClick={table.nextPage} disabled={!table.paginationState?.hasNextPage}>
          Next
        </button>
      </div>
    </div>
  )
}
```

## Features

- ✅ **Native React Hooks** - `useLiteTable` hook with full TypeScript support
- ✅ **Tiny Bundle** - Only 0.98 KB gzipped
- ✅ **Zero Dependencies** - Except React and `@herolabid/litetable-core`
- ✅ **TypeScript** - Full type safety with generics
- ✅ **Reactive** - Automatic re-renders on state changes

## API

### `useLiteTable<TData>(options: TableOptions<TData>)`

Returns an object with:

- `rows: TData[]` - Current visible rows
- `visibleColumns: Column<TData>[]` - Visible columns
- `sortBy(columnId, direction?)` - Sort table
- `search(term)` - Filter data
- `nextPage()` / `prevPage()` - Navigate pages
- `goToPage(page)` - Jump to page
- `setPageSize(size)` - Change page size
- `toggleColumn(columnId)` - Show/hide column
- `reset()` - Reset to initial state
- And more...

## Advanced Usage

### With Virtual Scrolling

```tsx
import { useLiteTable } from '@herolabid/litetable-react'
import { VirtualScrollManager } from '@herolabid/litetable-core'

function LargeTable() {
  const table = useLiteTable({ data: largeDataset, columns })

  const virtualScroll = new VirtualScrollManager(table.allRows, {
    rowHeight: 48,
    containerHeight: 600
  })

  // Render only visible rows
}
```

### With Export

```tsx
import { useLiteTable } from '@herolabid/litetable-react'
import { ExportManager } from '@herolabid/litetable-core'

function ExportableTable() {
  const table = useLiteTable({ data, columns })
  const exportManager = new ExportManager(table.allRows, columns)

  return (
    <div>
      <button onClick={() => exportManager.export('xlsx', { filename: 'data' })}>
        Export to Excel
      </button>
      {/* Table */}
    </div>
  )
}
```

## Documentation

- [Main Documentation](https://github.com/herolabid/LiteTable.js#readme)
- [Installation Guide](https://github.com/herolabid/LiteTable.js/blob/main/INSTALLATION.md)
- [Getting Started](https://github.com/herolabid/LiteTable.js/blob/main/GETTING_STARTED.md)
- [Examples](https://github.com/herolabid/LiteTable.js/tree/main/examples)

## License

MIT © [Irfan Arsyad](https://github.com/herolabid)
