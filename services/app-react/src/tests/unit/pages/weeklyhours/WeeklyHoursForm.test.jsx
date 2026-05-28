import { describe, it, expect } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { PrimeReactProvider } from 'primereact/api'
import { http, HttpResponse } from 'msw'
import { server } from '../../../mocks/server.js'
import { setSession, architectUser } from '../../helpers/mockSession.js'
import WeeklyHoursForm from '@/application/pages/weeklyhours/form/WeeklyHoursForm'

function renderForm(path = '/weeklyhour/NEW', route = '/weeklyhour/:weeklyhoursId?') {
  return render(
    <PrimeReactProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={route} element={<WeeklyHoursForm />} />
        </Routes>
      </MemoryRouter>
    </PrimeReactProvider>
  )
}

describe('WeeklyHoursForm - Create mode', () => {
  it('renders "New Weekly Hour" heading and Save button', () => {
    setSession()
    renderForm('/weeklyhour/NEW')
    expect(screen.getByText('New Weekly Hour')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument()
  })

  it('renders the user Dropdown', async () => {
    setSession()
    renderForm('/weeklyhour/NEW')
    await waitFor(() => {
      // User dropdown has "User" label
      expect(screen.getByLabelText('User')).toBeInTheDocument()
    })
  })

  it('shows validation error on empty submit', async () => {
    setSession()
    renderForm('/weeklyhour/NEW')
    fireEvent.click(screen.getByRole('button', { name: /Save/i }))
    await waitFor(() => {
      expect(screen.getByText(/User, Cost\/Hour, Workload, Currency and Valid From are required/i)).toBeInTheDocument()
    })
  })
})

describe('WeeklyHoursForm - Edit mode', () => {
  it('renders "Edit Weekly Hour" heading after load', async () => {
    setSession()
    renderForm('/weeklyhour/1')
    await waitFor(() => {
      expect(screen.getByText('Edit Weekly Hour')).toBeInTheDocument()
    })
  })

  it('pre-fills userName InputText with "Alice"', async () => {
    setSession()
    renderForm('/weeklyhour/1')
    await waitFor(() => {
      expect(screen.getByDisplayValue('Alice')).toBeInTheDocument()
    })
  })

  it('shows InputSwitch in edit mode (borrado=0 means Active)', async () => {
    setSession()
    renderForm('/weeklyhour/1')
    await waitFor(() => {
      expect(screen.getByText('Active')).toBeInTheDocument()
    })
  })

  it('shows error on API 404', async () => {
    setSession()
    server.use(
      http.get('http://localhost:8081/weeklyhours/999', () => new HttpResponse(null, { status: 404 }))
    )
    renderForm('/weeklyhour/999')
    await waitFor(() => {
      expect(screen.getByText(/Error loading weekly hour data/i)).toBeInTheDocument()
    })
  })
})

describe('WeeklyHoursForm - Access control', () => {
  it('shows Access Denied for architect role', () => {
    setSession(architectUser)
    renderForm('/weeklyhour/NEW')
    expect(screen.getByText(/Access Denied/i)).toBeInTheDocument()
  })
})
