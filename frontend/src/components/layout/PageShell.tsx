import type { ReactNode } from 'react'
import { AuthRequired } from '../AuthRequired'
import { ErrorMessage } from '../ErrorMessage'
import { LoadingSpinner } from '../LoadingSpinner'
import { useAuthGuard } from '../../hooks/useAuthGuard'

export function PageShell({
  isLoading,
  error,
  notFoundMessage,
  children,
}: PageShellProps) {
  const { showAuthRequired } = useAuthGuard(error ?? null)

  if (isLoading) return <LoadingSpinner />
  if (showAuthRequired) return <AuthRequired />
  if (error) return <ErrorMessage message={error.message} />
  if (notFoundMessage) return <ErrorMessage message={notFoundMessage} />

  return <>{children}</>
}

interface PageShellProps {
  isLoading?: boolean
  error?: Error | null
  notFoundMessage?: string | null
  children: ReactNode
}
