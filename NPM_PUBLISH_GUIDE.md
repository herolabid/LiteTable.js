# 📦 NPM Publish Guide - LiteTable.js v0.2.0

## 🎯 Overview

Guide lengkap untuk publish packages ke npm registry.

---

## ✅ Pre-Publish Checklist

```bash
✅ npm account: irfanarsyad
✅ Packages built successfully
✅ Tests running (54/62 passed)
✅ Version: 0.2.0
✅ License: MIT
✅ Repository: github.com/herolabid/LiteTable.js
```

---

## 📝 Step-by-Step Instructions

### **Step 1: Login to npm**

```bash
# Login (will open browser or prompt in terminal)
npm login

# Verify login
npm whoami
# Should show: irfanarsyad
```

### **Step 2: Create Organization (Required for @herolabid/litetable scope)**

**Option A: Via Website** (Recommended)

1. Go to: https://www.npmjs.com/org/create
2. Organization name: `litetable`
3. Choose: **Unlimited public packages (Free)**
4. Click: Create

**Option B: Via Command Line**

```bash
# Not supported via CLI, must use website
```

**⚠️ Important:** If you don't want to create org, see Alternative below.

### **Step 3: Verify Package Names Available**

```bash
# Check if packages are available (should show 404 - good!)
npm view @herolabid/litetable/core
npm view @herolabid/litetable/react
npm view @herolabid/litetable/vue

# All should show: "404 Not Found" ✅
```

### **Step 4: Final Build**

```bash
# Make sure everything is built fresh
pnpm build

# Verify build outputs
ls -lh packages/core/dist/
ls -lh packages/react/dist/
ls -lh packages/vue/dist/
```

### **Step 5: Publish Packages**

**Publish @herolabid/litetable/core first:**

```bash
cd packages/core

# Dry run first (see what will be published)
npm publish --dry-run

# If looks good, publish for real
npm publish --access public

# Should show:
# + @herolabid/litetable/core@0.2.0
```

**Publish @herolabid/litetable/react:**

```bash
cd ../react

# Dry run
npm publish --dry-run

# Publish
npm publish --access public

# Should show:
# + @herolabid/litetable/react@0.2.0
```

**Publish @herolabid/litetable/vue:**

```bash
cd ../vue

# Dry run
npm publish --dry-run

# Publish
npm publish --access public

# Should show:
# + @herolabid/litetable/vue@0.2.0
```

### **Step 6: Verify Published Packages**

```bash
# Check packages are live on npm
npm view @herolabid/litetable/core
npm view @herolabid/litetable/react
npm view @herolabid/litetable/vue

# Test installation
mkdir /tmp/test-install
cd /tmp/test-install
npm init -y
npm install @herolabid/litetable/core @herolabid/litetable/react

# Should install successfully!
```

---

## 🔄 Alternative: Publish Without Organization

If you don't want to create `@herolabid/litetable` org, rename packages:

### **Step 1: Update Package Names**

```bash
# packages/core/package.json
"name": "litetable-core"

# packages/react/package.json
"name": "litetable-react"

# packages/vue/package.json
"name": "litetable-vue"
```

### **Step 2: Update Dependencies**

```bash
# packages/react/package.json
"peerDependencies": {
  "litetable-core": "^0.2.0"
}

# packages/vue/package.json
"peerDependencies": {
  "litetable-core": "^0.2.0"
}
```

### **Step 3: Update README.md**

```bash
# Change all references:
@herolabid/litetable/core → litetable-core
@herolabid/litetable/react → litetable-react
@herolabid/litetable/vue → litetable-vue
```

### **Step 4: Rebuild & Publish**

```bash
pnpm build

cd packages/core
npm publish --access public

cd ../react
npm publish --access public

cd ../vue
npm publish --access public
```

---

## 🚨 Troubleshooting

### Error: "You must be logged in"

```bash
npm login
npm whoami
```

### Error: "You do not have permission to publish"

```bash
# Need to create @herolabid/litetable organization first
# Or use alternative method (no @ scope)
```

### Error: "Package name too similar to existing package"

```bash
# Choose different name:
@herolabid/litetable/core → @herolabid/litetables/core
# or
litetable-core → lite-table-core
```

### Error: "Version already published"

```bash
# Bump version in package.json
"version": "0.2.1"

# Then publish again
```

### Error: "npm ERR! 402 Payment Required"

```bash
# Trying to publish scoped package (@herolabid/litetable/*) without org
# Solution: Create org or remove @ scope
```

---

## 📊 After Publishing

### **1. Update README Badges**

```markdown
[![npm version](https://img.shields.io/npm/v/@herolabid/litetable/core.svg)](https://www.npmjs.com/package/@herolabid/litetable/core)
[![npm downloads](https://img.shields.io/npm/dm/@herolabid/litetable/core.svg)](https://www.npmjs.com/package/@herolabid/litetable/core)
```

### **2. Create GitHub Release**

```bash
# Tag version
git tag -a v0.2.0 -m "Release v0.2.0"
git push origin v0.2.0

# Then create release on GitHub with RELEASE_NOTES_v0.2.0.md
```

### **3. Announce on Social Media**

Tweet example:
```
🚀 Just published @herolabid/litetable/core v0.2.0!

Ultra-lightweight DataTables alternative:
✅ 8KB (3.7x lighter than Tabulator)
✅ Virtual scrolling (100k+ rows)
✅ Export to Excel (zero deps!)
✅ React & Vue adapters
✅ TypeScript native

npm install @herolabid/litetable/core @herolabid/litetable/react

https://github.com/herolabid/LiteTable.js
```

### **4. Submit to Directories**

- [ ] https://www.npmjs.com/ (automatic)
- [ ] https://www.producthunt.com/
- [ ] https://news.ycombinator.com/
- [ ] https://www.reddit.com/r/javascript/
- [ ] https://dev.to/ (write blog post)

---

## 🎯 Quick Command Reference

```bash
# Login
npm login

# Check login
npm whoami

# Dry run
npm publish --dry-run

# Publish scoped package
npm publish --access public

# Publish regular package
npm publish

# View package info
npm view @herolabid/litetable/core

# Unpublish (within 72 hours)
npm unpublish @herolabid/litetable/core@0.2.0

# Deprecate version
npm deprecate @herolabid/litetable/core@0.2.0 "Please upgrade to 0.2.1"
```

---

## 💡 Best Practices

1. **Always run `npm publish --dry-run` first**
2. **Test installation after publishing**
3. **Use semantic versioning (semver)**
4. **Write good release notes**
5. **Tag git releases**
6. **Update documentation**
7. **Announce to community**

---

## 📞 Need Help?

- npm docs: https://docs.npmjs.com/
- npm support: https://www.npmjs.com/support
- GitHub Issues: https://github.com/herolabid/LiteTable.js/issues

---

**Ready to publish? Follow the steps above! 🚀**

MIT © [Irfan Arsyad](https://github.com/herolabid)
