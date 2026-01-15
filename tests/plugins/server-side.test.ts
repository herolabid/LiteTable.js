import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ServerSideManager } from '../../packages/core/src/plugins/server-side'

describe('ServerSideManager', () => {
  let serverSide: ServerSideManager
  const mockUrl = 'https://api.example.com/users'

  // Mock fetch globally
  const originalFetch = global.fetch
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockFetch = vi.fn()
    global.fetch = mockFetch
    serverSide = new ServerSideManager({ url: mockUrl })
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.clearAllTimers()
  })

  describe('Initialization', () => {
    it('should initialize with default config', () => {
      expect(serverSide).toBeDefined()
      const state = serverSide.getState()
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
      expect(state.data).toEqual([])
      expect(state.totalRows).toBe(0)
    })

    it('should initialize with custom config', () => {
      const customServerSide = new ServerSideManager({
        url: mockUrl,
        method: 'POST',
        pagination: false,
        sorting: false,
        filtering: false,
      })
      expect(customServerSide).toBeDefined()
    })
  })

  describe('Fetch Data - Success', () => {
    it('should fetch data successfully (GET)', async () => {
      const mockResponse = {
        data: [
          { id: 1, name: 'User 1' },
          { id: 2, name: 'User 2' },
        ],
        total: 50,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await serverSide.fetchData({
        page: 1,
        pageSize: 10,
      })

      const state = serverSide.getState()
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
      expect(state.data).toEqual(mockResponse.data)
      expect(state.totalRows).toBe(50)
    })

    it('should build GET URL with query params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      })

      await serverSide.fetchData({
        page: 2,
        pageSize: 25,
        sortBy: 'name',
        sortDirection: 'asc',
        search: 'john',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2'),
        expect.any(Object)
      )
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('pageSize=25'),
        expect.any(Object)
      )
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('sortBy=name'),
        expect.any(Object)
      )
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('search=john'),
        expect.any(Object)
      )
    })

    it('should use POST method when configured', async () => {
      serverSide = new ServerSideManager({
        url: mockUrl,
        method: 'POST',
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      })

      await serverSide.fetchData({
        page: 1,
        pageSize: 10,
      })

      expect(mockFetch).toHaveBeenCalledWith(
        mockUrl,
        expect.objectContaining({
          method: 'POST',
          body: expect.any(String),
        })
      )
    })

    it('should include custom headers', async () => {
      serverSide = new ServerSideManager({
        url: mockUrl,
        headers: {
          Authorization: 'Bearer token123',
        },
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      })

      await serverSide.fetchData({
        page: 1,
        pageSize: 10,
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer token123',
          }),
        })
      )
    })

    it('should set loading state during fetch', async () => {
      let capturedState: any

      serverSide.onChange(state => {
        if (state.loading) {
          capturedState = state
        }
      })

      mockFetch.mockImplementationOnce(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({ data: [], total: 0 }),
            })
          }, 100)
        })
      })

      const promise = serverSide.fetchData({
        page: 1,
        pageSize: 10,
      })

      // Should be loading
      expect(capturedState?.loading).toBe(true)

      await promise
    })
  })

  describe('Fetch Data - Error Handling', () => {
    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })

      await serverSide.fetchData({
        page: 1,
        pageSize: 10,
      })

      const state = serverSide.getState()
      expect(state.loading).toBe(false)
      expect(state.error).toBeInstanceOf(Error)
      expect(state.error?.message).toContain('404')
      expect(state.data).toEqual([])
      expect(state.totalRows).toBe(0)
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await serverSide.fetchData({
        page: 1,
        pageSize: 10,
      })

      const state = serverSide.getState()
      expect(state.loading).toBe(false)
      expect(state.error).toBeInstanceOf(Error)
      expect(state.error?.message).toContain('Network error')
    })

    it('should call onError callback', async () => {
      const onError = vi.fn()
      serverSide = new ServerSideManager({
        url: mockUrl,
        onError,
      })

      mockFetch.mockRejectedValueOnce(new Error('Test error'))

      await serverSide.fetchData({
        page: 1,
        pageSize: 10,
      })

      expect(onError).toHaveBeenCalledWith(expect.any(Error))
    })

    it('should not call onError for aborted requests', async () => {
      const onError = vi.fn()
      serverSide = new ServerSideManager({
        url: mockUrl,
        onError,
      })

      const abortError = new Error('Aborted')
      abortError.name = 'AbortError'
      mockFetch.mockRejectedValueOnce(abortError)

      await serverSide.fetchData({
        page: 1,
        pageSize: 10,
      })

      expect(onError).not.toHaveBeenCalled()
    })
  })

  describe('Request Cancellation', () => {
    it('should cancel previous request when new one is made', async () => {
      let aborted = false

      mockFetch.mockImplementation(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => {
              const error = new Error('Aborted')
              error.name = 'AbortError'
              aborted = true
              reject(error)
            }, 100)
          })
      )

      // Start first request
      serverSide.fetchData({ page: 1, pageSize: 10 })

      // Start second request immediately (should cancel first)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      })

      await serverSide.fetchData({ page: 2, pageSize: 10 })

      // Wait a bit for first request's timeout
      await new Promise(resolve => setTimeout(resolve, 150))

      expect(aborted).toBe(true)
    })

    it('should cancel request manually', async () => {
      mockFetch.mockImplementationOnce(
        () =>
          new Promise(() => {
            // Never resolves
          })
      )

      const promise = serverSide.fetchData({ page: 1, pageSize: 10 })
      serverSide.cancel()

      // Should not throw
      await expect(promise).resolves.toBeUndefined()
    })
  })

  describe('Debounced Fetch', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should debounce fetch calls', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      })

      // Make multiple rapid calls
      serverSide.fetchDataDebounced({ page: 1, pageSize: 10 })
      serverSide.fetchDataDebounced({ page: 2, pageSize: 10 })
      serverSide.fetchDataDebounced({ page: 3, pageSize: 10 })

      // Should not have called fetch yet
      expect(mockFetch).not.toHaveBeenCalled()

      // Advance timers past debounce delay
      vi.advanceTimersByTime(300)

      // Wait for promises
      await vi.runAllTimersAsync()

      // Should have called fetch only once (for last call)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should use custom debounce delay', async () => {
      serverSide = new ServerSideManager({
        url: mockUrl,
        searchDebounce: 500,
      })

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      })

      serverSide.fetchDataDebounced({ page: 1, pageSize: 10 })

      vi.advanceTimersByTime(300)
      expect(mockFetch).not.toHaveBeenCalled()

      vi.advanceTimersByTime(200)
      await vi.runAllTimersAsync()

      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('Request/Response Transformation', () => {
    it('should transform request params', async () => {
      serverSide = new ServerSideManager({
        url: mockUrl,
        transformRequest: params => ({
          p: params.page,
          ps: params.pageSize,
          custom: 'value',
        }),
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      })

      await serverSide.fetchData({
        page: 1,
        pageSize: 10,
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('p=1'),
        expect.any(Object)
      )
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('custom=value'),
        expect.any(Object)
      )
    })

    it('should transform response data', async () => {
      serverSide = new ServerSideManager({
        url: mockUrl,
        transformResponse: response => ({
          data: response.items,
          total: response.totalCount,
        }),
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [{ id: 1 }, { id: 2 }],
          totalCount: 100,
        }),
      })

      await serverSide.fetchData({
        page: 1,
        pageSize: 10,
      })

      const state = serverSide.getState()
      expect(state.data).toEqual([{ id: 1 }, { id: 2 }])
      expect(state.totalRows).toBe(100)
    })
  })

  describe('Configuration Options', () => {
    it('should disable pagination params when pagination is false', async () => {
      serverSide = new ServerSideManager({
        url: mockUrl,
        pagination: false,
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      })

      await serverSide.fetchData({
        page: 1,
        pageSize: 10,
      })

      const callUrl = mockFetch.mock.calls[0][0] as string
      expect(callUrl).not.toContain('page=')
      expect(callUrl).not.toContain('pageSize=')
    })

    it('should disable sorting params when sorting is false', async () => {
      serverSide = new ServerSideManager({
        url: mockUrl,
        sorting: false,
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      })

      await serverSide.fetchData({
        page: 1,
        pageSize: 10,
        sortBy: 'name',
        sortDirection: 'asc',
      })

      const callUrl = mockFetch.mock.calls[0][0] as string
      expect(callUrl).not.toContain('sortBy=')
    })

    it('should disable filtering params when filtering is false', async () => {
      serverSide = new ServerSideManager({
        url: mockUrl,
        filtering: false,
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      })

      await serverSide.fetchData({
        page: 1,
        pageSize: 10,
        search: 'test',
      })

      const callUrl = mockFetch.mock.calls[0][0] as string
      expect(callUrl).not.toContain('search=')
    })
  })

  describe('State Management', () => {
    it('should return current state', () => {
      const state = serverSide.getState()
      expect(state).toHaveProperty('loading')
      expect(state).toHaveProperty('error')
      expect(state).toHaveProperty('data')
      expect(state).toHaveProperty('totalRows')
      expect(state).toHaveProperty('lastParams')
    })

    it('should return immutable state', () => {
      const state = serverSide.getState()
      expect(() => {
        (state as any).loading = true
      }).toThrow()
    })

    it('should save last request params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      })

      const params = {
        page: 2,
        pageSize: 25,
        sortBy: 'name',
        sortDirection: 'desc' as const,
      }

      await serverSide.fetchData(params)

      const state = serverSide.getState()
      expect(state.lastParams).toEqual(params)
    })
  })

  describe('Event Listeners', () => {
    it('should allow subscribing to changes', async () => {
      const listener = vi.fn()
      const unsubscribe = serverSide.onChange(listener)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      })

      await serverSide.fetchData({
        page: 1,
        pageSize: 10,
      })

      expect(listener).toHaveBeenCalled()
      unsubscribe()
    })

    it('should emit state to all listeners', async () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      serverSide.onChange(listener1)
      serverSide.onChange(listener2)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      })

      await serverSide.fetchData({
        page: 1,
        pageSize: 10,
      })

      expect(listener1).toHaveBeenCalled()
      expect(listener2).toHaveBeenCalled()
    })

    it('should allow unsubscribing', async () => {
      const listener = vi.fn()
      const unsubscribe = serverSide.onChange(listener)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      })

      unsubscribe()

      await serverSide.fetchData({
        page: 1,
        pageSize: 10,
      })

      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('Cleanup', () => {
    it('should cleanup on destroy', async () => {
      const listener = vi.fn()
      serverSide.onChange(listener)

      serverSide.destroy()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      })

      await serverSide.fetchData({
        page: 1,
        pageSize: 10,
      })

      expect(listener).not.toHaveBeenCalled()
    })

    it('should cancel pending requests on destroy', async () => {
      mockFetch.mockImplementationOnce(
        () =>
          new Promise(() => {
            // Never resolves
          })
      )

      serverSide.fetchData({ page: 1, pageSize: 10 })
      serverSide.destroy()

      // Should not throw
      expect(serverSide.getState().loading).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      })

      await serverSide.fetchData({
        page: 1,
        pageSize: 10,
      })

      const state = serverSide.getState()
      expect(state.data).toEqual([])
      expect(state.totalRows).toBe(0)
    })

    it('should handle custom params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      })

      await serverSide.fetchData({
        page: 1,
        pageSize: 10,
        customParam: 'value',
        anotherParam: 123,
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('customParam=value'),
        expect.any(Object)
      )
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('anotherParam=123'),
        expect.any(Object)
      )
    })

    it('should handle null/undefined params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      })

      await serverSide.fetchData({
        page: 1,
        pageSize: 10,
        sortBy: undefined,
        search: undefined,
      })

      const callUrl = mockFetch.mock.calls[0][0] as string
      expect(callUrl).not.toContain('sortBy=undefined')
      expect(callUrl).not.toContain('search=undefined')
    })
  })
})
