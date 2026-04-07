import api from '@/services/api'
import sessionStore from '@/stores/session'

const USERS_ENDPOINT = '/user'

export class UserService {
    constructor() {
        this.api = api
    }

    async getUsers() {
        try {
            const user = sessionStore.getState().user;
            const role = user.userRole === 'admin' || user.userRole === 'pm' ? true : false;
            const path = role === true ? '/all-admin' : '/all';

            const response = await this.api.get(`${USERS_ENDPOINT}${path}`)
            return response.data.response || response.data
        } catch (error) {
            throw error
        }
    }

    async createUser(userData) {
        try {
            delete userData.id
            delete userData.imagePreview
            delete userData.photo
            const response = await this.api.post(`${USERS_ENDPOINT}/register`, userData)
            return response.data
        } catch (error) {
            throw error
        }
    }

    async updateUser(userId, userData) {
        try {
            const response = await this.api.put(`${USERS_ENDPOINT}/update/${userId}`, userData)
            return response.data
        } catch (error) {
            throw error
        }
    }

    async getUser(userId) {
        try {
            const response = await this.api.get(`${USERS_ENDPOINT}/${userId}`)
            if (response.data.response.password) delete response.data.response.password
            if (response.data.response.deleted_at) delete response.data.response.deleted_at
            return response.data.response
        } catch (error) {
            throw error
        }
    }

    async uploadProfileImage(userId, file) {
        try {
            const formData = new FormData()
            formData.append('image', file)

            const response = await this.api.post(
                `${USERS_ENDPOINT}/${userId}/profile-image`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            )
            return response.data
        } catch (error) {
            throw error
        }
    }
}

export default new UserService()
