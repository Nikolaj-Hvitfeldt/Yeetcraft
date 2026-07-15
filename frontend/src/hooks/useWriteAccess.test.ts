import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { clearAccessToken } from '../utils/token'
import { useWriteAccess } from './useWriteAccess'

describe('useWriteAccess', () => {
  it('reflects stored write access', () => {
    localStorage.setItem('yeetcraft_token', 'shared-key')

    const { result } = renderHook(() => useWriteAccess())

    expect(result.current).toBe(true)
  })

  it('updates when write access is cleared', () => {
    localStorage.setItem('yeetcraft_token', 'shared-key')

    const { result } = renderHook(() => useWriteAccess())

    act(() => {
      clearAccessToken()
    })

    expect(result.current).toBe(false)
  })
})
