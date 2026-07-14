import { StatCard } from './StatCard'

export function HomeHero({ total, deaths, yeets }: HomeHeroProps) {
  return (
    <header className="w-full pt-4xl text-center">
      <div className="flex flex-col items-center">
        <div className="flex w-full max-w-[448px] flex-col items-center">
          <p className="whitespace-nowrap text-xs font-bold leading-4 text-accent-primary">
            Hall of Shame
          </p>
          <h1 className="yeetcraft-brand-title pt-sm">YeetCraft</h1>
        </div>

        <div className="mx-auto flex max-w-[448px] flex-wrap justify-center gap-4xl pt-2xl">
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
