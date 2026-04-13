import api from '@/services/api'

class ProjectService {
    async getProjects() {
        const response = await api.get('/projects/all')
        return response.data.response
    }
}

export default new ProjectService()
