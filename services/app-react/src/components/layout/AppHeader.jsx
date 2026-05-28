import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from 'primereact/button'
import { useNavigate } from 'react-router-dom'
import sessionStore from '@/stores/session'
import tasksService from '@/services/tasksService'
import projectService from '@/services/projectService'
import tracksService from '@/services/tracksService'
import lextrackingLogo from '@/assets/lextracking-logo.svg'

function toSqlDateTime(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function isTrackRunning(track) {
  if (!track) return false
  return !track.endTime || track.endTime === '0000-00-00 00:00:00' || track.endTime === '' || track.endTime === null
}

export default function AppHeader({ sidebarCollapsed = false, onToggleSidebar }) {
  const navigate = useNavigate()
  const { user, token, setUser, setToken } = sessionStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [searching, setSearching] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [lastTrack, setLastTrack] = useState(null)
  const [trackingLoading, setTrackingLoading] = useState(false)
  const menuRef = useRef(null)

  const username = useMemo(() => user?.name || user?.username || 'User', [user])
  const avatarUrl = useMemo(() => user?.profileImage || user?.avatar || user?.image || '', [user])

  useEffect(() => {
    const onClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => {
    const loadLastTrack = async () => {
      try {
        const track = await tracksService.getCurrentUserLastTrack()
        setLastTrack(track || null)
      } catch (error) {
        setLastTrack(null)
      }
    }
    if (user && token) {
      loadLastTrack()
    }
  }, [user, token])

  const handleSidebarToggle = () => {
    if (onToggleSidebar) {
      onToggleSidebar()
    }
  }

  const handleSearch = async (event) => {
    const nextValue = event.target.value
    setSearchTerm(nextValue)

    if (!nextValue.trim()) return
    setSearching(true)
    try {
      await Promise.all([
        tasksService.getAll({ name: nextValue, status: 'all' }),
        projectService.getAll()
      ])
      if (window.parent && window.parent.postMessage) {
        window.parent.postMessage({ action: 'header-search', query: nextValue }, '*')
      }
    } finally {
      setSearching(false)
    }
  }

  const handleTrackToggle = async () => {
    if (!lastTrack || trackingLoading) return
    setTrackingLoading(true)

    try {
      if (isTrackRunning(lastTrack)) {
        const { duracion, ...payload } = lastTrack
        await tracksService.update({ ...payload, endTime: toSqlDateTime() }, user?.userRole)
        setLastTrack({ ...lastTrack, endTime: toSqlDateTime() })
      } else {
        const payload = {
          idTask: Number(lastTrack.idTask),
          idProyecto: Number(lastTrack.idProyecto || lastTrack.idProject),
          idUser: user?.userId || user?.id,
          name: lastTrack.name || lastTrack.taskName,
          startTime: toSqlDateTime(),
          typeTrack: lastTrack.typeTrack || 'manual',
          currency: lastTrack.currency || 'USD'
        }
        const result = await tracksService.create(payload)
        if (result?.response?.[0]) {
          setLastTrack(result.response[0])
        } else {
          setLastTrack({ ...lastTrack, endTime: null, startTime: payload.startTime })
        }
      }

      if (window.parent && window.parent.postMessage) {
        window.parent.postMessage({ action: 'refresh-timer' }, '*')
      }
    } finally {
      setTrackingLoading(false)
    }
  }

  const handleLogout = () => {
    setMenuOpen(false)
    setUser(null)
    setToken(null)
    if (window.parent && window.parent.postMessage) {
      window.parent.postMessage({ action: 'logout' }, '*')
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center gap-3 px-4 lg:px-10">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-left leading-tight"
          >
            <img src={lextrackingLogo} alt="LexTracking" className="h-7 w-auto" />
          </button>
          <Button
            icon={sidebarCollapsed ? 'pi pi-angle-double-right' : 'pi pi-angle-double-left'}
            className="p-button-text p-button-rounded"
            onClick={handleSidebarToggle}
            aria-label="Toggle sidebar"
          />
        </div>

        <div className="relative ml-2 flex-1 max-w-xl">
          <i className="pi pi-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={handleSearch}
            type="search"
            placeholder="Buscar tareas y proyectos"
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-10 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
          />
          {searching && <i className="pi pi-spin pi-spinner absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />}
        </div>

        <Button
          icon={isTrackRunning(lastTrack) ? 'pi pi-pause' : 'pi pi-play'}
          className="p-button-rounded p-button-text"
          disabled={!lastTrack || trackingLoading}
          onClick={handleTrackToggle}
          aria-label={isTrackRunning(lastTrack) ? 'Pause tracking' : 'Start tracking'}
        />

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-white px-2 py-1.5"
            onClick={() => setMenuOpen((value) => !value)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={username} className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                {username.slice(0, 1).toUpperCase()}
              </span>
            )}
            <span className="hidden text-sm font-medium text-slate-700 sm:block">{username}</span>
            <i className={`pi text-xs text-slate-500 ${menuOpen ? 'pi-chevron-up' : 'pi-chevron-down'}`} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => {
                  setMenuOpen(false)
                  navigate(`/user/${user?.userId || user?.id || ''}`)
                }}
              >
                Mi perfil
              </button>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                onClick={handleLogout}
              >
                Cerrar sesion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
