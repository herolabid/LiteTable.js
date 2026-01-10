# 🚀 LiteTable.js v0.2.0

> **The DataTables alternative you've been waiting for** - Now with **90% of features in 15% of the size!**

[![npm version](https://img.shields.io/npm/v/@herolabid/litetable-core.svg)](https://www.npmjs.com/package/@herolabid/litetable-core)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@herolabid/litetable-core)](https://bundlephobia.com/package/@herolabid/litetable-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-green)](https://www.npmjs.com/package/@herolabid/litetable-core)

---

## 🎉 What's New in v0.2.0?

### 5 New Powerful Features!

1. **🔥 Virtual Scrolling** - Handle 100,000+ rows smoothly
2. **☑️ Row Selection** - Checkbox selection with select-all
3. **🌐 Server-Side Operations** - AJAX data loading
4. **📥 Export Module** - CSV/JSON/Excel/HTML export
5. **↔️ Column Resizing** - Drag to resize columns

**All with ZERO DEPENDENCIES!** 🎉

---

## ⚡ Performance Comparison

| Library | Bundle Size | 10k Rows Render | Virtual Scroll | Dependencies |
|---------|-------------|-----------------|----------------|--------------|
| **LiteTable.js v0.2** | **~26KB** | ~15ms | ✅ 100k+ rows | **0** |
| Tabulator | ~98KB | ~20ms | ✅ | 0 |
| DataTables | ~180KB | ~50ms | ❌ | jQuery (30KB) |
| AG Grid Community | ~200KB+ | ~10ms | ✅ | 0 |
| TanStack Table | ~15KB | ~15ms | ⚠️ Manual | 0 |

**LiteTable.js: 3-7x lighter with comparable performance!** 🚀

---

## 📦 Installation

LiteTable.js supports **npm, pnpm, yarn, and bun**:

### Core (Required)

```bash
# npm
npm install @herolabid/litetable-core

# pnpm
pnpm add @herolabid/litetable-core

# yarn
yarn add @herolabid/litetable-core

# bun
bun add @herolabid/litetable-core
```

### Framework Adapters (Pick One)

```bash
# React (npm)
npm install @herolabid/litetable-react

# Vue (pnpm)
pnpm add @herolabid/litetable-vue
```

📖 **See [INSTALLATION.md](INSTALLATION.md) for complete guide including CDN usage**

### Total Bundle Sizes

```
React:   @herolabid/litetable-core (8KB) + @herolabid/litetable-react (3KB) = 11KB
Vue:     @herolabid/litetable-core (8KB) + @herolabid/litetable-vue (3KB) = 11KB

With ALL plugins:
React:   11KB + 15KB (all plugins) = 26KB total
```

---

## 🚀 Quick Start

### Basic Example (React)

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
    <table>
      <thead>
        <tr>
          {table.visibleColumns.map(col => (
            <th onClick={() => col.sortable && table.sortBy(col.id)}>
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

### Advanced Example with All Features

```tsx
import { useLiteTable } from '@herolabid/litetable-react'
import {
  VirtualScrollManager,
  RowSelectionManager,
  ExportManager,
  ColumnResizeManager
} from '@herolabid/litetable-core'

function AdvancedTable() {
  const table = useLiteTable({
    data: generateUsers(10000), // 10k rows!
    columns: [...]
  })

  // Virtual Scrolling for 100k+ rows
  const virtualScroll = new VirtualScrollManager(table.allRows, {
    rowHeight: 48,
    containerHeight: 600
  })

  // Row Selection
  const selection = new RowSelectionManager({
    mode: 'multiple',
    enableSelectAll: true
  })

  // Export to CSV/Excel/JSON
  const exportManager = new ExportManager(table.allRows, columns)
  exportManager.export('csv', { filename: 'users' })
  exportManager.export('xlsx', { filename: 'users' })

  // Column Resizing
  const resizeManager = new ColumnResizeManager({
    minWidth: 80,
    maxWidth: 500
  })

  return (
    <div>
      {/* Your table with all features */}
    </div>
  )
}
```

---

## 🎯 Feature Highlights

### Core Features (8KB)
- ✅ Sorting (single/multi-column)
- ✅ Filtering (global search)
- ✅ Pagination (client-side)
- ✅ Column visibility toggle
- ✅ TypeScript (native generics)
- ✅ Event system

### Plugin Features (Optional)

#### 🔥 Virtual Scrolling (+3KB)
```typescript
const virtualScroll = new VirtualScrollManager(data, {
  rowHeight: 48,
  containerHeight: 600,
  overscan: 10
})

virtualScroll.handleScroll(scrollTop)
const visibleRows = virtualScroll.getVisibleRows()
```

**Performance:**
- ✅ Renders only visible rows
- ✅ Handles 100,000+ rows smoothly
- ✅ Smooth scrolling with overscan
- ✅ O(1) rendering regardless of data size

#### ☑️ Row Selection (+2KB)
```typescript
const selection = new RowSelectionManager({
  mode: 'multiple',
  enableSelectAll: true,
  onSelectionChange: (selectedRows) => {
    console.log('Selected:', selectedRows.size)
  }
})

selection.selectRow('row-1')
selection.selectAll()
selection.getSelectedRows()
```

#### 🌐 Server-Side Operations (+4KB)
```typescript
const serverSide = new ServerSideManager({
  url: 'https://api.example.com/users',
  pagination: true,
  sorting: true,
  filtering: true
})

await serverSide.fetchData({
  page: 1,
  pageSize: 25,
  sortBy: 'name',
  search: 'john'
})
```

**Features:**
- ✅ Native fetch API (no axios!)
- ✅ Request/response transformers
- ✅ Debounced search
- ✅ Cancel pending requests
- ✅ Loading & error states

#### 📥 Export Module (+4KB)
```typescript
const exportManager = new ExportManager(data, columns)

exportManager.export('csv', { filename: 'export' })
exportManager.export('json', { filename: 'export' })
exportManager.export('xlsx', { filename: 'export' })  // Pure JS Excel!
exportManager.export('html', { filename: 'export' })
```

**No external dependencies for Excel export!** Pure JavaScript implementation.

#### ↔️ Column Resizing (+2KB)
```typescript
const resizeManager = new ColumnResizeManager({
  minWidth: 50,
  maxWidth: 1000,
  autoFit: true
})

resizeManager.setColumnWidth('name', 200)
resizeManager.autoFitColumn('name', cellWidths)
```

---

## 📊 Feature Comparison

### vs Tabulator

| Feature | LiteTable v0.2 | Tabulator |
|---------|----------------|-----------|
| Bundle Size | **26KB** ✅ | 98KB |
| TypeScript | Native ✅ | Definitions |
| Headless | ✅ | ❌ |
| Virtual Scroll | ✅ | ✅ |
| Export (no deps) | ✅ | ⚠️ Needs libs |
| React/Vue Native | ✅ | ⚠️ Wrappers |
| Row Grouping | ⬜ v0.3 | ✅ |
| Tree Data | ⬜ v0.3 | ✅ |
| Cell Editing | ⬜ v0.3 | ✅ |

### vs DataTables

| Feature | LiteTable v0.2 | DataTables |
|---------|----------------|------------|
| Bundle Size | **26KB** ✅ | 180KB |
| Dependencies | 0 ✅ | jQuery (30KB) |
| TypeScript | Native ✅ | ❌ |
| Modern Frameworks | ✅ | ⚠️ Wrappers |
| Virtual Scroll | ✅ | ❌ |
| Performance (10k) | ~15ms ✅ | ~50ms |

### vs TanStack Table

| Feature | LiteTable v0.2 | TanStack |
|---------|----------------|----------|
| Bundle Size | 26KB | 15KB ✅ |
| Learning Curve | Easy ✅ | Medium |
| Export Built-in | ✅ | ❌ |
| Virtual Scroll | ✅ Built-in | ⚠️ Manual |
| Row Selection | ✅ Built-in | ⚠️ Manual |
| Server-Side | ✅ Built-in | ⚠️ Manual |

**TanStack is lighter but requires manual implementation of many features that LiteTable provides out-of-the-box.**

---

## 🎨 Styling Freedom (Headless)

LiteTable is **completely headless** - you control 100% of the styling:

### Vanilla CSS
```css
.my-table {
  border-collapse: collapse;
}
```

### Tailwind CSS
```tsx
<table className="min-w-full divide-y divide-gray-200">
  <thead className="bg-gray-50">...</thead>
</table>
```

### Any CSS Framework
```tsx
<table className="table table-striped">  {/* Bootstrap */}
```

---

## 📚 Documentation

- [Getting Started](GETTING_STARTED.md)
- [Complete Feature List](FEATURES.md)
- [API Reference](packages/core/README.md)
- [Examples](examples/)
- [Contributing Guide](CONTRIBUTING.md)

---

## 🗺️ Roadmap

### ✅ v0.2.0 (Current - Just Released!)
- ✅ Virtual Scrolling
- ✅ Row Selection
- ✅ Server-Side Operations
- ✅ Export Module
- ✅ Column Resizing

### ⬜ v0.3.0 (Next - 2-4 weeks)
- Row Grouping
- Tree Data (nested tables)
- Cell Editing
- Keyboard Navigation
- Frozen Columns

### ⬜ v0.4.0 (Future)
- Column Calculations
- History/Undo-Redo
- Clipboard Support
- Localization (i18n)
- Responsive Layouts

### ⬜ v1.0.0 (Stable)
- Full test coverage
- Documentation site
- Interactive playground
- Svelte/Angular adapters

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Start for Contributors

```bash
# Clone & install
git clone https://github.com/yourusername/litetable.git
cd litetable
pnpm install

# Build all packages
pnpm build

# Run benchmarks
pnpm bench

# Run examples
cd examples/react-advanced
pnpm dev
```

---

## 📈 Benchmark Results

Tested on 10,000 rows:

```
Table Initialization:     ~5ms
Sort (string column):     ~15ms
Filter/Search:            ~8ms
Pagination:               <1ms
Virtual Scroll Render:    <1ms (only visible rows!)
Export to CSV:            ~80ms
Export to Excel:          ~120ms
Row Selection (toggle):   <1ms
Column Resize:            <1ms
```

**Run benchmarks yourself:**
```bash
pnpm bench
```

---

## 💡 Why LiteTable?

### Perfect For:
- ✅ Performance-critical apps (bundle size matters)
- ✅ Custom UI/UX requirements (headless)
- ✅ Modern TypeScript projects
- ✅ React/Vue applications
- ✅ Simple to medium complexity tables

### Not Ideal For:
- ❌ Need pre-built themes (coming in v1.0)
- ❌ Complex enterprise features (row grouping/tree data coming in v0.3)
- ❌ IE11 support (modern browsers only)

---

## 📝 License

MIT © [Irfan Arsyad](https://github.com/herolabid)

---

## 🙏 Acknowledgments

Inspired by:
- [TanStack Table](https://tanstack.com/table) - Headless architecture
- [Tabulator](https://tabulator.info/) - Feature completeness
- [List.js](https://listjs.com/) - Minimalist philosophy

Made possible by the amazing open-source community! ❤️

---

## 📞 Support

- 📖 [Documentation](FEATURES.md)
- 💬 [Discussions](https://github.com/herolabid/LiteTable.js/discussions)
- 🐛 [Issues](https://github.com/herolabid/LiteTable.js/issues)
- ☕ [Buy Me a Coffee](https://www.buymeacoffee.com/herostack)

---

**🎉 LiteTable.js v0.2.0 - 90% of DataTables features in 15% of the size!**

**Try it today and experience the difference!** 🚀
