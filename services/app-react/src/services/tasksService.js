import api from '@/services/api'

class TasksService {
    async getAll(filters = {}) {
        const backendFilters = this._mapFilters(filters)
        const response = await api.post('/projects/tasks/all', { filter: backendFilters, ...filters })
        return this._extractTasks(response.data)
    }

    async getCurrentUserTasks(filters = {}) {
        const backendFilters = this._mapFilters(filters)
        const response = await api.post('/projects/tasks/user/current', { filter: backendFilters, ...filters })
        return this._extractTasks(response.data)
    }

    _mapFilters(filters) {
        const mapped = []
        if (filters.name) mapped.push({ name: filters.name })
        if (filters.projectName) mapped.push({ projectName: filters.projectName })
        if (filters.description) mapped.push({ description: filters.description })
        if (filters.progress) mapped.push({ status: filters.progress })
        if (filters.status && filters.status !== 'all') {
            mapped.push({ active: filters.status === 'active' ? 1 : 0 })
        }
        return mapped
    }

    async create(task) {
        const payload = {
            ...task,
            users: task.assignees || [],
            duration: String(task.duration || 0),
            comments: task.description || '',
            startDate: this._formatDate(task.startDate),
            endDate: this._formatDate(task.endDate || new Date(Date.now() + 86400000))
        }
        const response = await api.post('/projects/tasks/new', payload)
        return response.data
    }

    async update(task) {
        const payload = {
            ...task,
            users: task.assignees || [],
            duration: String(task.duration || 0),
            comments: task.description || '',
            startDate: this._formatDate(task.startDate),
            endDate: this._formatDate(task.endDate)
        }
        const response = await api.put('/projects/tasks/update', payload)
        return response.data
    }

    _formatDate(date) {
        if (!date) return null
        if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date
        
        const d = date instanceof Date ? date : new Date(date)
        if (isNaN(d.getTime())) return null

        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    async delete(id) {
        const response = await api.delete(`/projects/tasks/delete/${id}`)
        return response.data
    }

    async undelete(id) {
        const response = await api.post('/projects/tasks/undelete', { id })
        return response.data
    }

    async getByProject(projectId) {
        const response = await api.get(`/projects/tasks/project/${projectId}`)
        return this._extractTasks(response.data)
    }

    async getByUserId(userId, filters = {}) {
        const response = await api.post(`/projects/tasks/id-user/${userId}`, filters)
        return this._extractTasks(response.data)
    }

    _extractTasks(data) {
        if (!data) return []
        const result = data.response || data.task || data.data || data
        if (result && result.task && Array.isArray(result.task)) return result.task
        if (Array.isArray(result)) return result
        return []
    }
}

export default new TasksService()
