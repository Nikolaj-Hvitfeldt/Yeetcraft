import { StatCard } from './StatCard'

export function HomeHero({ total, deaths, yeets }: HomeHeroProps) {
  return (
    <header className="w-full pt-4xl text-center">
      <p className="text-xs font-bold uppercase leading-4 tracking-wide text-accent-primary">
        Hall of Shame
      </p>
      <h1 className="pt-sm text-5xl font-bold leading-tight text-accent-secondary md:text-7xl md:leading-[76px]">
        YeetCraft
      </h1>
      <div className="mx-auto flex max-w-[448px] flex-wrap justify-center gap-4xl pt-2xl">
        <StatCard label="Total" value={total} kind="total" />
        <StatCard label="Deaths" value={deaths} kind="deaths" />
        <StatCard label="Yeets" value={yeets} kind="yeets" />
      </div>
    </header>
  )
}

interface HomeHeroProps {
  total: number
  deaths: number
  yeets: number
}
