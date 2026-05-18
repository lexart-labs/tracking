import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaskFormDialog from '@/application/pages/tasks/components/TaskFormDialog'
import { PrimeReactProvider } from 'primereact/api'
import React from 'react'

const wrapper = ({ children }) => (
    <PrimeReactProvider>
        {children}
    </PrimeReactProvider>
)

describe('TaskFormDialog', () => {
    const mockProjects = [
        { id: 10, name: 'Project 10' },
        { id: 20, name: 'Project 20' }
    ]
    const mockUsers = [
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' }
    ]
    const onHide = vi.fn()
    const onSave = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('initializes for New Task', () => {
        render(
            <TaskFormDialog 
                visible={true} 
                onHide={onHide} 
                task={null} 
                onSave={onSave} 
                projects={mockProjects} 
                users={mockUsers}
            />, 
            { wrapper }
        )
        
        expect(screen.getByText('New Task')).toBeDefined()
        expect(screen.getByPlaceholderText('What are you working on?').value).toBe('')
    })

    it('initializes for Edit Task and normalizes idProject', () => {
        const taskToEdit = { 
            id: 1, 
            name: 'Existing Task', 
            idProject: '10', // String from API
            description: 'Desc',
            users: JSON.stringify([{ id: 1, name: 'User 1' }])
        }
        
        render(
            <TaskFormDialog 
                visible={true} 
                onHide={onHide} 
                task={taskToEdit} 
                onSave={onSave} 
                projects={mockProjects} 
                users={mockUsers}
            />, 
            { wrapper }
        )
        
        expect(screen.getByText('Edit Task')).toBeDefined()
        expect(screen.getByDisplayValue('Existing Task')).toBeDefined()
        
        // The Dropdown should have the value 10 (number)
        // Testing PrimeReact dropdown value is hard via DOM, but we can check if it renders the label
        expect(screen.getByText('Project 10', { selector: '.p-dropdown-label' })).toBeDefined()
    })

    it('toggles user selection correctly', async () => {
        render(
            <TaskFormDialog 
                visible={true} 
                onHide={onHide} 
                task={null} 
                onSave={onSave} 
                projects={mockProjects} 
                users={mockUsers}
            />, 
            { wrapper }
        )
        
        // Click the row text to trigger selection
        const user1Row = screen.getByText('User 1')
        await userEvent.click(user1Row)
        
        const saveButton = screen.getByText('Save')
        fireEvent.click(saveButton)
        
        expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
            assignees: expect.arrayContaining([expect.objectContaining({ id: 1 })])
        }))
    })

    it('calls onSave with correct data', async () => {
        render(
            <TaskFormDialog 
                visible={true} 
                onHide={onHide} 
                task={null} 
                onSave={onSave} 
                projects={mockProjects} 
                users={mockUsers}
            />, 
            { wrapper }
        )
        
        fireEvent.change(screen.getByPlaceholderText('What are you working on?'), { target: { value: 'New Test Task' } })
        
        const saveButton = screen.getByText('Save')
        fireEvent.click(saveButton)
        
        expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
            name: 'New Test Task'
        }))
    })
})
