import api from '@/services/api'

class TasksService {
    async getAll(filters = {}) {
        const response = await api.post('/tasks/all', filters)
        return response.data.response
    }

    async getCurrentUserTasks(filters = {}) {
        const response = await api.post('/tasks/user/current', filters)
        return response.data.response
    }

    async create(task) {
        const response = await api.post('/tasks/new', task)
        return response.data
    }

    async update(task) {
        const response = await api.put('/tasks/update', task)
        return response.data
    }

    async delete(id) {
        const response = await api.delete(`/tasks/delete/${id}`)
        return response.data
    }

    async undelete(id) {
        const response = await api.post('/tasks/undelete', { id })
        return response.data
    }

    async getByProject(projectId) {
        const response = await api.get(`/tasks/project/${projectId}`)
        return response.data.response
    }

    async getByUserId(userId, filters = {}) {
        const response = await api.post(`/tasks/id-user/${userId}`, filters)
        return response.data.response
    }
}

export default new TasksService()
