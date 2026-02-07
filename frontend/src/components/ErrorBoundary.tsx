import { Component, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Root error boundary that catches unhandled React errors
 * and renders a fallback UI instead of white-screening.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="wc-panel p-8 max-w-md text-center">
          <h2 className="text-2xl mb-4">Something went wrong</h2>
          <p className="text-warcraft-text-muted mb-6">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button onClick={this.handleReload} className="wc-button">
            Reload Page
          </button>
        </div>
      </div>
    )
  }
}
