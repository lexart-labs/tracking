/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import tasksService from '@/services/tasksService'
import api from '@/services/api'

vi.mock('@/services/api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn()
    }
}))

describe('TasksService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('getAll calls POST /projects/tasks/all with mapped filters', async () => {
        const mockResponse = { data: { response: [{ id: 1, name: 'Task 1' }] } }
        api.post.mockResolvedValue(mockResponse)

        const filters = { status: 'active', progress: 'To-do' }
        const result = await tasksService.getAll(filters)

        // Verify filter mapping: status: 'active' -> {active: 1}, progress: 'To-do' -> {status: 'To-do'}
        const expectedFilter = [
            { status: 'To-do' },
            { active: 1 }
        ]
        
        expect(api.post).toHaveBeenCalledWith('/projects/tasks/all', expect.objectContaining({
            filter: expect.arrayContaining(expectedFilter)
        }))
        expect(result).toEqual(mockResponse.data.response)
    })

    it('create formats dates and maps assignees correctly', async () => {
        api.post.mockResolvedValue({ data: { id: 123 } })

        const startDate = new Date(2026, 3, 29) // April 29, 2026
        const endDate = new Date(2026, 4, 1)    // May 1, 2026
        
        const task = { 
            name: 'New Task', 
            startDate, 
            endDate, 
            assignees: [{ id: 1, name: 'User 1' }],
            duration: 5.5,
            description: 'Test desc'
        }
        
        await tasksService.create(task)

        expect(api.post).toHaveBeenCalledWith('/projects/tasks/new', expect.objectContaining({
            name: 'New Task',
            startDate: '2026-04-29',
            endDate: '2026-05-01',
            users: [{ id: 1, name: 'User 1' }],
            duration: '5.5',
            comments: 'Test desc'
        }))
    })

    it('update uses PUT /projects/tasks/update and formats dates', async () => {
        api.put.mockResolvedValue({ data: { success: true } })

        const task = { 
            id: 1, 
            name: 'Updated', 
            startDate: '2026-04-29',
            assignees: [] 
        }
        
        await tasksService.update(task)

        expect(api.put).toHaveBeenCalledWith('/projects/tasks/update', expect.objectContaining({
            id: 1,
            startDate: '2026-04-29',
            users: []
        }))
    })

    it('delete calls DELETE /projects/tasks/delete/:id', async () => {
        api.delete.mockResolvedValue({ data: { success: true } })
        await tasksService.delete(1)
        expect(api.delete).toHaveBeenCalledWith('/projects/tasks/delete/1')
    })

    it('undelete calls POST /projects/tasks/undelete', async () => {
        api.post.mockResolvedValue({ data: { success: true } })
        await tasksService.undelete(1)
        expect(api.post).toHaveBeenCalledWith('/projects/tasks/undelete', { id: 1 })
    })

    it('_extractTasks handles various response formats', () => {
        expect(tasksService._extractTasks({ response: [1, 2] })).toEqual([1, 2])
        expect(tasksService._extractTasks({ task: [1, 2] })).toEqual([1, 2])
        expect(tasksService._extractTasks({ data: [1, 2] })).toEqual([1, 2])
        expect(tasksService._extractTasks([1, 2])).toEqual([1, 2])
        expect(tasksService._extractTasks({ task: { task: [1] } })).toEqual([1])
        expect(tasksService._extractTasks(null)).toEqual([])
    })
})
