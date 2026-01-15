import { expect, vi } from 'vitest'

// Custom matchers can be added here
expect.extend({
  // Example: toBeWithinRange(received, floor, ceiling)
})

// Mock URL.createObjectURL and revokeObjectURL for jsdom
if (typeof URL.createObjectURL === 'undefined') {
  URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  URL.revokeObjectURL = vi.fn()
}
