import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PageBoundary } from './PageBoundary'

vi.mock('../../hooks/connection-status-context', () => ({
  useReportPageRefresh: vi.fn(),
}))

describe('PageBoundary', () => {
  it('renders loading spinner when loading', () => {
    render(
      <PageBoundary isLoading>
        <div>Content</div>
      </PageBoundary>,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Loading the Hall of Shame...')
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
  })

  it('renders not found message', () => {
    render(
      <PageBoundary notFoundMessage="Player stats were not found.">
        <div>Content</div>
      </PageBoundary>,
    )

    expect(screen.getByText('Not Found')).toBeInTheDocument()
    expect(screen.getByText('Player stats were not found.')).toBeInTheDocument()
  })

  it('renders blocking error when there is no content', () => {
    render(
      <PageBoundary error={new Error('Server unavailable')}>
        {null}
      </PageBoundary>,
    )

    expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument()
  })

  it('does not render auth required for unauthorized errors', () => {
    render(
      <PageBoundary error={new Error('Unauthorized')}>
        {null}
      </PageBoundary>,
    )

    expect(screen.queryByText('Access Required')).not.toBeInTheDocument()
    expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument()
  })

  it('renders children while refreshing', () => {
    render(
      <PageBoundary isRefreshing>
        <div>Profile content</div>
      </PageBoundary>,
    )

    expect(screen.getByText('Profile content')).toBeInTheDocument()
  })

  it('shows content alongside non-blocking error', () => {
    render(
      <PageBoundary error={new Error('Background refresh failed')}>
        <div>Cached content</div>
      </PageBoundary>,
    )

    expect(screen.getByText('Cached content')).toBeInTheDocument()
    expect(screen.queryByText('Background refresh failed')).not.toBeInTheDocument()
  })
})
