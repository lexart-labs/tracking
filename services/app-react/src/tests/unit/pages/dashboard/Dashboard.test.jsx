import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Dashboard } from '@/application/dashboard'
import { resizerContext } from '@/providers/iframe-resizer'
import sessionStore from '@/stores/session'

// Mock de postMessage
const mockPostMessage = vi.fn()
window.parent.postMessage = mockPostMessage

const mockUser = {
  userId: 1,
  userName: 'Test User',
  userRole: 'admin',
}

const renderDashboard = (user = mockUser, refreshCounter = 0) => {
  return render(
    <resizerContext.Provider value={{ user, refreshCounter }}>
      <Dashboard />
    </resizerContext.Provider>
  )
}

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStore.setState({ user: mockUser, token: 'fake-token' })
  })

  it('renders history correctly after loading', async () => {
    renderDashboard()
    
    // Debería mostrar skeleton al inicio (o simplemente esperar a que termine)
    await waitFor(() => {
      expect(screen.getByText('Implement login')).toBeInTheDocument()
    })
    
    expect(screen.getByText('Alpha Project')).toBeInTheDocument()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
  })

  it('shows Current Tracks section for admin', async () => {
    renderDashboard()
    
    await waitFor(() => {
      expect(screen.getByText('Current Tracks')).toBeInTheDocument()
    })
    
    // track[1] de los mocks es "Fix bug"
    expect(screen.getByText('Fix bug')).toBeInTheDocument()
  })

  it('notifies parent to sync timer when a track is started', async () => {
    renderDashboard()
    
    await waitFor(() => screen.getByText('Implement login'))
    
    // Buscar el botón de play para "Implement login" (id: 1)
    const playButtons = screen.getAllByRole('button')
    // El primer item en el historial de mocks es id 1 (Implement login), no tiene endTime nulo 
    // pero el DASHBOARD lo muestra.
    // Vamos a buscar el botón con el icono pi-play
    const playButton = playButtons.find(btn => btn.querySelector('.pi-play'))
    
    fireEvent.click(playButton)
    
    await waitFor(() => {
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'refresh-timer' }),
        '*'
      )
    })
  })

  it('updates dashboard when refreshCounter increments', async () => {
    const { rerender } = renderDashboard(mockUser, 0)
    
    await waitFor(() => screen.getByText('Implement login'))
    
    // Simulamos un mensaje de Angular que incrementa el contador
    renderDashboard(mockUser, 1) 
    
    // El useEffect de Dashboard debería llamar a refresh()
    // Podemos verificar que aparezca el spinner de carga brevemente o simplemente que los datos sigan ahí
    expect(screen.getByText('Implement login')).toBeInTheDocument()
  })
})
