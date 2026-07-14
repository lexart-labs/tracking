import { NavLink } from 'react-router-dom'
import sessionStore from '@/stores/session'

function normalizeRole(user) {
  const role = (user?.userRole || user?.role || '').toString().toLowerCase()
  if (role === 'admin' || role === 'pm') return role
  return 'user'
}

const adminPmItems = [
  { label: 'Dashboard', to: '/', icon: 'pi pi-home' },
  { label: 'Payment request', to: '/payment-requests', icon: 'pi pi-wallet' },
  { label: 'Payment request (admin)', to: '/admin/payment-requests', icon: 'pi pi-briefcase' },
  { label: 'Users', to: '/users', icon: 'pi pi-users' },
  { label: 'Clients', to: '/clients', icon: 'pi pi-building' },
  { label: 'Projects', to: '/tasks', icon: 'pi pi-folder' },
  { label: 'Reports', to: '/tracks', icon: 'pi pi-chart-bar' },
  { label: 'Rates', to: '/weeklyhours', icon: 'pi pi-percentage' },
]

const userItems = [
  { label: 'Dashboard', to: '/', icon: 'pi pi-home' },
  { label: 'Payment request', to: '/payment-requests', icon: 'pi pi-wallet' },
  { label: 'Projects', to: '/tasks', icon: 'pi pi-folder' },
  { label: 'Reports', to: '/tracks', icon: 'pi pi-chart-bar' },
]

export default function AppSidebar({ collapsed = false }) {
  const { user } = sessionStore()
  const role = normalizeRole(user)
  const items = role === 'admin' || role === 'pm' ? adminPmItems : userItems

  return (
    <aside className={`sticky top-16 h-[calc(100vh-4rem)] border-r border-slate-200 bg-white transition-all ${collapsed ? 'w-16' : 'w-64'}`}>
      <nav className="flex h-full flex-col gap-1 p-3">
        {items.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`
            }
          >
            <i className={`${item.icon} text-base`} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
