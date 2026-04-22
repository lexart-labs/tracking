import React from 'react'
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/tests/mocks/server.js'
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

const dummyTrack = {
  id: 1,
  name: 'Test Task',
  taskName: 'Test Task',
  idProyecto: 10,
  projectName: 'Test Project',
  idUser: 1,
  startTime: '2024-03-01 09:00:00',
  endTime: '2024-03-01 10:00:00',
  duration: '01:00:00',
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

  it('disables play button for inactive tasks', async () => {
    // Sobrescribimos el mock para devolver una tarea inactiva
    server.use(
      http.get('http://localhost:8081/tracks/user/history', () => {
        return HttpResponse.json({ 
          response: [{
            ...dummyTrack,
            isActive: 0,
            name: 'Inactive Task'
          }]
        })
      })
    )

    renderDashboard()
    await waitFor(() => screen.getByText('Inactive Task'))
    
    const startButton = screen.getByTestId('start-track-btn')
    expect(startButton).toBeDisabled()
    expect(startButton).toHaveAttribute('title', 'Tarea inactiva')
    expect(startButton.className).toContain('opacity-50')
  })

  it('disables play button for deleted tasks (null isActive)', async () => {
    server.use(
      http.get('http://localhost:8081/tracks/user/history', () => {
        return HttpResponse.json({ 
          response: [{
            ...dummyTrack,
            isActive: null,
            name: 'Deleted Task'
          }]
        })
      })
    )

    renderDashboard()
    await waitFor(() => screen.getByText('Deleted Task'))
    
    const startButton = screen.getByTestId('start-track-btn')
    expect(startButton).toBeDisabled()
  })
})
