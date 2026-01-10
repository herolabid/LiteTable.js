# 📦 Installation Guide

LiteTable.js supports **all major JavaScript package managers**: npm, pnpm, yarn, and bun.

---

## ✅ Package Manager Support

| Package Manager | Support | Recommended |
|----------------|---------|-------------|
| **npm** | ✅ Yes | Standard |
| **pnpm** | ✅ Yes | ⭐ Fastest for monorepo dev |
| **yarn** | ✅ Yes | Classic/Berry both supported |
| **bun** | ✅ Yes | ⚡ Ultra-fast |

---

## 🚀 Quick Install

### Using npm

```bash
# For React
npm install @herolabid/litetable-core @herolabid/litetable-react

# For Vue
npm install @herolabid/litetable-core @herolabid/litetable-vue

# Core only (vanilla JS)
npm install @herolabid/litetable-core
```

### Using pnpm

```bash
# For React
pnpm add @herolabid/litetable-core @herolabid/litetable-react

# For Vue
pnpm add @herolabid/litetable-core @herolabid/litetable-vue

# Core only (vanilla JS)
pnpm add @herolabid/litetable-core
```

### Using yarn

```bash
# For React
yarn add @herolabid/litetable-core @herolabid/litetable-react

# For Vue
yarn add @herolabid/litetable-core @herolabid/litetable-vue

# Core only (vanilla JS)
yarn add @herolabid/litetable-core
```

### Using bun

```bash
# For React
bun add @herolabid/litetable-core @herolabid/litetable-react

# For Vue
bun add @herolabid/litetable-core @herolabid/litetable-vue

# Core only (vanilla JS)
bun add @herolabid/litetable-core
```

---

## 📦 What Gets Installed

### Core Package

```bash
@herolabid/litetable-core@0.2.0
├── 📦 Size: 7.81 KB (gzipped)
├── 📁 Includes: Core table logic + all plugins
└── 🔗 Dependencies: ZERO
```

**Included plugins:**
- Virtual Scrolling (3KB)
- Row Selection (2KB)
- Server-Side Operations (4KB)
- Export Module (4KB)
- Column Resizing (2KB)

### React Adapter

```bash
@herolabid/litetable-react@0.1.0
├── 📦 Size: 0.98 KB (gzipped)
├── 🔗 Peer Dependencies: react >= 16.8.0
└── 🪝 Exports: useLiteTable hook
```

### Vue Adapter

```bash
@herolabid/litetable-vue@0.1.0
├── 📦 Size: 0.95 KB (gzipped)
├── 🔗 Peer Dependencies: vue >= 3.0.0
└── 🪝 Exports: useLiteTable composable
```

---

## 🔧 Development Setup

For contributors working on LiteTable.js itself:

### Clone Repository

```bash
git clone https://github.com/herolabid/LiteTable.js.git
cd LiteTable.js
```

### Install Dependencies

Choose your preferred package manager:

#### With pnpm (Recommended for monorepo)

```bash
# Install pnpm globally
npm install -g pnpm

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

#### With npm

```bash
# Install dependencies
npm install

# Build all packages
npm run build
```

#### With yarn

```bash
# Install dependencies
yarn install

# Build all packages
yarn build
```

#### With bun

```bash
# Install dependencies
bun install

# Build all packages
bun run build
```

---

## 🎯 Verify Installation

After installing, verify the packages are available:

### In your project

```typescript
// For React
import { useLiteTable } from '@herolabid/litetable-react'
import { VirtualScrollManager, ExportManager } from '@herolabid/litetable-core'

// For Vue
import { useLiteTable } from '@herolabid/litetable-vue'
import { VirtualScrollManager, ExportManager } from '@herolabid/litetable-core'

// Vanilla JS
import { LiteTable } from '@herolabid/litetable-core'
```

### Check installed versions

```bash
# npm
npm list @herolabid/litetable-core @herolabid/litetable-react

# pnpm
pnpm list @herolabid/litetable-core @herolabid/litetable-react

# yarn
yarn list --pattern "@litetable/*"

# bun
bun pm ls @herolabid/litetable-core
```

---

## 📊 Bundle Size Analysis

Want to verify the bundle size in your project?

### Using webpack-bundle-analyzer

```bash
npm install -D webpack-bundle-analyzer
```

### Using vite-plugin-visualizer

```bash
npm install -D rollup-plugin-visualizer
```

### Using source-map-explorer

```bash
npm install -g source-map-explorer
source-map-explorer node_modules/@herolabid/litetable-core/dist/index.js
```

---

## 🌐 CDN Usage (No Package Manager)

For quick prototyping without a build step:

### ESM CDN (Recommended)

```html
<script type="module">
  import { LiteTable } from 'https://esm.sh/@herolabid/litetable-core@0.2.0'

  const table = new LiteTable({
    data: [...],
    columns: [...]
  })
</script>
```

### unpkg

```html
<script type="module">
  import { LiteTable } from 'https://unpkg.com/@herolabid/litetable-core@0.2.0/dist/index.js'
</script>
```

### jsDelivr

```html
<script type="module">
  import { LiteTable } from 'https://cdn.jsdelivr.net/npm/@herolabid/litetable-core@0.2.0/dist/index.js'
</script>
```

---

## 🔄 Updating

### Update to latest version

```bash
# npm
npm update @herolabid/litetable-core @herolabid/litetable-react

# pnpm
pnpm update @herolabid/litetable-core @herolabid/litetable-react

# yarn
yarn upgrade @herolabid/litetable-core @herolabid/litetable-react

# bun
bun update @herolabid/litetable-core @herolabid/litetable-react
```

### Update to specific version

```bash
# npm
npm install @herolabid/litetable-core@0.2.0

# pnpm
pnpm add @herolabid/litetable-core@0.2.0

# yarn
yarn add @herolabid/litetable-core@0.2.0

# bun
bun add @herolabid/litetable-core@0.2.0
```

---

## 🐛 Troubleshooting

### "Cannot find module @herolabid/litetable-core"

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### "Peer dependency warning"

LiteTable React/Vue adapters require their respective frameworks:

```bash
# For React
npm install react react-dom

# For Vue
npm install vue
```

### "Type errors after installation"

Ensure TypeScript can find the types:

```json
// tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true
  }
}
```

### Monorepo workspace issues

If using pnpm/yarn workspaces and packages not resolving:

```bash
# pnpm
pnpm install --shamefully-hoist

# yarn
yarn install --check-files
```

---

## 📝 Next Steps

After installation:

1. **Quick Start**: See [GETTING_STARTED.md](GETTING_STARTED.md)
2. **Features**: Read [FEATURES.md](FEATURES.md)
3. **Examples**: Check [examples/](examples/) folder
4. **API Reference**: See package README files

---

## 💖 Support

If you find LiteTable.js helpful:

- ⭐ [Star on GitHub](https://github.com/herolabid/LiteTable.js)
- ☕ [Buy Me a Coffee](https://www.buymeacoffee.com/herostack)
- 🐦 Share on social media

---

**Ready to build amazing tables!** 🚀

MIT © [Irfan Arsyad](https://github.com/herolabid)
