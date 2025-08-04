import axios from 'axios'
import sessionStore from '@/stores/session'


const API_CONFIG = {
    baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:8081',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
}

const api = axios.create(API_CONFIG)

// Request interceptor
api.interceptors.request.use(
    
    config => {
        const session = sessionStore.getState()
        config.headers.Authorization = `Bearer ${session.token}`
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// Response interceptor
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            console.error('🔴 API Error:', error.response.data)
        } else if (error.request) {
            console.error('🔴 No response received:', error.request)
        } else {
            console.error('🔴 Error:', error.message)
        }
        return Promise.reject(error)
    }
)

export default api