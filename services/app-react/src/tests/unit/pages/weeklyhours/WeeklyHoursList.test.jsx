import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PrimeReactProvider } from 'primereact/api'
import { http, HttpResponse } from 'msw'
import { server } from '../../../mocks/server.js'
import { setSession, employeeUser } from '../../helpers/mockSession.js'
import WeeklyHoursList from '@/application/pages/weeklyhours/list/WeeklyHoursList'

function renderWithProviders(ui) {
  return render(
    <PrimeReactProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </PrimeReactProvider>
  )
}

describe('WeeklyHoursList', () => {
  it('renders "Weekly Hours" heading and "+ WEEKLY HOUR" button for admin', async () => {
    setSession()
    renderWithProviders(<WeeklyHoursList />)
    expect(screen.getByText('Weekly Hours')).toBeInTheDocument()
    expect(screen.getByText('+ WEEKLY HOUR')).toBeInTheDocument()
  })

  it('shows Alice, Bob, and "USD 25.00" after load', async () => {
    setSession()
    renderWithProviders(<WeeklyHoursList />)
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('Bob')).toBeInTheDocument()
      expect(screen.getByText('USD 25.00')).toBeInTheDocument()
    })
  })

  it('shows Active and Deleted status tags', async () => {
    setSession()
    renderWithProviders(<WeeklyHoursList />)
    await waitFor(() => {
      expect(screen.getByText('Active')).toBeInTheDocument()
      expect(screen.getByText('Deleted')).toBeInTheDocument()
    })
  })

  it('shows Access Denied for employee role', () => {
    setSession(employeeUser)
    renderWithProviders(<WeeklyHoursList />)
    expect(screen.getByText(/Access Denied/i)).toBeInTheDocument()
  })

  it('shows empty message when API returns empty list', async () => {
    setSession()
    server.use(
      http.get('http://localhost:8081/weeklyhours/all', () =>
        HttpResponse.json({ response: [] })
      )
    )
    renderWithProviders(<WeeklyHoursList />)
    await waitFor(() => {
      expect(screen.getByText('No weekly hours found.')).toBeInTheDocument()
    })
  })
})
