# 🚀 LiteTable.js v0.2.0 - Advanced Features Release

> Ultra-lightweight DataTables alternative - **26KB with ALL features, ZERO dependencies!**

---

## 🎉 What's New

This release adds **5 major advanced features** to LiteTable.js, making it a serious competitor to Tabulator while staying **3.7x lighter**!

### ✨ New Features

#### 1. 🔥 Virtual Scrolling
Handle **100,000+ rows** smoothly with O(1) rendering performance.

```typescript
import { VirtualScrollManager } from '@litetable/core'

const virtualScroll = new VirtualScrollManager(data, {
  rowHeight: 48,
  containerHeight: 600,
  overscan: 10
})
```

**Performance:**
- Renders only visible rows
- Smooth scrolling with overscan buffer
- Works with 100k+ rows without lag

#### 2. ☑️ Row Selection
Checkbox selection with single/multiple modes and select-all support.

```typescript
import { RowSelectionManager } from '@litetable/core'

const selection = new RowSelectionManager({
  mode: 'multiple',
  enableSelectAll: true
})

selection.selectRow('row-1')
selection.selectAll()
console.log(selection.getSelectedRows())
```

#### 3. 🌐 Server-Side Operations
AJAX data loading with native fetch API (no axios!).

```typescript
import { ServerSideManager } from '@litetable/core'

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
- Native fetch API
- Request/response transformers
- Debounced search
- Cancel pending requests
- Loading & error states

#### 4. 📥 Export Module
Export to **CSV, JSON, Excel (XLSX), and HTML** - all with ZERO dependencies!

```typescript
import { ExportManager } from '@litetable/core'

const exportManager = new ExportManager(data, columns)

exportManager.export('csv', { filename: 'users' })
exportManager.export('xlsx', { filename: 'users' })  // Pure JS Excel!
exportManager.export('json', { filename: 'users' })
exportManager.export('html', { filename: 'users' })
```

**Highlight:** Pure JavaScript Excel export - no external libraries required!

#### 5. ↔️ Column Resizing
Drag to resize columns with min/max width constraints.

```typescript
import { ColumnResizeManager } from '@litetable/core'

const resizeManager = new ColumnResizeManager({
  minWidth: 50,
  maxWidth: 1000,
  autoFit: true
})

resizeManager.setColumnWidth('name', 200)
resizeManager.autoFitColumn('name', cellWidths)
```

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

---

## 📊 Bundle Sizes

All packages are production-ready and optimized:

| Package | Size (Gzipped) |
|---------|----------------|
| `@litetable/core` | **7.81 KB** |
| `@litetable/react` | **0.98 KB** |
| `@litetable/vue` | **0.95 KB** |
| **Total (React)** | **8.79 KB** |
| **Total (Vue)** | **8.76 KB** |

**With ALL plugins:** ~26KB (still 3.7x lighter than Tabulator!)

---

## 🎯 Feature Comparison

| Feature | LiteTable v0.2 | Tabulator | Winner |
|---------|----------------|-----------|--------|
| **Bundle Size** | **26KB** | 98KB | 🏆 LiteTable (3.7x lighter) |
| **Dependencies** | **0** | 0 | 🤝 Tie |
| **TypeScript** | Native | Definitions only | 🏆 LiteTable |
| **Headless** | ✅ | ❌ | 🏆 LiteTable |
| Virtual Scrolling | ✅ | ✅ | 🤝 Tie |
| Row Selection | ✅ | ✅ | 🤝 Tie |
| Server-Side | ✅ | ✅ | 🤝 Tie |
| Export (no deps) | ✅ | ⚠️ Requires libs | 🏆 LiteTable |
| Column Resizing | ✅ | ✅ | 🤝 Tie |

**Current Feature Parity: ~60%** with Tabulator 🎉

---

## 🚀 Quick Start

### React

```tsx
import { useLiteTable } from '@litetable/react'
import { VirtualScrollManager, ExportManager } from '@litetable/core'

function AdvancedTable() {
  const table = useLiteTable({
    data: users,
    columns: [
      { id: 'name', header: 'Name', sortable: true },
      { id: 'email', header: 'Email', sortable: true }
    ],
    pagination: { page: 1, pageSize: 25 }
  })

  // Virtual scrolling for 100k+ rows
  const virtualScroll = new VirtualScrollManager(table.allRows, {
    rowHeight: 48,
    containerHeight: 600
  })

  // Export to any format
  const exportManager = new ExportManager(table.allRows, columns)

  return (
    <div>
      <button onClick={() => exportManager.export('xlsx', { filename: 'users' })}>
        Export to Excel
      </button>
      {/* Your table */}
    </div>
  )
}
```

### Vue

```vue
<script setup lang="ts">
import { useLiteTable } from '@litetable/vue'
import { VirtualScrollManager, ExportManager } from '@litetable/core'

const table = useLiteTable({
  data: users,
  columns: [
    { id: 'name', header: 'Name', sortable: true },
    { id: 'email', header: 'Email', sortable: true }
  ],
  pagination: { page: 1, pageSize: 25 }
})

const exportManager = new ExportManager(table.allRows.value, columns)
</script>

<template>
  <div>
    <button @click="exportManager.export('xlsx', { filename: 'users' })">
      Export to Excel
    </button>
    <!-- Your table -->
  </div>
</template>
```

---

## 📈 Performance Benchmarks

Tested with 10,000 rows:

```
Table Initialization:     ~3.1ms
Sort (string column):     ~14.5ms
Search/Filter:            ~13.9ms
Pagination:               <3ms
Virtual Scroll Render:    <1ms (only visible rows!)
Export to CSV:            ~80ms
Export to Excel:          ~120ms
Row Selection (toggle):   <1ms
Column Resize:            <1ms
```

---

## 🛠️ Breaking Changes

None - this is a minor release with new features only!

---

## 🐛 Bug Fixes

- Fixed TypeScript FilterFn type to accept columns parameter
- Added terser for proper minification

---

## 📚 Documentation

- [README](https://github.com/herolabid/LiteTable.js#readme)
- [Installation Guide](https://github.com/herolabid/LiteTable.js/blob/main/INSTALLATION.md)
- [Getting Started](https://github.com/herolabid/LiteTable.js/blob/main/GETTING_STARTED.md)
- [Features](https://github.com/herolabid/LiteTable.js/blob/main/FEATURES.md)
- [Comparison with Tabulator](https://github.com/herolabid/LiteTable.js/blob/main/COMPARISON.md)
- [Contributing](https://github.com/herolabid/LiteTable.js/blob/main/CONTRIBUTING.md)

---

## 🎯 What's Next (v0.3.0)

Planning for the next release:

- Row Grouping
- Tree Data (nested tables)
- Cell Editing
- Frozen Columns
- Keyboard Navigation

**Expected feature parity after v0.3.0: ~80%** with Tabulator!

---

## 🙏 Contributing

We welcome contributions! See [CONTRIBUTING.md](https://github.com/herolabid/LiteTable.js/blob/main/CONTRIBUTING.md) for guidelines.

---

## 💖 Support

If you find LiteTable.js helpful:

- ⭐ [Star on GitHub](https://github.com/herolabid/LiteTable.js)
- ☕ [Buy Me a Coffee](https://www.buymeacoffee.com/herostack)
- 🐦 Share on social media
- 🤝 Contribute to the project

---

## 📝 License

MIT © [Irfan Arsyad](https://github.com/herolabid)

---

**🎉 Thank you for using LiteTable.js!**

Try it today: `npm install @litetable/core @litetable/react`
