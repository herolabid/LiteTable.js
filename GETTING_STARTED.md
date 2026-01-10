# 🚀 Getting Started with LiteTable.js

Welcome to LiteTable.js! This guide will help you get up and running in minutes.

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js >= 18
- pnpm >= 8 (recommended) or npm/yarn

## 🏁 Development Setup

### 1. Install Dependencies

```bash
# Install pnpm globally (if not installed)
npm install -g pnpm

# Install project dependencies
pnpm install
```

### 2. Build All Packages

```bash
# Build all packages (@herolabid/litetable-core, @herolabid/litetable-react, @herolabid/litetable-vue)
pnpm build
```

This will:
- Compile TypeScript to JavaScript
- Generate type definitions (.d.ts files)
- Bundle with tree-shaking and minification
- Output to `dist/` folder in each package

### 3. Run Examples

#### React Example

```bash
cd examples/react-example
pnpm install
pnpm dev
```

Open http://localhost:5173

#### Vue Example

```bash
cd examples/vue-example
pnpm install
pnpm dev
```

Open http://localhost:5174

### 4. Run Benchmarks

```bash
# From root directory
pnpm bench
```

This will run performance benchmarks for:
- Table initialization
- Sorting (1k, 10k rows)
- Filtering (1k, 10k rows)
- Pagination
- Combined operations

## 📦 Using LiteTable in Your Project

### Option 1: Install from npm (supports npm, pnpm, yarn, bun)

```bash
# For React (choose your package manager)
npm install @herolabid/litetable-core @herolabid/litetable-react
pnpm add @herolabid/litetable-core @herolabid/litetable-react
yarn add @herolabid/litetable-core @herolabid/litetable-react
bun add @herolabid/litetable-core @herolabid/litetable-react

# For Vue (choose your package manager)
npm install @herolabid/litetable-core @herolabid/litetable-vue
pnpm add @herolabid/litetable-core @herolabid/litetable-vue
yarn add @herolabid/litetable-core @herolabid/litetable-vue
bun add @herolabid/litetable-core @herolabid/litetable-vue
```

📖 **See [INSTALLATION.md](INSTALLATION.md) for CDN usage and troubleshooting**

### Option 2: Local Development (pnpm workspace)

If you're developing LiteTable itself or want to test locally:

```bash
# In your project's package.json
{
  "dependencies": {
    "@herolabid/litetable-core": "workspace:*",
    "@herolabid/litetable-react": "workspace:*"
  }
}
```

## 🎯 Quick Examples

### React Basic Example

```tsx
import { useLiteTable } from '@herolabid/litetable-react'

interface User {
  id: number
  name: string
  email: string
}

const users: User[] = [
  { id: 1, name: 'John', email: 'john@example.com' },
  { id: 2, name: 'Jane', email: 'jane@example.com' }
]

function UserTable() {
  const table = useLiteTable<User>({
    data: users,
    columns: [
      { id: 'name', header: 'Name', sortable: true },
      { id: 'email', header: 'Email', sortable: true }
    ]
  })

  return (
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
  )
}
```

### Vue Basic Example

```vue
<script setup lang="ts">
import { useLiteTable } from '@herolabid/litetable-vue'

interface User {
  id: number
  name: string
  email: string
}

const users: User[] = [
  { id: 1, name: 'John', email: 'john@example.com' },
  { id: 2, name: 'Jane', email: 'jane@example.com' }
]

const table = useLiteTable<User>({
  data: users,
  columns: [
    { id: 'name', header: 'Name', sortable: true },
    { id: 'email', header: 'Email', sortable: true }
  ]
})
</script>

<template>
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
</template>
```

## 🎨 Adding Styling

LiteTable is **headless** - you control the styling!

### Option 1: Custom CSS

```css
/* styles.css */
table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: #f3f4f6;
  padding: 12px;
  text-align: left;
  cursor: pointer;
}

th:hover {
  background: #e5e7eb;
}

td {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
}

tr:hover {
  background: #f9fafb;
}
```

### Option 2: Tailwind CSS

```tsx
<table className="min-w-full divide-y divide-gray-200">
  <thead className="bg-gray-50">
    <tr>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Name
      </th>
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        John Doe
      </td>
    </tr>
  </tbody>
</table>
```

### Option 3: Bootstrap

```tsx
<table className="table table-striped table-hover">
  <thead>
    <tr>
      <th>Name</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John Doe</td>
    </tr>
  </tbody>
</table>
```

## 🔧 Common Use Cases

### 1. Search/Filter

```tsx
// React
const [searchValue, setSearch] = useDebouncedSearch(table.search, 300)

<input
  value={searchValue}
  onChange={(e) => setSearch(e.target.value)}
  placeholder="Search..."
/>
```

```vue
<!-- Vue -->
<script setup>
const [searchValue, debouncedSearch] = useDebouncedSearch(table.search, 300)
</script>

<template>
  <input
    :value="searchValue"
    @input="debouncedSearch($event.target.value)"
    placeholder="Search..."
  />
</template>
```

### 2. Pagination

```tsx
const table = useLiteTable({
  data: users,
  columns,
  pagination: {
    page: 1,
    pageSize: 10,
    pageSizeOptions: [10, 25, 50, 100]
  }
})

// In your JSX/template
<button onClick={table.prevPage}>Previous</button>
<span>Page {table.paginationState.page}</span>
<button onClick={table.nextPage}>Next</button>
```

### 3. Custom Cell Rendering

```tsx
const columns = [
  {
    id: 'status',
    header: 'Status',
    cell: (value, row) => (
      <span className={`badge ${value}`}>
        {value}
      </span>
    )
  },
  {
    id: 'price',
    header: 'Price',
    cell: (value) => `$${value.toFixed(2)}`
  }
]
```

### 4. Custom Sort Function

```tsx
const columns = [
  {
    id: 'date',
    header: 'Date',
    sortable: true,
    sortFn: (a, b, direction) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return direction === 'asc' ? dateA - dateB : dateB - dateA
    }
  }
]
```

## 📊 Performance Tips

### 1. Use Debounced Search

```tsx
// Prevents table from updating on every keystroke
const [searchValue, setSearch] = useDebouncedSearch(table.search, 300)
```

### 2. Enable Pagination for Large Datasets

```tsx
// Only renders 25 rows instead of 10,000
pagination: { page: 1, pageSize: 25 }
```

### 3. Use Memoization for Expensive Computations

```tsx
const columns = useMemo(() => [
  {
    id: 'computed',
    header: 'Expensive Calculation',
    accessor: (row) => expensiveCalculation(row)
  }
], [])
```

## 🐛 Troubleshooting

### TypeScript Errors

If you see TypeScript errors, ensure:
1. You've run `pnpm build` to generate type definitions
2. Your `tsconfig.json` includes proper paths

```json
{
  "compilerOptions": {
    "paths": {
      "@litetable/*": ["./packages/*/src"]
    }
  }
}
```

### Bundle Size Issues

Check what's included:

```bash
# Analyze bundle
npm install -g source-map-explorer
source-map-explorer dist/index.js
```

### Performance Issues

Run benchmarks to identify bottlenecks:

```bash
pnpm bench
```

## 📚 Next Steps

- Read the [full documentation](README.md)
- Check out [examples](examples/)
- Run [benchmarks](benchmarks/)
- Read [contributing guide](CONTRIBUTING.md)
- Join [discussions](https://github.com/yourusername/litetable/discussions)

## 🆘 Getting Help

- 📖 [Documentation](README.md)
- 💬 [GitHub Discussions](https://github.com/herolabid/LiteTable.js/discussions)
- 🐛 [Report Issues](https://github.com/herolabid/LiteTable.js/issues)
- ☕ [Buy Me a Coffee](https://www.buymeacoffee.com/herostack)

---

**Happy coding! 🎉**
