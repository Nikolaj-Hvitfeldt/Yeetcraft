import { ThemeSwitcher } from '../ThemeSwitcher'

export function HomeNavigation() {
  return (
    <nav className="flex w-full items-center justify-between px-xs py-sm">
      <div className="flex items-center gap-md rounded-md py-sm pr-md">
        <div className="flex size-10 items-center justify-center rounded-md bg-accent-secondary text-background-app shadow-lg">
          <span className="font-heading text-xl font-bold leading-none">Y</span>
        </div>
        <div>
          <p className="font-heading text-xl font-bold leading-6 text-accent-primary">YeetCraft</p>
          <p className="text-xs font-semibold leading-4 text-text-secondary">Mythic+ Hall of Shame</p>
        </div>
      </div>
      <ThemeSwitcher />
    </nav>
  )
}
