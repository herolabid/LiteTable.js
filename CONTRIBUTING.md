# Contributing to LiteTable.js

Thank you for your interest in contributing to LiteTable.js! 🎉

## Code of Conduct

Be respectful, inclusive, and constructive. We're all here to build something great together.

## How Can I Contribute?

### 🐛 Reporting Bugs

1. Check if the bug is already reported in [Issues](https://github.com/yourusername/litetable/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser/environment info
   - Code example (minimal reproducible)

### 💡 Suggesting Features

1. Check [Discussions](https://github.com/yourusername/litetable/discussions) for similar ideas
2. Create a new discussion with:
   - Use case / problem it solves
   - Proposed solution
   - Alternative solutions considered
   - Examples from other libraries

### 📝 Improving Documentation

- Fix typos, unclear explanations
- Add examples
- Improve API docs
- Write tutorials

### 💻 Contributing Code

## Development Setup

### Prerequisites

- Node.js >= 18
- pnpm >= 8

### Setup

```bash
# 1. Fork & clone repo
git clone https://github.com/yourusername/litetable.git
cd litetable

# 2. Install dependencies
pnpm install

# 3. Build all packages
pnpm build

# 4. Run benchmarks (optional)
pnpm bench
```

### Project Structure

```
litetable/
├── packages/
│   ├── core/              # Core logic (framework-agnostic)
│   ├── react/             # React adapter
│   ├── vue/               # Vue adapter
│   └── vanilla/           # Vanilla JS adapter
├── examples/              # Example applications
├── benchmarks/            # Performance benchmarks
└── docs/                  # Documentation
```

## Coding Guidelines

### Code Style

We use **Prettier** and **ESLint** for consistent code style:

```bash
# Format code
pnpm format

# Lint code
pnpm lint
```

### TypeScript

- ✅ **Always use TypeScript** (no `.js` files in `src/`)
- ✅ **Avoid `any`** - use proper types or `unknown`
- ✅ **Enable strict mode** - no implicit any, no unused vars
- ✅ **Use generics** for reusable components
- ✅ **Document complex types** with JSDoc comments

**Example:**

```typescript
// ✅ Good
function sortData<T>(data: T[], key: keyof T): T[] {
  return [...data].sort((a, b) => {
    // ...
  })
}

// ❌ Bad
function sortData(data: any, key: any): any {
  return data.sort((a: any, b: any) => {
    // ...
  })
}
```

### Clean Code Principles

#### 1. **Single Responsibility**

Each function/class should do ONE thing well:

```typescript
// ✅ Good - Single responsibility
function filterData<T>(data: T[], searchTerm: string): T[] {
  // Only filters
}

function sortData<T>(data: T[], sortState: SortState): T[] {
  // Only sorts
}

// ❌ Bad - Multiple responsibilities
function processData<T>(data: T[], searchTerm: string, sortState: SortState): T[] {
  // Filters AND sorts
}
```

#### 2. **Pure Functions**

Prefer pure functions (no side effects):

```typescript
// ✅ Good - Pure function
function addNumbers(a: number, b: number): number {
  return a + b
}

// ❌ Bad - Side effects
let total = 0
function addNumbers(a: number, b: number): void {
  total = a + b  // Mutates external state
}
```

#### 3. **Immutability**

Don't mutate data:

```typescript
// ✅ Good - Immutable
const sorted = [...data].sort((a, b) => a - b)

// ❌ Bad - Mutates original
data.sort((a, b) => a - b)
```

#### 4. **Meaningful Names**

Use descriptive, self-documenting names:

```typescript
// ✅ Good
function calculateTotalPrice(items: CartItem[]): number

// ❌ Bad
function calc(arr: any[]): number
```

#### 5. **Keep Functions Small**

Aim for < 20 lines per function:

```typescript
// ✅ Good - Small, focused
function isAdult(age: number): boolean {
  return age >= 18
}

function canVote(user: User): boolean {
  return isAdult(user.age) && user.country === 'USA'
}

// ❌ Bad - Too long, complex
function checkUser(user: User): boolean {
  if (user.age >= 18) {
    if (user.country === 'USA') {
      // ... 50 more lines
    }
  }
}
```

#### 6. **Document Complex Logic**

Add comments for non-obvious code:

```typescript
/**
 * Compare two values for sorting
 * Handles null/undefined, strings, numbers, dates, booleans
 *
 * @performance O(1) - Single comparison
 */
function compareValues(a: unknown, b: unknown, direction: SortDirection): number {
  // Handle null/undefined - always sort to end
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1

  // ... rest of logic
}
```

### Performance

- ⚡ **Prefer native methods** (Array.sort, Array.filter, etc.)
- ⚡ **Avoid unnecessary loops** - early returns
- ⚡ **Cache computed values** - don't recalculate
- ⚡ **Use lazy evaluation** when possible
- ⚡ **Benchmark critical paths** - use `pnpm bench`

**Example:**

```typescript
// ✅ Good - Early return
function findUser(users: User[], id: number): User | undefined {
  for (const user of users) {
    if (user.id === id) {
      return user  // Early return!
    }
  }
  return undefined
}

// ❌ Bad - Checks all items
function findUser(users: User[], id: number): User | undefined {
  const found = users.filter(u => u.id === id)
  return found[0]
}
```

## Testing

### Run Benchmarks

```bash
# Run all benchmarks
pnpm bench

# Run specific benchmark
pnpm bench -- core.bench.ts
```

### Add Benchmarks

When adding new features, add corresponding benchmarks:

```typescript
// benchmarks/my-feature.bench.ts
import { describe, bench } from 'vitest'
import { LiteTable } from '../packages/core/src'

describe('My Feature', () => {
  bench('my operation (1,000 rows)', () => {
    const table = new LiteTable({ data: generateData(1000), columns })
    table.myNewFeature()
  })
})
```

## Pull Request Process

1. **Create a branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make your changes**
   - Follow coding guidelines above
   - Add benchmarks for new features
   - Update documentation

3. **Test your changes**
   ```bash
   pnpm build
   pnpm bench
   ```

4. **Commit with clear message**
   ```bash
   git commit -m "feat: add column resizing support"
   ```

   **Commit format:**
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation only
   - `perf:` Performance improvement
   - `refactor:` Code refactoring
   - `test:` Add/update tests

5. **Push & create PR**
   ```bash
   git push origin feature/my-feature
   ```

6. **PR Template**
   ```markdown
   ## Description
   Brief description of changes

   ## Motivation
   Why is this change needed?

   ## Changes
   - Added X
   - Fixed Y
   - Updated Z

   ## Performance Impact
   Benchmark results (if applicable)

   ## Breaking Changes
   List any breaking changes
   ```

## Release Process

(Maintainers only)

1. Update version in all `package.json` files
2. Update CHANGELOG.md
3. Create git tag: `git tag v0.1.0`
4. Push: `git push --tags`
5. Publish: `pnpm publish -r`

## Questions?

- 💬 [Discussions](https://github.com/herolabid/LiteTable.js/discussions)
- 🐛 [Issues](https://github.com/herolabid/LiteTable.js/issues)
- ☕ [Buy Me a Coffee](https://www.buymeacoffee.com/herostack)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for making LiteTable.js better! 🎉**
