import api from '@/services/api'

class ProjectService {
    async getAll() {
        const response = await api.get('/projects/all')
        return response.data.response
    }

    // Alias for backward compatibility with Tracks module
    async getProjects() {
        return this.getAll()
    }

    async create(project) {
        const response = await api.post('/projects/new', project)
        return response.data
    }
}

export default new ProjectService()
