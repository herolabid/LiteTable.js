# 🚀 LiteTable.js

> The **DataTables alternative** you've been waiting for - Super lightweight, framework-agnostic table library **under 26KB**

[![npm version](https://img.shields.io/npm/v/@litetable/core.svg)](https://www.npmjs.com/package/@litetable/core)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@litetable/core)](https://bundlephobia.com/package/@litetable/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Package Manager](https://img.shields.io/badge/package%20manager-npm%20%7C%20pnpm%20%7C%20yarn%20%7C%20bun-brightgreen)](INSTALLATION.md)

<a href="https://www.buymeacoffee.com/herostack" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 40px !important;width: 145px !important;" ></a>

---

## ✨ Why LiteTable.js?

| Feature | LiteTable.js | DataTables | TanStack Table | AG Grid Community |
|---------|--------------|------------|----------------|-------------------|
| **Bundle Size** | **~8-15KB** | ~150KB + jQuery (30KB) | ~15KB | ~200KB+ |
| **TypeScript** | ✅ Native | ❌ | ✅ Native | ✅ |
| **Dependencies** | ✅ Zero | ❌ jQuery | ✅ Zero | ✅ Zero |
| **Framework Support** | ✅ React, Vue, Vanilla | ⚠️ Wrappers | ✅ Multi-framework | ✅ Multi-framework |
| **Headless** | ✅ Yes | ❌ No | ✅ Yes | ❌ No |
| **Learning Curve** | ✅ Easy | ⚠️ Medium | ⚠️ Medium | ❌ Steep |
| **Performance (10k rows)** | ✅ Excellent | ⚠️ Good | ✅ Excellent | ✅ Excellent |

---

## 📦 Installation

LiteTable.js supports **npm, pnpm, yarn, and bun**:

```bash
# npm
npm install @litetable/core @litetable/react

# pnpm
pnpm add @litetable/core @litetable/react

# yarn
yarn add @litetable/core @litetable/react

# bun
bun add @litetable/core @litetable/react
```

**Packages:**
- `@litetable/core` - Framework-agnostic core (~8KB)
- `@litetable/react` - React adapter (~1KB)
- `@litetable/vue` - Vue adapter (~1KB)

**Total bundle size:**
- React: **~9KB** (core + react)
- Vue: **~9KB** (core + vue)
- Vanilla: **~8KB** (core only)

📖 **[Full Installation Guide](INSTALLATION.md)** - CDN, troubleshooting, and more

---

## 🎯 Features

### Core Features (Included in 8KB!)
- ✅ **Sorting** - Single & multi-column, custom sort functions
- ✅ **Filtering** - Global search with custom filter logic
- ✅ **Pagination** - Client-side pagination with page size options
- ✅ **Column Control** - Show/hide columns dynamically
- ✅ **TypeScript** - Full type safety with generics
- ✅ **Event System** - Subscribe to table state changes
- ✅ **Immutable State** - Predictable state management

### Performance
- 🚀 **Sub-millisecond** operations for < 100 rows
- 🚀 **O(n log n)** sorting with native sort
- 🚀 **O(n)** filtering with early returns
- 🚀 **O(1)** pagination with array slicing
- 🚀 **Handles 10,000+ rows** smoothly

### Developer Experience
- 🧹 **Clean API** - Intuitive, consistent methods
- 📘 **Full TypeScript** - IntelliSense everywhere
- 🎨 **Headless** - Complete styling freedom
- 🔧 **Framework Adapters** - Native hooks/composables
- 📚 **Well Documented** - Clear examples & API docs

---

## 🚀 Quick Start

### React

```bash
npm install @litetable/core @litetable/react
```

```tsx
import { useLiteTable } from '@litetable/react'

function UserTable() {
  const table = useLiteTable({
    data: users,
    columns: [
      { id: 'name', header: 'Name', sortable: true },
      { id: 'email', header: 'Email', sortable: true },
      { id: 'role', header: 'Role' }
    ],
    pagination: { page: 1, pageSize: 10 }
  })

  return (
    <div>
      <input
        type="search"
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
              {table.visibleColumns.map(col => (
                <td key={col.id}>{row[col.id]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {table.paginationState && (
        <div>
          <button onClick={table.prevPage}>Previous</button>
          <span>Page {table.paginationState.page}</span>
          <button onClick={table.nextPage}>Next</button>
        </div>
      )}
    </div>
  )
}
```

### Vue 3

```bash
npm install @litetable/core @litetable/vue
```

```vue
<script setup lang="ts">
import { useLiteTable } from '@litetable/vue'

const table = useLiteTable({
  data: users,
  columns: [
    { id: 'name', header: 'Name', sortable: true },
    { id: 'email', header: 'Email', sortable: true },
    { id: 'role', header: 'Role' }
  ],
  pagination: { page: 1, pageSize: 10 }
})
</script>

<template>
  <div>
    <input
      type="search"
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
          <td v-for="col in table.visibleColumns.value" :key="col.id">
            {{ row[col.id] }}
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="table.paginationState.value">
      <button @click="table.prevPage">Previous</button>
      <span>Page {{ table.paginationState.value.page }}</span>
      <button @click="table.nextPage">Next</button>
    </div>
  </div>
</template>
```

### Vanilla JS

```bash
npm install @litetable/core @litetable/vanilla
```

```js
import { createLiteTable } from '@litetable/vanilla'

const table = createLiteTable(document.getElementById('table'), {
  data: users,
  columns: [
    { id: 'name', header: 'Name', sortable: true },
    { id: 'email', header: 'Email', sortable: true }
  ]
})

// Search
document.getElementById('search').addEventListener('input', (e) => {
  table.search(e.target.value)
})
```

---

## 📖 Documentation

### Core Concepts

#### 1. **Headless Architecture**

LiteTable.js is **headless** - it manages logic & state, you control the UI:

```tsx
// ✅ Use your own markup
<table className="my-custom-table">
  <thead>...</thead>
</table>

// ✅ Use any CSS framework
<table className="table table-striped">  {/* Bootstrap */}
<table className="min-w-full divide-y">  {/* Tailwind */}
<table className="my-table">             {/* Your CSS */}
```

#### 2. **Type Safety**

Full TypeScript support with generics:

```tsx
interface User {
  id: number
  name: string
  email: string
}

// Type-safe columns
const table = useLiteTable<User>({
  data: users,
  columns: [
    {
      id: 'name', // ✅ Autocomplete from User type
      header: 'Name',
      accessor: (row) => row.name // ✅ row is typed as User
    }
  ]
})

// Type-safe rows
table.rows.map(row => {
  row.name  // ✅ TypeScript knows this exists
  row.invalid // ❌ TypeScript error
})
```

#### 3. **Custom Rendering**

Use `cell` function for custom rendering:

```tsx
{
  id: 'status',
  header: 'Status',
  cell: (value, row) => (
    <span className={`badge badge-${value}`}>
      {value}
    </span>
  )
}
```

#### 4. **Event System**

Subscribe to table updates:

```tsx
table.tableInstance.on('sort', (state) => {
  console.log('Sorted:', state.sortState)
})

table.tableInstance.on('search', (state) => {
  console.log('Searched:', state.searchTerm)
})
```

---

## 🎨 Styling

LiteTable.js is **unstyled by default**. Choose your approach:

### Option 1: Your Own CSS

```css
.my-table {
  border-collapse: collapse;
  width: 100%;
}

.my-table th {
  background: #f3f4f6;
  padding: 12px;
  text-align: left;
}
```

### Option 2: Tailwind CSS

```tsx
<table className="min-w-full divide-y divide-gray-200">
  <thead className="bg-gray-50">
    <th className="px-6 py-3 text-left">Name</th>
  </thead>
</table>
```

### Option 3: CSS Framework (Bootstrap, etc.)

```tsx
<table className="table table-striped table-hover">
  <thead>...</thead>
</table>
```

---

## ⚡ Performance

### Benchmarks (10,000 rows)

| Operation | Time | Complexity |
|-----------|------|------------|
| Init table | ~5ms | O(n) |
| Sort | ~15ms | O(n log n) |
| Filter | ~8ms | O(n) |
| Paginate | <1ms | O(1) |
| Combined (sort+filter+page) | ~25ms | O(n log n) |

**Run benchmarks:**

```bash
pnpm bench
```

### Optimization Tips

1. **Use debounced search** for search inputs:

```tsx
import { useDebouncedSearch } from '@litetable/react'

const [searchValue, setSearch] = useDebouncedSearch(table.search, 300)
```

2. **Pagination** for large datasets:

```tsx
pagination: {
  page: 1,
  pageSize: 25  // Render only 25 rows
}
```

3. **Virtual scrolling** (future module) for 100k+ rows

---

## 🏗️ Project Structure

```
litetable/
├── packages/
│   ├── core/              # Framework-agnostic logic (~8KB)
│   ├── react/             # React adapter (~3KB)
│   ├── vue/               # Vue adapter (~3KB)
│   └── vanilla/           # Vanilla JS adapter (~2KB)
├── examples/
│   ├── react-example/     # React demo app
│   └── vue-example/       # Vue demo app
├── benchmarks/            # Performance benchmarks
└── docs/                  # Documentation
```

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
# Clone repo
git clone git@github.com:herolabid/LiteTable.js.git
cd LiteTable.js

# Install dependencies (requires pnpm)
pnpm install

# Build all packages
pnpm build

# Run benchmarks
pnpm bench

# Run examples
cd examples/react-example
pnpm dev
```

---

## 📝 License

MIT © [Irfan Arsyad](https://github.com/herolabid)

---

## 🙏 Acknowledgments

Inspired by:
- [TanStack Table](https://tanstack.com/table) - Headless architecture
- [List.js](https://listjs.com/) - Minimalist approach
- [DataTables](https://datatables.net/) - Feature completeness

---

## 📊 Comparison

### vs DataTables

| | LiteTable.js | DataTables |
|-|--------------|------------|
| Size | **8-15KB** | ~180KB (with jQuery) |
| TypeScript | ✅ Native | ❌ |
| Modern frameworks | ✅ First-class | ⚠️ Wrappers |
| jQuery dependency | ✅ Zero | ❌ Required |
| Headless | ✅ Yes | ❌ No |

### vs TanStack Table

| | LiteTable.js | TanStack Table |
|-|--------------|----------------|
| Size | **~11KB** | ~15KB |
| Learning curve | ✅ Easy | ⚠️ Medium |
| API simplicity | ✅ Simple | ⚠️ Complex |
| Features | ⚠️ Core only | ✅ Advanced |
| Performance | ✅ Excellent | ✅ Excellent |

**Use LiteTable.js if:**
- ✅ You want simple, clean API
- ✅ You need small bundle size
- ✅ You want 80% features in 10% size

**Use TanStack Table if:**
- ✅ You need advanced features (grouping, pivoting, etc.)
- ✅ You're building complex data grids
- ✅ Bundle size is not a concern

---

## 🗺️ Roadmap

### v0.1.0 (Current)
- ✅ Core library
- ✅ React adapter
- ✅ Vue adapter
- ✅ Pagination, sorting, filtering
- ✅ TypeScript support

### v0.2.0 (Planned)
- ⬜ Vanilla JS adapter
- ⬜ Column resizing module
- ⬜ Export module (CSV, JSON)
- ⬜ Server-side operations

### v0.3.0 (Future)
- ⬜ Virtual scrolling module
- ⬜ Row selection module
- ⬜ Svelte adapter
- ⬜ Angular adapter

---

## 📞 Support

- 📖 [Documentation](https://github.com/herolabid/LiteTable.js)
- 💬 [Discussions](https://github.com/herolabid/LiteTable.js/discussions)
- 🐛 [Issues](https://github.com/herolabid/LiteTable.js/issues)
- ☕ [Buy Me a Coffee](https://www.buymeacoffee.com/herostack)

---

**Made with ❤️ for modern web development**
