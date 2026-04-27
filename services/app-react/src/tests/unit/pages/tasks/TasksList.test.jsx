import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TasksList from '@/application/pages/tasks/list/TasksList'
import tasksService from '@/services/tasksService'
import userService from '@/services/userService'
import clientService from '@/services/clientService'
import projectService from '@/services/projectService'
import sessionStore from '@/stores/session'
import { PrimeReactProvider } from 'primereact/api'

vi.mock('@/services/tasksService')
vi.mock('@/services/userService')
vi.mock('@/services/clientService')
vi.mock('@/services/projectService')
vi.mock('@/stores/session')

const wrapper = ({ children }) => (
    <PrimeReactProvider>
        {children}
    </PrimeReactProvider>
)

describe('TasksList', () => {
    const mockTasks = [
        { id: 1, name: 'Task 1', projectName: 'Project A', isActive: 1, progress: 'To-do' }
    ]
    const mockUsers = [{ id: 1, name: 'User 1' }]
    const mockProjects = [{ id: 1, name: 'Project A' }]
    const mockClients = [{ id: 1, name: 'Client A' }]

    beforeEach(() => {
        vi.clearAllMocks()
        tasksService.getAll.mockResolvedValue(mockTasks)
        tasksService.getCurrentUserTasks.mockResolvedValue(mockTasks)
        userService.getUsers.mockResolvedValue(mockUsers)
        projectService.getAll.mockResolvedValue(mockProjects)
        clientService.getClients.mockResolvedValue(mockClients)
        sessionStore.mockReturnValue({ userRole: 'admin' })
    })

    it('renders heading and loads tasks', async () => {
        render(<TasksList />, { wrapper })
        
        expect(screen.getByText('Tasks')).toBeDefined()
        await waitFor(() => {
            expect(screen.getByText('Task 1')).toBeDefined()
        })
    })

    it('opens New Task dialog when clicking button', async () => {
        render(<TasksList />, { wrapper })
        
        const newButtons = screen.getAllByText('New Task')
        fireEvent.click(newButtons[0])
        
        await waitFor(() => {
            expect(screen.getByText('Project *')).toBeDefined()
        })
    })

    it('shows New Project button for Admin', async () => {
        sessionStore.mockReturnValue({ userRole: 'admin' })
        render(<TasksList />, { wrapper })
        
        const newButtons = screen.getAllByText('New Task')
        fireEvent.click(newButtons[0])
        
        await waitFor(() => {
            // The "New Project" button renders as an icon-only button with tooltip
            const plusButtons = document.querySelectorAll('.p-button-outlined .pi-plus')
            expect(plusButtons.length).toBeGreaterThan(0)
        })
    })

    it('does not show New Project button for Developer', async () => {
        sessionStore.mockReturnValue({ userRole: 'developer' })
        tasksService.getCurrentUserTasks.mockResolvedValue(mockTasks)
        render(<TasksList />, { wrapper })
        
        const newButtons = screen.getAllByText('New Task')
        fireEvent.click(newButtons[0])
        
        await waitFor(() => {
            expect(screen.queryByRole('button', { name: /new project/i })).toBeNull()
        })
    })

    it('shows empty state when no tasks', async () => {
        tasksService.getAll.mockResolvedValue([])
        render(<TasksList />, { wrapper })
        
        await waitFor(() => {
            expect(screen.getByText('No tasks found.')).toBeDefined()
        })
    })
})
