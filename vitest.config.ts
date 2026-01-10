import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/',
        '**/examples/'
      ]
    }
  },
  resolve: {
    alias: {
      '@litetable/core': resolve(__dirname, './packages/core/src'),
      '@litetable/react': resolve(__dirname, './packages/react/src'),
      '@litetable/vue': resolve(__dirname, './packages/vue/src')
    }
  }
})
