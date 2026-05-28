import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { InputText } from "primereact/inputtext"
import { FloatLabel } from "primereact/floatlabel"
import { Button } from "primereact/button"
import { InputSwitch } from "primereact/inputswitch"
import clientService from "@/services/clientService"
import sessionStore from '@/stores/session'
import BreadCrumbs from "@/components/shared/BreadCrumbs"

/**
 * ClientForm Component
 * Renders a form for creating or editing clients.
 * Uses absolute positioning for action buttons to match legacy styling.
 */
export default function ClientForm() {
	const { clientId } = useParams()
	const navigate = useNavigate()
	const { user: userLogged } = sessionStore()

	const [form, setForm] = useState({
		name: '',
		company: '',
		active: true
	})
	const [loading, setLoading] = useState(false)
	const [fetching, setFetching] = useState(false)
	const [error, setError] = useState('')

	const isNew = () => clientId === 'NEW';

	useEffect(() => {
		if (!isNew() && userLogged && userLogged.userRole) { // Corrected !isNew to !isNew() and loadClient to loadClientData
			loadClientData()
		}
	}, [clientId, userLogged])

	/**
	 * Loads client data from the API based on the clientId param.
	 */
	const loadClientData = async () => {
		setFetching(true)
		try {
			const data = await clientService.getClient(clientId)
			setForm({
				name: data.name || '',
				company: data.company || '',
				active: Boolean(data.active)
			})
		} catch (err) {
			setError('Error loading client data')
		} finally {
			setFetching(false)
		}
	}

	/**
	 * Handles input changes for the form fields.
	 * @param {Event} e
	 */
	const handleChange = (e) => {
		const { name, value } = e.target
		setForm((prev) => ({ ...prev, [name]: value }))
	}

	/**
	 * Handles form submission for both create and update operations.
	 * @param {Event} e
	 */
	const handleSubmit = async (e) => {
		e.preventDefault()
		if (!form.name || !form.company) {
			return setError('Name and Company are required')
		}

		setLoading(true)
		setError('')

		try {
			if (isNew()) {
				await clientService.createClient(form)
			} else {
				await clientService.updateClient(clientId, form)
			}
			navigate(-1)
		} catch (error) {
			setError(error.message || 'Error saving client data')
		} finally {
			setLoading(false)
		}
	}

	if (userLogged.userRole !== 'admin' && userLogged.userRole !== 'pm') {
		return <div className="p-4 text-center text-red-600 font-bold">Access Denied: Only Admin and PM can manage clients.</div>
	}

	if (fetching) return <div className="p-4 text-center">Loading...</div>

	return (
		<div className="">
			<div className="flex justify-between items-center mb-8">
				<h2 className="text-2xl font-medium">{isNew() ? 'New Client' : 'Edit Client'}</h2>
			</div>

			<form onSubmit={handleSubmit} className="flex flex-col gap-6">
				<div className="flex flex-col gap-6">
					<FloatLabel>
						<InputText
							id="name"
							name="name"
							value={form.name}
							onChange={handleChange}
							className="p-inputtext-sm w-full"
							required
						/>
						<label htmlFor="name">Name</label>
					</FloatLabel>

					<FloatLabel>
						<InputText
							id="company"
							name="company"
							value={form.company}
							onChange={handleChange}
							className="p-inputtext-sm w-full"
							required
						/>
						<label htmlFor="company">Company</label>
					</FloatLabel>

					{!isNew() && (
						<div className="flex items-center gap-2 px-1">
							<InputSwitch
								inputId="active"
								checked={form.active}
								onChange={(e) => setForm({ ...form, active: e.value })}
							/>
							<label htmlFor="active" className="text-gray-700 font-medium">
								{form.active ? "Active" : "Inactive"}
							</label>
						</div>
					)}
				</div>

				{error && (
					<div className="p-3 bg-red-100 text-red-700 rounded text-right ml-auto">
						{error}
					</div>
				)}

				<div className="flex justify-between items-center mt-4">
					<Button
						type="button"
						label="Back"
						icon="pi pi-arrow-left"
						size="small"
						className="p-button-text"
						onClick={() => navigate(-1)}
					/>
					<Button
						type="submit"
						label={loading ? "Saving..." : isNew() ? "Save" : "Update"}
						size="small"
						disabled={loading}
					/>
				</div>
			</form>
		</div>
	)
}
