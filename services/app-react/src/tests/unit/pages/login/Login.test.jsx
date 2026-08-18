import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router-dom'
import Login from '@/application/pages/login/Login'
import { server } from '@/tests/mocks/server.js'

const LOGIN_URL = 'http://localhost:8081/user/login'

function renderLogin() {
  return render(<MemoryRouter><Login /></MemoryRouter>)
}

describe('Login', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {})
  })

  it('sends the authenticated user to the Angular shell', async () => {
    const user = { id: 7, name: 'Ada', email: 'ada@example.com', role: 'admin', token: 'jwt-token' }
    server.use(
      http.post(LOGIN_URL, () => HttpResponse.json({ response: user }))
    )

    renderLogin()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: user.email } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'secret123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }))

    await waitFor(() => {
      expect(window.parent.postMessage).toHaveBeenCalledWith(
        { action: 'login-success', user },
        window.location.origin
      )
    })
  })

  it('shows an error when authentication fails', async () => {
    server.use(
      http.post(LOGIN_URL, () => new HttpResponse(null, { status: 400 }))
    )

    renderLogin()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ada@example.com' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'wrong-password' } })
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('El email o la contraseña son incorrectos.')
    expect(window.parent.postMessage).not.toHaveBeenCalled()
  })
})
