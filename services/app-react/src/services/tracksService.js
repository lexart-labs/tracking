import api from '@/services/api'

class TracksService {
    async getById(id) {
        const response = await api.get(`/tracks/${id}`)
        return response.data.response
    }

    async update(track, userRole) {
        const isAdmin = userRole === 'admin' || userRole === 'pm'
        const path = isAdmin ? '/tracks/update' : '/tracks/user/current/update'
        const response = await api.put(path, track)
        return response.data
    }

    async exportCsv(params) {
        const response = await api.post('/tracks/export/csv', params, { responseType: 'blob' })
        return response.data
    }

    async getTracks({ startTime, endTime, idUser, idClient, idProject }, userRole) {
        const body = { startTime, endTime }
        if (idClient) body.idClient = idClient
        if (idProject) body.idProject = idProject

        const isAdmin = userRole === 'admin' || userRole === 'pm'
        let response
        if (isAdmin && idUser) {
            response = await api.post(`/tracks/user/${idUser}`, body)
        } else if (isAdmin) {
            response = await api.post('/tracks/user/all', body)
        } else {
            response = await api.post('/tracks/user/current', body)
        }
        return response.data.response
    }

    async getHistory() {
        const response = await api.get('/tracks/user/history')
        return response.data.response
    }

    async getActiveTracks() {
        const response = await api.get('/tracks/tracking')
        return response.data.response
    }

    async create(track) {
        const response = await api.post('/tracks/new', track)
        return response.data
    }

    async getCurrentUserLastTrack() {
        const response = await api.get(`/tracks/user/current/last?t=${Date.now()}`)
        return response.data.response
    }
}

export default new TracksService()
