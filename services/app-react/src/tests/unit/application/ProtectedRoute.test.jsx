import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import ProtectedRoute from '@/application/components/ProtectedRoute'

describe('ProtectedRoute', () => {
  it('redirects to login when no session is available', () => {
    render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/private" element={<p>Private</p>} />
          </Route>
          <Route path="/login" element={<p>Login</p>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Login')).toBeInTheDocument()
  })
})
