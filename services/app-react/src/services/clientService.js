import api from '@/services/api'

const CLIENTS_ENDPOINT = '/clients'

/**
 * Service class for handling all Client-related API requests.
 */
export class ClientService {
    constructor() {
        this.api = api
    }

    /**
     * Creates a new client in the system.
     * @param {Object} clientData The client data to save.
     * @returns {Promise<Object>} The created client record.
     */
    async createClient(clientData) {
        try {
            delete clientData.id
            const response = await this.api.post(`${CLIENTS_ENDPOINT}/new`, clientData)
            return response.data
        } catch (error) {
            throw error
        }
    }

    /**
     * Updates an existing client record.
     * @param {number|string} clientId The ID of the client to update.
     * @param {Object} clientData The updated client data.
     * @returns {Promise<Object>} The update response.
     */
    async updateClient(clientId, clientData) {
        try {
            const response = await this.api.put(`${CLIENTS_ENDPOINT}/update/${clientId}`, clientData)
            return response.data
        } catch (error) {
            throw error
        }
    }

    /**
     * Fetches a single client by ID.
     * @param {number|string} clientId The ID of the client to fetch.
     * @returns {Promise<Object>} The client data.
     */
    async getClient(clientId) {
        try {
            const response = await this.api.get(`${CLIENTS_ENDPOINT}/${clientId}`)
            return response.data.response
        } catch (error) {
            throw error
        }
    }

    /**
     * Fetches all clients (both active and inactive).
     * @returns {Promise<Array>} List of clients.
     */
    async getClients() {
        try {
            const response = await this.api.get(`${CLIENTS_ENDPOINT}/all`)
            return response.data.response
        } catch (error) {
            throw error
        }
    }

    /**
     * Toggles the active status of a client (Soft Delete pattern).
     * @param {number|string} clientId The ID of the client.
     * @param {boolean} active The new active status.
     * @returns {Promise<Object>} The update response.
     */
    async toggleActive(clientId, active) {
        try {
            // Reusing update endpoint for soft delete
            const response = await this.api.put(`${CLIENTS_ENDPOINT}/update/${clientId}`, { active })
            return response.data
        } catch (error) {
            throw error
        }
    }
}

export default new ClientService()
