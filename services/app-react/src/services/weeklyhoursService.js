import api from '@/services/api'

const WEEKLYHOURS_ENDPOINT = '/weeklyhours'

export class WeeklyhoursService {
    constructor() {
        this.api = api
    }

    async getAll() {
        try {
            const response = await this.api.get(`${WEEKLYHOURS_ENDPOINT}/all`)
            return response.data.response
        } catch (error) {
            throw error
        }
    }

    async getById(id) {
        try {
            const response = await this.api.get(`${WEEKLYHOURS_ENDPOINT}/${id}`)
            return response.data.response
        } catch (error) {
            throw error
        }
    }

    async getUserWeeklyhours(userId) {
        try {
            const response = await this.api.get(`${WEEKLYHOURS_ENDPOINT}/user/${userId}`)
            return response.data.response
        } catch (error) {
            throw error
        }
    }

    async create(data) {
        try {
            const response = await this.api.post(`${WEEKLYHOURS_ENDPOINT}/new`, data)
            return response.data
        } catch (error) {
            throw error
        }
    }

    async update(data) {
        try {
            const response = await this.api.put(`${WEEKLYHOURS_ENDPOINT}/update`, data)
            return response.data
        } catch (error) {
            throw error
        }
    }

    async delete(id) {
        try {
            const response = await this.api.delete(`${WEEKLYHOURS_ENDPOINT}/${id}`)
            return response.data
        } catch (error) {
            throw error
        }
    }

    async activate(id) {
        try {
            const response = await this.api.put(`${WEEKLYHOURS_ENDPOINT}/${id}/activate`)
            return response.data
        } catch (error) {
            throw error
        }
    }
}

export default new WeeklyhoursService()
