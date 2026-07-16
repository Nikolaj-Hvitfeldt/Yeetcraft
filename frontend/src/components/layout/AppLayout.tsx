import { Outlet, useLocation } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { ConnectionStatusBanner } from '../ConnectionStatusBanner'
import { ConnectionStatusProvider } from '../ConnectionStatusProvider'

const APP_LAYOUT_CONTENT_CLASS =
  'mx-auto flex w-full max-w-[1280px] flex-col px-2xl py-2xl'

export function AppLayout() {
  const { pathname } = useLocation()
  const isHome = /^\/[^/]+$/.test(pathname)

  return (
    <ConnectionStatusProvider>
      <div
        className={cn(
          'app-page-backdrop min-h-screen bg-background-app',
        )}
      >
        <ConnectionStatusBanner />
        <main className={cn(APP_LAYOUT_CONTENT_CLASS, isHome && 'min-h-screen')}>
          <Outlet />
        </main>
      </div>
    </ConnectionStatusProvider>
  )
}
