import { Outlet, useLocation } from 'react-router-dom'
import { cn } from '../../utils/cn'

const APP_LAYOUT_CONTENT_CLASS =
  'mx-auto flex w-full max-w-[1280px] flex-col px-2xl py-2xl'

export function AppLayout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <div
      className={cn(
        'min-h-screen bg-background-app',
        isHome && 'home-page-backdrop',
      )}
    >
      <div className={cn(APP_LAYOUT_CONTENT_CLASS, isHome && 'min-h-screen')}>
        <Outlet />
      </div>
    </div>
  )
}
