import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TasksList from '@/application/pages/tasks/list/TasksList'
import tasksService from '@/services/tasksService'
import tracksService from '@/services/tracksService'
import userService from '@/services/userService'
import clientService from '@/services/clientService'
import projectService from '@/services/projectService'
import sessionStore from '@/stores/session'
import { PrimeReactProvider } from 'primereact/api'
import React from 'react'
import { resizerContext } from '@/providers/iframe-resizer'

vi.mock('@/services/tasksService')
vi.mock('@/services/tracksService')
vi.mock('@/services/userService')
vi.mock('@/services/clientService')
vi.mock('@/services/projectService')
vi.mock('@/stores/session')

const wrapper = ({ children }) => (
    <resizerContext.Provider value={{ refreshCounter: 0 }}>
        <PrimeReactProvider>
            {children}
        </PrimeReactProvider>
    </resizerContext.Provider>
)

describe('TasksList', () => {
    const mockTasks = [
        { id: 1, name: 'Task 1', idProject: 10, projectName: 'Project A', isActive: 1, status: 'To-do' }
    ]
    const mockUsers = [{ id: 1, name: 'User 1' }]
    const mockProjects = [{ id: 10, name: 'Project A' }]
    const mockClients = [{ id: 1, name: 'Client A' }]

    beforeEach(() => {
        vi.clearAllMocks()
        tasksService.getAll.mockResolvedValue(mockTasks)
        tasksService.getCurrentUserTasks.mockResolvedValue(mockTasks)
        tracksService.getCurrentUserLastTrack.mockResolvedValue(null)
        userService.getUsers.mockResolvedValue(mockUsers)
        projectService.getAll.mockResolvedValue(mockProjects)
        clientService.getClients.mockResolvedValue(mockClients)
        sessionStore.mockReturnValue({ userId: 1, userRole: 'admin', isAdmin: true })
        
        // Mock postMessage
        vi.stubGlobal('parent', {
            postMessage: vi.fn()
        })
    })

    it('renders and loads data for Admin', async () => {
        render(<TasksList />, { wrapper })
        
        await waitFor(() => {
            expect(tasksService.getAll).toHaveBeenCalled()
            expect(screen.getByText('Task 1')).toBeDefined()
        })
    })

    it('loads personal tasks for Developer', async () => {
        sessionStore.mockReturnValue({ userId: 2, userRole: 'developer', isAdmin: false })
        render(<TasksList />, { wrapper })
        
        await waitFor(() => {
            expect(tasksService.getCurrentUserTasks).toHaveBeenCalled()
        })
    })

    it('handles tracking toggle (Start)', async () => {
        render(<TasksList />, { wrapper })
        
        await waitFor(() => screen.getByText('Task 1'))
        
        const playButton = document.querySelector('.p-button-success')
        fireEvent.click(playButton)
        
        await waitFor(() => {
            expect(tracksService.create).toHaveBeenCalledWith(expect.objectContaining({
                idTask: 1,
                idProyecto: 10,
                typeTrack: 'manual'
            }))
            expect(window.parent.postMessage).toHaveBeenCalledWith({ action: 'refresh-timer' }, '*')
        })
    })

    it('handles tracking toggle (Stop)', async () => {
        const mockActiveTrack = { id: 500, idTask: 1, idProyecto: 10, startTime: '2026-04-29 10:00:00' }
        tracksService.getCurrentUserLastTrack.mockResolvedValue(mockActiveTrack)
        
        render(<TasksList />, { wrapper })
        
        await waitFor(() => screen.getByText('Task 1'))
        
        const pauseButton = document.querySelector('.p-button-danger')
        fireEvent.click(pauseButton)
        
        await waitFor(() => {
            expect(tracksService.update).toHaveBeenCalledWith(expect.objectContaining({
                id: 500,
                endTime: expect.any(String)
            }), 'admin')
        })
    })

    it('disables tracking for other tasks when one is active', async () => {
        const tasksWithTwo = [
            ...mockTasks,
            { id: 2, name: 'Task 2', idProject: 10, isActive: 1, status: 'To-do' }
        ]
        tasksService.getAll.mockResolvedValue(tasksWithTwo)
        tracksService.getCurrentUserLastTrack.mockResolvedValue({ idTask: 1 })
        
        render(<TasksList />, { wrapper })
        
        await waitFor(() => screen.getByText('Task 2'))
        
        const buttons = document.querySelectorAll('button')
        // Find play button for Task 2 (it should be the second play button or have secondary class)
        const task2PlayButton = Array.from(buttons).find(b => b.classList.contains('p-button-secondary') && b.disabled)
        expect(task2PlayButton).toBeDefined()
    })
})
