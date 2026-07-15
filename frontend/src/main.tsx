import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient } from '@tanstack/react-query'
import { App } from './App'
import { QueryAppProviders } from './components/QueryAppProviders'
import { captureTokenFromUrl } from './utils/token'
import {
  queryRetryDelay,
  READ_QUERY_GC_TIME_MS,
  READ_QUERY_STALE_TIME_MS,
  shouldRetryQuery,
} from './lib/query-defaults'
import './styles/index.css'

captureTokenFromUrl()

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: READ_QUERY_STALE_TIME_MS,
      gcTime: READ_QUERY_GC_TIME_MS,
      retry: shouldRetryQuery,
      retryDelay: queryRetryDelay,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      networkMode: 'offlineFirst',
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryAppProviders client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryAppProviders>
  </React.StrictMode>,
)
