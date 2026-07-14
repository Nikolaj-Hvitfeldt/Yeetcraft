import { useState, type ReactNode } from 'react'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import type { QueryClient } from '@tanstack/react-query'
import {
  QUERY_CACHE_MAX_AGE_MS,
  shouldDehydratePersistedQuery,
  queryPersister,
} from '../lib/query-persistence'
import { QueryRestoreContext } from '../hooks/query-restore-context'

type QueryAppProvidersProps = {
  client: QueryClient
  children: ReactNode
}

export function QueryAppProviders({ client, children }: QueryAppProvidersProps) {
  const [isRestoring, setIsRestoring] = useState(true)

  return (
    <QueryRestoreContext.Provider value={isRestoring}>
      <PersistQueryClientProvider
        client={client}
        persistOptions={{
          persister: queryPersister,
          maxAge: QUERY_CACHE_MAX_AGE_MS,
          dehydrateOptions: {
            shouldDehydrateQuery: shouldDehydratePersistedQuery,
          },
        }}
        onSuccess={() => setIsRestoring(false)}
        onError={() => setIsRestoring(false)}
      >
        {children}
      </PersistQueryClientProvider>
    </QueryRestoreContext.Provider>
  )
}
