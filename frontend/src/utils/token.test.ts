import { describe, expect, it, vi } from 'vitest'
import {
  captureTokenFromUrl,
  clearAccessToken,
  getAccessToken,
  hasWriteAccess,
  subscribeWriteAccess,
} from './token'

function mockLocation(href: string) {
  Object.defineProperty(window, 'location', {
    configurable: true,
    writable: true,
    value: { href, search: new URL(href).search },
  })
}

describe('token utilities', () => {
  it('captures token from URL and removes the query parameter', () => {
    const replaceState = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {})
    mockLocation('http://example.com/?token=shared-key')

    captureTokenFromUrl()

    expect(getAccessToken()).toBe('shared-key')
    expect(replaceState).toHaveBeenCalled()
    replaceState.mockRestore()
  })

  it('reports write access from stored token', () => {
    localStorage.setItem('yeetcraft_token', 'shared-key')

    expect(hasWriteAccess()).toBe(true)
  })

  it('clears stored token and notifies subscribers', () => {
    localStorage.setItem('yeetcraft_token', 'shared-key')
    const listener = vi.fn()
    subscribeWriteAccess(listener)

    clearAccessToken()

    expect(getAccessToken()).toBeNull()
    expect(listener).toHaveBeenCalledWith(false)
  })

  it('notifies subscribers when token is captured from URL', () => {
    vi.spyOn(window.history, 'replaceState').mockImplementation(() => {})
    mockLocation('http://example.com/?token=shared-key')
    const listener = vi.fn()
    subscribeWriteAccess(listener)

    captureTokenFromUrl()

    expect(listener).toHaveBeenCalledWith(true)
  })
})
