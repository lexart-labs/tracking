import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PrimeReactProvider } from 'primereact/api'
import { http, HttpResponse } from 'msw'
import { server } from '../../../mocks/server.js'
import { setSession, developerUser, pmUser } from '../../helpers/mockSession.js'
import ClientList from '@/application/pages/clients/list/ClientList'

function renderWithProviders(ui) {
  return render(
    <PrimeReactProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </PrimeReactProvider>
  )
}

describe('ClientList', () => {
  it('renders "Clients" heading and "+ CLIENT" button for admin', async () => {
    setSession()
    renderWithProviders(<ClientList />)
    expect(screen.getByText('Clients')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /New Client/i })).toBeInTheDocument()
  })

  it('loads and displays clients from API', async () => {
    setSession()
    renderWithProviders(<ClientList />)
    await waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeInTheDocument()
      expect(screen.getByText('Inactive Ltd')).toBeInTheDocument()
    })
  })

  it('shows Active and Inactive status tags', async () => {
    setSession()
    renderWithProviders(<ClientList />)
    await waitFor(() => {
      expect(screen.getByText('Active')).toBeInTheDocument()
      expect(screen.getByText('Inactive')).toBeInTheDocument()
    })
  })

  it('shows Access Denied for developer role', () => {
    setSession(developerUser)
    renderWithProviders(<ClientList />)
    expect(screen.getByText(/Access Denied/i)).toBeInTheDocument()
  })

  it('does NOT show Access Denied for pm role', () => {
    setSession(pmUser)
    renderWithProviders(<ClientList />)
    expect(screen.queryByText(/Access Denied/i)).not.toBeInTheDocument()
    expect(screen.getByText('Clients')).toBeInTheDocument()
  })

  it('shows empty message when API returns empty array', async () => {
    setSession()
    server.use(
      http.get('http://localhost:8081/clients/all', () =>
        HttpResponse.json({ response: [] })
      )
    )
    renderWithProviders(<ClientList />)
    await waitFor(() => {
      expect(screen.getByText('No clients found.')).toBeInTheDocument()
    })
  })
})
