import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { resetScrollPosition } from '../../utils/scroll'

export function ScrollToTop() {
  const location = useLocation()

  useLayoutEffect(() => {
    resetScrollPosition()
  }, [location.pathname, location.key])

  return null
}
