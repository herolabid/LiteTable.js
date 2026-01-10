# @herolabid/litetable-vue

> Vue 3 adapter for LiteTable - Ultra-lightweight table library with composables

[![npm version](https://img.shields.io/npm/v/@herolabid/litetable-vue.svg)](https://www.npmjs.com/package/@herolabid/litetable-vue)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@herolabid/litetable-vue)](https://bundlephobia.com/package/@herolabid/litetable-vue)

## Installation

```bash
npm install @herolabid/litetable-core @herolabid/litetable-vue
```

## Quick Start

```vue
<script setup lang="ts">
import { useLiteTable } from '@herolabid/litetable-vue'

const table = useLiteTable({
  data: users,
  columns: [
    { id: 'name', header: 'Name', sortable: true },
    { id: 'email', header: 'Email', sortable: true }
  ],
  pagination: { page: 1, pageSize: 10 }
})
</script>

<template>
  <div>
    <input
      :value="table.searchTerm.value"
      @input="table.search($event.target.value)"
      placeholder="Search..."
    />

    <table>
      <thead>
        <tr>
          <th
            v-for="col in table.visibleColumns.value"
            :key="col.id"
            @click="col.sortable && table.sortBy(col.id)"
          >
            {{ col.header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in table.rows.value" :key="row.id">
          <td>{{ row.name }}</td>
          <td>{{ row.email }}</td>
        </tr>
      </tbody>
    </table>

    <div>
      <button @click="table.prevPage" :disabled="!table.paginationState.value?.hasPrevPage">
        Previous
      </button>
      <span>Page {{ table.paginationState.value?.page }}</span>
      <button @click="table.nextPage" :disabled="!table.paginationState.value?.hasNextPage">
        Next
      </button>
    </div>
  </div>
</template>
```

## Features

- ✅ **Native Vue 3 Composables** - `useLiteTable` with reactive refs
- ✅ **Tiny Bundle** - Only 0.95 KB gzipped
- ✅ **Zero Dependencies** - Except Vue 3 and `@herolabid/litetable-core`
- ✅ **TypeScript** - Full type safety with generics
- ✅ **Reactive** - Automatic reactivity with Vue refs

## API

### `useLiteTable<TData>(options: TableOptions<TData>)`

Returns an object with reactive refs:

- `rows: Ref<TData[]>` - Current visible rows
- `visibleColumns: Ref<Column<TData>[]>` - Visible columns
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

```vue
<script setup lang="ts">
import { useLiteTable } from '@herolabid/litetable-vue'
import { VirtualScrollManager } from '@herolabid/litetable-core'

const table = useLiteTable({ data: largeDataset, columns })

const virtualScroll = new VirtualScrollManager(table.allRows.value, {
  rowHeight: 48,
  containerHeight: 600
})

// Render only visible rows
</script>
```

### With Export

```vue
<script setup lang="ts">
import { useLiteTable } from '@herolabid/litetable-vue'
import { ExportManager } from '@herolabid/litetable-core'

const table = useLiteTable({ data, columns })
const exportManager = new ExportManager(table.allRows.value, columns)

const handleExport = () => {
  exportManager.export('xlsx', { filename: 'data' })
}
</script>

<template>
  <div>
    <button @click="handleExport">
      Export to Excel
    </button>
    <!-- Table -->
  </div>
</template>
```

## Documentation

- [Main Documentation](https://github.com/herolabid/LiteTable.js#readme)
- [Installation Guide](https://github.com/herolabid/LiteTable.js/blob/main/INSTALLATION.md)
- [Getting Started](https://github.com/herolabid/LiteTable.js/blob/main/GETTING_STARTED.md)
- [Examples](https://github.com/herolabid/LiteTable.js/tree/main/examples)

## License

MIT © [Irfan Arsyad](https://github.com/herolabid)
