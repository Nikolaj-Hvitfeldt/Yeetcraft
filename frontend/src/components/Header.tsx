import { Link, useNavigate } from 'react-router-dom'
import { ThemeSwitcher } from './ThemeSwitcher'
import { useAuth } from '../contexts/AuthContext'

/**
 * Page header with title, subtitle, theme switcher, and login/logout.
 */
export function Header() {
  const auth = useAuth()
  const navigate = useNavigate()
  const handleSignOut = () => {
    auth?.signOut()
    navigate('/')
  }
  return (
    <header className="text-center mb-8 animate-fade-in">
      <div className="flex justify-end items-center gap-3 mb-4">
        {auth?.user ? (
          <span className="text-warcraft-text-muted text-sm">
            {auth.me?.email ?? auth.user.email}
            <button type="button" onClick={handleSignOut} className="ml-2 text-warcraft-gold hover:underline">
              Log out
            </button>
          </span>
        ) : (
          <Link to="/login" className="text-sm text-warcraft-gold hover:underline">Log in</Link>
        )}
        <ThemeSwitcher />
      </div>
      <h1 className="text-5xl md:text-6xl mb-2 tracking-wider">Yeetcraft</h1>
      <p className="text-warcraft-text-muted text-lg font-body mb-6">
        Hall of Shame
      </p>
    </header>
  )
}
