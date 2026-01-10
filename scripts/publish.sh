#!/bin/bash

# LiteTable.js - NPM Publish Script
# Run this after: npm login

set -e

echo "=================================="
echo "📦 LiteTable.js - NPM Publisher"
echo "=================================="
echo ""

# Check if logged in
echo "🔍 Checking npm login..."
if ! npm whoami > /dev/null 2>&1; then
    echo "❌ Not logged in to npm!"
    echo "Please run: npm login"
    exit 1
fi

NPM_USER=$(npm whoami)
echo "✅ Logged in as: $NPM_USER"
echo ""

# Build packages
echo "🔨 Building all packages..."
pnpm build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi
echo "✅ Build successful"
echo ""

# Dry run
echo "🧪 Dry run for all packages..."
echo ""

echo "→ @herolabid/litetable/core"
cd packages/core
npm publish --dry-run --access public
cd ../..

echo ""
echo "→ @herolabid/litetable/react"
cd packages/react
npm publish --dry-run --access public
cd ../..

echo ""
echo "→ @herolabid/litetable/vue"
cd packages/vue
npm publish --dry-run --access public
cd ../..

echo ""
echo "=================================="
echo "📋 Review the output above"
echo "=================================="
echo ""
read -p "Do you want to publish for real? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Publish cancelled"
    exit 0
fi

echo ""
echo "🚀 Publishing packages..."
echo ""

# Publish core
echo "→ Publishing @herolabid/litetable/core..."
cd packages/core
npm publish --access public
cd ../..
echo "✅ @herolabid/litetable/core published!"

# Publish react
echo ""
echo "→ Publishing @herolabid/litetable/react..."
cd packages/react
npm publish --access public
cd ../..
echo "✅ @herolabid/litetable/react published!"

# Publish vue
echo ""
echo "→ Publishing @herolabid/litetable/vue..."
cd packages/vue
npm publish --access public
cd ../..
echo "✅ @herolabid/litetable/vue published!"

echo ""
echo "=================================="
echo "🎉 All packages published!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Verify: npm view @herolabid/litetable/core"
echo "2. Test install: npm install @herolabid/litetable/core"
echo "3. Create GitHub Release"
echo "4. Announce on social media"
echo ""
echo "Documentation: ./NPM_PUBLISH_GUIDE.md"
