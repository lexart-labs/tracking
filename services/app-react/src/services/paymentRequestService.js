import api from '@/services/api'

const ENDPOINT = '/payment_requests'

function formatDateForBackend(date) {
	if (!date) return null
	return new Date(date).toISOString().split('T')[0]
}

export class PaymentRequestService {
	constructor() {
		this.api = api
	}

	async getAll(filters = {}) {
		const params = new URLSearchParams()
		if (filters.status && filters.status !== 'All') params.append('status', filters.status)
		if (filters.concept) params.append('concept', filters.concept)
		if (filters.user) params.append('user', filters.user)
		if (filters.currency) params.append('currency', filters.currency)
		if (filters.startDate) params.append('startDate', formatDateForBackend(filters.startDate))
		if (filters.endDate) params.append('endDate', formatDateForBackend(filters.endDate))

		const query = params.toString() ? `?${params.toString()}` : ''
		const response = await this.api.get(`${ENDPOINT}/all${query}`)
		return response.data.response || response.data
	}

	async updateStatus(paymentRequestId, { status, reply }) {
		const response = await this.api.put(`${ENDPOINT}/update/${paymentRequestId}`, { status, reply })
		return response.data
	}

	async updateDetail(paymentRequestId, data) {
		const response = await this.api.put(`${ENDPOINT}/${paymentRequestId}/update_detail`, data)
		return response.data
	}

	async getUserHistory(userId) {
		const response = await this.api.get(`${ENDPOINT}/${userId}`)
		return response.data.response || response.data
	}

	async create(details) {
		const response = await this.api.post(`${ENDPOINT}/create`, { details })
		return response.data
	}

	async cancel(paymentRequestId) {
		const response = await this.api.put(`${ENDPOINT}/${paymentRequestId}/cancel`)
		return response.data
	}

	async getClosureAmount(userId, startDate, endDate) {
		const response = await this.api.get(`${ENDPOINT}/closure/${userId}/${startDate}/${endDate}`)
		return response.data.response || response.data
	}
}

export default new PaymentRequestService()
