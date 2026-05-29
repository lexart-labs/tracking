import api from '@/services/api'
import sessionStore from '@/stores/session'

const USERS_ENDPOINT = '/user'

export const getPhotoUrl = (photo) => {
    if (!photo) return null;
    if (photo.startsWith('http')) return photo;

    const basePhotoUrl =
        import.meta.env.VITE_BASE_PHOTO ||
        import.meta.env.VITE_FILES_BASE ||
        (import.meta.env.VITE_BASE_URL ? import.meta.env.VITE_BASE_URL.replace(/\/api\/?$/, '/files/') : 'http://localhost:82/files/');

    const normalizedBase = basePhotoUrl.endsWith('/') ? basePhotoUrl : `${basePhotoUrl}/`;
    let normalizedPhoto = photo.replace(/^\//, '');
    normalizedPhoto = normalizedPhoto.replace(/^files\//, '');
    return normalizedBase + normalizedPhoto;
}

export class UserService {
    constructor() {
        this.api = api
    }

    async getUsers() {
        try {
            const user = sessionStore.getState().user;
            const role = user?.userRole === 'admin' || user?.userRole === 'pm';
            const path = role === true ? '/all-admin' : '/all';

            const response = await this.api.get(`${USERS_ENDPOINT}${path}`)
            return response.data.response || response.data
        } catch (error) {
            throw error
        }
    }

    async getUser(userId) {
        try {
            const response = await this.api.get(`${USERS_ENDPOINT}/${userId}`)
            return response.data.response || response.data
        } catch (error) {
            throw error
        }
    }

    async createUser(userData) {
        try {
            const response = await this.api.post(`${USERS_ENDPOINT}/register`, userData)
            return response.data.response || response.data
        } catch (error) {
            throw error
        }
    }

    async updateUser(userId, userData) {
        try {
            const response = await this.api.put(`${USERS_ENDPOINT}/update/${userId}`, userData)
            return response.data.response || response.data
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
                formData
            )
            return response.data
        } catch (error) {
            throw error
        }
    }

    async deleteUser(userId) {
        try {
            const response = await this.api.delete(`${USERS_ENDPOINT}/delete`, { data: { id: userId } })
            return response.data
        } catch (error) {
            throw error
        }
    }

    async undeleteUser(userId) {
        try {
            const response = await this.api.post(`${USERS_ENDPOINT}/undelete`, { id: userId })
            return response.data
        } catch (error) {
            throw error
        }
    }
}

export default new UserService()
