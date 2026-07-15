import { useEffect, useState } from 'react'
import { hasWriteAccess, subscribeWriteAccess } from '../utils/token'

export function useWriteAccess(): boolean {
  const [canWrite, setCanWrite] = useState(() => hasWriteAccess())

  useEffect(() => subscribeWriteAccess(setCanWrite), [])

  return canWrite
}
