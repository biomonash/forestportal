import { NavLink, Outlet } from 'react-router'

const links = [
  { to: '/upload', label: 'Upload CSV' },
  { to: '/species', label: 'Species' },
  { to: '/sites', label: 'Sites' },
]

export default function Layout() {
  return (
    <div className="min-h-screen p-8">
      <nav className="flex gap-4 mb-8">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isActive ? 'bg-sidebar text-white' : 'bg-white/10 text-muted-foreground hover:bg-white/20'}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}