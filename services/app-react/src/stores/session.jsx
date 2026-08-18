import { create } from 'zustand'

export const SESSION_STORAGE_KEY = 'lextracking-react-session'

function loadAppSession() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY))
    return session?.user && session?.token ? session : null
  } catch {
    return null
  }
}

const appSession = loadAppSession()

const sessionStore = create((set) => ({
  user: appSession?.user || null,
  token: appSession?.token || null,
  source: appSession ? 'app' : null,
  setAppSession: (user, token) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ user, token }))
    }
    set({ user, token, source: 'app' })
  },
  setIframeSession: (user, token) => set({ user, token, source: 'iframe' }),
  clearSession: () => {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(SESSION_STORAGE_KEY)
    set({ user: null, token: null, source: null })
  },
}))

export default sessionStore
