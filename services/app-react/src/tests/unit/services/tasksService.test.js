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

    it('getAll calls POST /tasks/all', async () => {
        const mockResponse = { data: { response: [{ id: 1, name: 'Task 1' }] } }
        api.post.mockResolvedValue(mockResponse)

        const filters = { status: 'active' }
        const result = await tasksService.getAll(filters)

        expect(api.post).toHaveBeenCalledWith('/tasks/all', filters)
        expect(result).toEqual(mockResponse.data.response)
    })

    it('getCurrentUserTasks calls POST /tasks/user/current', async () => {
        const mockResponse = { data: { response: [{ id: 2, name: 'My Task' }] } }
        api.post.mockResolvedValue(mockResponse)

        const result = await tasksService.getCurrentUserTasks()

        expect(api.post).toHaveBeenCalledWith('/tasks/user/current', {})
        expect(result).toEqual(mockResponse.data.response)
    })

    it('create calls POST /tasks/new', async () => {
        const mockResponse = { data: { id: 123 } }
        api.post.mockResolvedValue(mockResponse)

        const task = { name: 'New Task' }
        const result = await tasksService.create(task)

        expect(api.post).toHaveBeenCalledWith('/tasks/new', task)
        expect(result).toEqual(mockResponse.data)
    })

    it('update calls PUT /tasks/update', async () => {
        const mockResponse = { data: { success: true } }
        api.put.mockResolvedValue(mockResponse)

        const task = { id: 1, name: 'Updated' }
        const result = await tasksService.update(task)

        expect(api.put).toHaveBeenCalledWith('/tasks/update', task)
        expect(result).toEqual(mockResponse.data)
    })

    it('delete calls DELETE /tasks/delete/:id', async () => {
        const mockResponse = { data: { success: true } }
        api.delete.mockResolvedValue(mockResponse)

        const result = await tasksService.delete(1)

        expect(api.delete).toHaveBeenCalledWith('/tasks/delete/1')
        expect(result).toEqual(mockResponse.data)
    })

    it('undelete calls POST /tasks/undelete', async () => {
        const mockResponse = { data: { success: true } }
        api.post.mockResolvedValue(mockResponse)

        const result = await tasksService.undelete(1)

        expect(api.post).toHaveBeenCalledWith('/tasks/undelete', { id: 1 })
        expect(result).toEqual(mockResponse.data)
    })

    it('getByProject calls GET /tasks/project/:id', async () => {
        const mockResponse = { data: { response: [{ id: 1 }] } }
        api.get.mockResolvedValue(mockResponse)

        const result = await tasksService.getByProject(5)

        expect(api.get).toHaveBeenCalledWith('/tasks/project/5')
        expect(result).toEqual(mockResponse.data.response)
    })

    it('getByUserId calls POST /tasks/id-user/:userId', async () => {
        const mockResponse = { data: { response: [{ id: 1 }] } }
        api.post.mockResolvedValue(mockResponse)

        const result = await tasksService.getByUserId(3, { status: 'active' })

        expect(api.post).toHaveBeenCalledWith('/tasks/id-user/3', { status: 'active' })
        expect(result).toEqual(mockResponse.data.response)
    })
})
