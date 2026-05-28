import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProjectCreateDialog from '@/application/pages/tasks/components/ProjectCreateDialog'
import { PrimeReactProvider } from 'primereact/api'
import React from 'react'

const wrapper = ({ children }) => (
    <PrimeReactProvider>
        {children}
    </PrimeReactProvider>
)

describe('ProjectCreateDialog', () => {
    const mockClients = [{ id: 1, name: 'Client 1' }]
    const onHide = vi.fn()
    const onSave = vi.fn()

    it('renders with initial values and calls onSave with mandatory fields', () => {
        render(
            <ProjectCreateDialog 
                visible={true} 
                onHide={onHide} 
                onSave={onSave} 
                clients={mockClients} 
            />, 
            { wrapper }
        )
        
        expect(screen.getByText('Create New Project')).toBeDefined()
        
        fireEvent.change(screen.getByPlaceholderText('e.g. Website Redesign'), { target: { value: 'New Project Name' } })
        fireEvent.change(screen.getByPlaceholderText('Brief project description'), { target: { value: 'Project Description' } })
        
        const createButton = screen.getByText('Create Project')
        fireEvent.click(createButton)
        
        expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
            name: 'New Project Name',
            description: 'Project Description',
            active: 1,
            duration: '0'
        }))
    })
})
