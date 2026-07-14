import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export function OnlineRefetchListener() {
  const queryClient = useQueryClient()

  useEffect(() => {
    function handleOnline() {
      void queryClient.refetchQueries({
        type: 'active',
        stale: true,
      })
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [queryClient])

  return null
}
