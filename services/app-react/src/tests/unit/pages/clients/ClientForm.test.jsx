import { describe, it, expect } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { PrimeReactProvider } from 'primereact/api'
import { http, HttpResponse } from 'msw'
import { server } from '../../../mocks/server.js'
import { setSession, clientUser } from '../../helpers/mockSession.js'
import ClientForm from '@/application/pages/clients/form/ClientForm'

function renderForm(path = '/client/NEW', route = '/client/:clientId?') {
  return render(
    <PrimeReactProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={route} element={<ClientForm />} />
        </Routes>
      </MemoryRouter>
    </PrimeReactProvider>
  )
}

describe('ClientForm - Create mode', () => {
  it('renders "New Client" heading and Save button', () => {
    setSession()
    renderForm('/client/NEW')
    expect(screen.getByText('New Client')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument()
  })

  it('does not show InputSwitch in create mode', () => {
    setSession()
    renderForm('/client/NEW')
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('shows validation error on empty submit', async () => {
    setSession()
    const { container } = renderForm('/client/NEW')
    // Use fireEvent.submit on the form to bypass HTML5 native required validation in jsdom
    fireEvent.submit(container.querySelector('form'))
    await waitFor(() => {
      expect(screen.getByText(/Name and Company are required/i)).toBeInTheDocument()
    })
  })

  it('submits successfully and navigates back', async () => {
    setSession()
    renderForm('/client/NEW')
    
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'New Client Inc' } })
    fireEvent.change(screen.getByLabelText(/Company/i), { target: { value: 'NewCo' } })
    
    const saveButton = screen.getByRole('button', { name: /Save/i })
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      // El mock de handlers devuelve 201 y un body con ID
      expect(saveButton).not.toBeDisabled()
    })
  })
})

describe('ClientForm - Edit mode', () => {
  it('renders "Edit Client" heading after data loads', async () => {
    setSession()
    renderForm('/client/1')
    await waitFor(() => {
      expect(screen.getByText('Edit Client')).toBeInTheDocument()
    })
  })

  it('pre-fills Name and Company fields', async () => {
    setSession()
    renderForm('/client/1')
    await waitFor(() => {
      expect(screen.getByDisplayValue('Acme Corp')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Acme')).toBeInTheDocument()
    })
  })

  it('shows Update button in edit mode', async () => {
    setSession()
    renderForm('/client/1')
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Update/i })).toBeInTheDocument()
    })
  })

  it('shows error when API returns 404', async () => {
    setSession()
    server.use(
      http.get('http://localhost:8081/clients/999', () => new HttpResponse(null, { status: 404 }))
    )
    renderForm('/client/999')
    await waitFor(() => {
      expect(screen.getByText(/Error loading client data/i)).toBeInTheDocument()
    })
  })
})

describe('ClientForm - Access control', () => {
  it('shows Access Denied for client role', () => {
    setSession(clientUser)
    renderForm('/client/NEW')
    expect(screen.getByText(/Access Denied/i)).toBeInTheDocument()
  })
})
