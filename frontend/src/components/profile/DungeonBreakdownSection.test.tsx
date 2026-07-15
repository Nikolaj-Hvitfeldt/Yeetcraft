import type { ComponentProps } from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { DungeonStats } from '../../api/types'
import { DungeonBreakdownSection } from './DungeonBreakdownSection'

const dungeons: DungeonStats[] = [
  {
    dungeon: {
      id: 'd1',
      name: 'Test Dungeon',
      shortName: null,
      displayOrder: 1,
      totalDeaths: 1,
      totalYeets: 2,
      totalMistakes: 3,
    },
    deaths: 1,
    yeets: 2,
    totalMistakes: 3,
  },
]

const noop = vi.fn()

function renderSection(props: Partial<ComponentProps<typeof DungeonBreakdownSection>> = {}) {
  return render(
    <MemoryRouter>
      <DungeonBreakdownSection
        mode="browse"
        dungeons={dungeons}
        onEnterEdit={noop}
        onCancel={noop}
        onDone={noop}
        isSaving={false}
        onAdjust={noop}
        {...props}
      />
    </MemoryRouter>,
  )
}

describe('DungeonBreakdownSection', () => {
  it('hides Edit Stats when write access is unavailable', () => {
    renderSection({ canEdit: false })

    expect(screen.queryByRole('button', { name: 'Edit Stats' })).not.toBeInTheDocument()
  })

  it('shows Edit Stats when write access is available', () => {
    renderSection({ canEdit: true })

    expect(screen.getByRole('button', { name: 'Edit Stats' })).toBeInTheDocument()
  })
})
