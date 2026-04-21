import React from 'react'
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react'
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
    <resizerContext.Provider value={{ user, token: 'fake-token', refreshCounter }}>
      <Dashboard />
    </resizerContext.Provider>
  )
}

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {})
    sessionStore.setState({ user: mockUser, token: 'fake-token' })
  })

  it('renders history correctly after loading', async () => {
    renderDashboard()
    
    // Esperamos a que aparezca un elemento del historial
    await waitFor(() => {
      expect(screen.getByText('Implement login')).toBeInTheDocument()
    }, { timeout: 5000 })
    
    // Alpha Project aparece en varios lugares, usamos getAllByText
    expect(screen.getAllByText('Alpha Project').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Acme Corp').length).toBeGreaterThan(0)
  })

  it('shows Current Tracks section for admin', async () => {
    renderDashboard()
    
    await waitFor(() => {
      const section = screen.getByTestId('current-tracks-section')
      expect(within(section).getByText('Fix bug')).toBeInTheDocument()
    }, { timeout: 5000 })
    
    const section = screen.getByTestId('current-tracks-section')
    expect(within(section).getByText('Current Tracks')).toBeInTheDocument()
  })

  it('notifies parent to sync timer when a track is started', async () => {
    renderDashboard()
    
    await waitFor(() => screen.getByText('Implement login'))
    
    const startButtons = screen.getAllByTestId('start-track-btn')
    fireEvent.click(startButtons[0])
    
    await waitFor(() => {
      expect(window.parent.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'refresh-timer' }),
        '*'
      )
    }, { timeout: 5000 })
  })

  it('updates dashboard when refreshCounter increments', async () => {
    renderDashboard(mockUser, 0)
    
    await waitFor(() => screen.getByText('Implement login'))
    
    // Simulamos un mensaje de Angular que incrementa el contador
    renderDashboard(mockUser, 1) 
    
    expect(screen.getByText('Implement login')).toBeInTheDocument()
  })
})
