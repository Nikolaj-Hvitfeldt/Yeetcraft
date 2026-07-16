import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Avatar } from './Avatar'

afterEach(() => {
  cleanup()
})

describe('Avatar', () => {
  it('reserves stable dimensions for each size variant', () => {
    const { rerender, container } = render(
      <Avatar name="Seb" imageUrl="https://cdn.example.com/seb.webp" size="sm" />,
    )
    let image = within(container).getByRole('img', { name: 'Seb avatar' })
    expect(image).toHaveAttribute('width', '48')
    expect(image).toHaveAttribute('height', '48')
    expect(image.className).toContain('size-12')

    rerender(
      <Avatar name="Seb" imageUrl="https://cdn.example.com/seb.webp" size="lg" />,
    )
    image = within(container).getByRole('img', { name: 'Seb avatar' })
    expect(image).toHaveAttribute('width', '96')
    expect(image).toHaveAttribute('height', '96')
    expect(image.className).toContain('size-24')

    rerender(
      <Avatar
        name="Seb"
        imageUrl="https://cdn.example.com/seb.webp"
        size="achievement"
      />,
    )
    image = within(container).getByRole('img', { name: 'Seb avatar' })
    expect(image).toHaveAttribute('width', '32')
    expect(image).toHaveAttribute('height', '32')
    expect(image.className).toContain('size-7')
    expect(image.className).toContain('rounded-full')
  })

  it('falls back to the initial placeholder when the image errors', () => {
    render(
      <Avatar name="Seb" imageUrl="https://cdn.example.com/broken.webp" />,
    )

    const image = screen.getByRole('img', { name: 'Seb avatar' })
    fireEvent.error(image)

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('S')).toBeInTheDocument()
  })

  it('resets failed-image state when the src changes', () => {
    const { rerender } = render(
      <Avatar name="Seb" imageUrl="https://cdn.example.com/broken.webp" />,
    )

    fireEvent.error(screen.getByRole('img', { name: 'Seb avatar' }))
    expect(screen.getByText('S')).toBeInTheDocument()

    rerender(
      <Avatar name="Seb" imageUrl="https://cdn.example.com/seb.webp" />,
    )

    const recovered = screen.getByRole('img', { name: 'Seb avatar' })
    expect(recovered).toHaveAttribute('src', 'https://cdn.example.com/seb.webp')
    expect(screen.queryByText('S')).not.toBeInTheDocument()
  })

  it('uses empty alt text for decorative avatars', () => {
    const { container } = render(
      <Avatar
        name="Seb"
        imageUrl="https://cdn.example.com/seb.webp"
        decorative
      />,
    )

    const image = container.querySelector('img')
    expect(image).not.toBeNull()
    expect(image).toHaveAttribute('alt', '')
  })

  it('omits the loading attribute when loading is not provided', () => {
    render(
      <Avatar name="Seb" imageUrl="https://cdn.example.com/seb.webp" />,
    )

    expect(screen.getByRole('img', { name: 'Seb avatar' })).not.toHaveAttribute(
      'loading',
    )
  })

  it('passes through an explicit loading value', () => {
    render(
      <Avatar
        name="Seb"
        imageUrl="https://cdn.example.com/seb.webp"
        loading="eager"
      />,
    )

    expect(screen.getByRole('img', { name: 'Seb avatar' })).toHaveAttribute(
      'loading',
      'eager',
    )
  })
})
