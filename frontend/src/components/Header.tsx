import { HealthResponse } from '../api/types'

interface HeaderProps {
  health: HealthResponse | undefined
}

/**
 * Page header with title and server status.
 */
export function Header({ health }: HeaderProps) {
  return (
    <header className="text-center mb-8 animate-fade-in">
      <h1 className="text-5xl md:text-6xl mb-2 tracking-wider">Yeetcraft</h1>
      <p className="text-warcraft-text-muted text-lg font-body mb-6">
        Hall of Shame
      </p>

      {/*Server status if needed later on*/}
      {/* {health && (
        <div className="inline-flex items-center gap-2 px-4 py-2 wc-panel text-sm">
          <span
            className={`w-2 h-2 rounded-full ${
              health.status === 'ok' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}
          />
          <span className="text-warcraft-text-muted">
            Server:{' '}
            <span className={health.status === 'ok' ? 'text-green-400' : 'text-red-400'}>
              {health.status}
            </span>
          </span>
        </div>
      )} */}
      
    </header>
  )
}
