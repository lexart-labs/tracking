import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/services/api'
import logo from '@/assets/lextracking-logo.svg'
import sessionStore from '@/stores/session'

const parentOrigin = document.referrer ? new URL(document.referrer).origin : window.location.origin

export default function Login() {
  const navigate = useNavigate()
  const setAppSession = sessionStore((state) => state.setAppSession)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/user/login', { email, password })
      const user = response.data.response || response.data

      if (!user?.token) throw new Error('Invalid login response')

      setAppSession({
        ...user,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
      }, user.token)

      window.parent.postMessage({ action: 'login-success', user }, parentOrigin)
      navigate('/', { replace: true })
    } catch {
      setError('El email o la contraseña son incorrectos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-[#7076fe] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-white/10" />
        <div className="absolute -bottom-40 -right-24 h-[30rem] w-[30rem] rounded-full bg-[#8e93ff]" />
        <p className="relative text-lg font-semibold tracking-wide">LexTracking</p>
        <div className="relative max-w-lg pb-16">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-white/70">Tu jornada, más clara</p>
          <h1 className="text-5xl font-semibold leading-tight">Registrá tu tiempo. Enfocate en lo importante.</h1>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md">
          <img className="mb-14 h-auto w-64 max-w-full" src={logo} alt="LexTracking" />
          <h2 className="text-3xl font-semibold text-slate-900">Iniciar sesión</h2>
          <p className="mt-2 text-slate-500">Ingresá tus datos para continuar.</p>

          <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="email">Email</label>
              <input
                autoComplete="email"
                autoFocus
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-[#7076fe] focus:ring-4 focus:ring-[#7076fe]/10"
                id="email"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="password">Contraseña</label>
              <input
                autoComplete="current-password"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-[#7076fe] focus:ring-4 focus:ring-[#7076fe]/10"
                id="password"
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </div>

            <p aria-live="polite" className="min-h-5 text-sm font-medium text-red-600" role="alert">{error}</p>

            <button
              className="w-full rounded-lg bg-[#7076fe] px-4 py-3 font-semibold text-white transition hover:bg-[#6067ed] focus:outline-none focus:ring-4 focus:ring-[#7076fe]/25 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading || !email || !password}
              type="submit"
            >
              {loading ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
