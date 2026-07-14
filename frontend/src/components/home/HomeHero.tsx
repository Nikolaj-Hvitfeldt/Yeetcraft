import { StatCard } from './StatCard'

export function HomeHero({ total, deaths, yeets }: HomeHeroProps) {
  return (
    <header className="w-full pt-4xl text-center">
      <div className="flex flex-col items-center gap-2xl">
        <div className="w-full max-w-[448px]">
          <h1 className="yeetcraft-brand-title">YeetCraft</h1>
          <p className="text-on-image mt-2 text-[11px] font-semibold uppercase leading-4 tracking-[0.2em] text-text-accent sm:mt-3 sm:text-xs">
            Hall of Shame
          </p>
        </div>

        <div className="mx-auto flex max-w-[448px] flex-wrap justify-center gap-4xl">
          <StatCard label="Total" value={total} kind="total" />
          <StatCard label="Deaths" value={deaths} kind="deaths" />
          <StatCard label="Yeets" value={yeets} kind="yeets" />
        </div>
      </div>
    </header>
  )
}

interface HomeHeroProps {
  total: number
  deaths: number
  yeets: number
}
