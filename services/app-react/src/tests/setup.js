import '@testing-library/jest-dom'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './mocks/server.js'
import sessionStore from '@/stores/session'

// Mock @iframe-resizer/child — it runs init code that requires a real iframe
vi.mock('@iframe-resizer/child', () => ({}))

// ResizeObserver polyfill for jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// MSW lifecycle + cleanup in correct order
// cleanup() MUST run before clearing session to avoid re-renders on null user
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => {
  server.resetHandlers()
  cleanup()
  sessionStore.setState({ user: null, token: null })
})
afterAll(() => server.close())
