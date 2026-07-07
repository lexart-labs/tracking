import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { InputText } from 'primereact/inputtext'
import { InputNumber } from 'primereact/inputnumber'
import { FloatLabel } from 'primereact/floatlabel'
import { Button } from 'primereact/button'
import { InputSwitch } from 'primereact/inputswitch'
import { Dropdown } from 'primereact/dropdown'
import { Calendar } from 'primereact/calendar'
import weeklyhoursService from '@/services/weeklyhoursService'
import userService from '@/services/userService'
import sessionStore from '@/stores/session'

const CURRENCIES = [
	{ label: 'USD', value: 'USD' },
	{ label: 'UYU', value: 'UYU' },
	{ label: 'BRL', value: 'BRL' },
	{ label: 'USDT', value: 'USDT' },
]

function toDateString(date) {
	if (!date) return null
	if (typeof date === 'string') return date
	const y = date.getFullYear()
	const m = String(date.getMonth() + 1).padStart(2, '0')
	const d = String(date.getDate()).padStart(2, '0')
	return `${y}-${m}-${d}`
}

function toDateObject(str) {
	if (!str) return null
	const [y, m, d] = str.split('-').map(Number)
	return new Date(y, m - 1, d)
}

export default function WeeklyHoursForm() {
	const { weeklyhoursId } = useParams()
	const navigate = useNavigate()
	const { user: userLogged } = sessionStore()

	const [form, setForm] = useState({
		idUser: '',
		userName: '',
		costHour: null,
		workLoad: null,
		currency: 'USD',
		borrado: 0,
		valid_from: null,
		valid_until: null,
	})
	const [users, setUsers] = useState([])
	const [loading, setLoading] = useState(false)
	const [fetching, setFetching] = useState(false)
	const [error, setError] = useState('')

	const isNew = () => weeklyhoursId === 'NEW'

	useEffect(() => {
		if (userLogged && userLogged.userRole) {
			if (isNew()) {
				loadUsers()
			} else {
				loadRecord()
			}
		}
	}, [weeklyhoursId, userLogged])

	const loadUsers = async () => {
		try {
			const data = await userService.getUsers()
			setUsers(data || [])
		} catch (err) {
			console.error('Error loading users:', err)
		}
	}

	const loadRecord = async () => {
		setFetching(true)
		try {
			const data = await weeklyhoursService.getById(weeklyhoursId)
			setForm({
				idUser: data.idUser,
				userName: data.userName,
				costHour: Number(data.costHour),
				workLoad: Number(data.workLoad),
				currency: data.currency,
				borrado: Number(data.borrado),
				valid_from: toDateObject(data.valid_from),
				valid_until: toDateObject(data.valid_until),
			})
		} catch (err) {
			setError('Error loading weekly hour data')
		} finally {
			setFetching(false)
		}
	}

	const handleUserSelect = (user) => {
		setForm((prev) => ({ ...prev, idUser: user.id, userName: user.name }))
	}

	const handleSubmit = async (e) => {
		e.preventDefault()

		if (!form.idUser || form.costHour === null || form.workLoad === null || !form.currency || !form.valid_from) {
			return setError('User, Cost/Hour, Workload, Currency and Valid From are required')
		}

		setLoading(true)
		setError('')

		const payload = {
			idUser: form.idUser,
			userName: form.userName,
			costHour: form.costHour,
			workLoad: form.workLoad,
			currency: form.currency,
			borrado: form.borrado,
			valid_from: toDateString(form.valid_from),
			valid_until: toDateString(form.valid_until),
		}

		try {
			if (isNew()) {
				await weeklyhoursService.create(payload)
			} else {
				await weeklyhoursService.update({ ...payload, id: Number(weeklyhoursId) })
			}
			navigate(-1)
		} catch (err) {
			setError(err.response?.data?.message || err.message || 'Error saving weekly hour data')
		} finally {
			setLoading(false)
		}
	}

	if (userLogged.userRole !== 'admin' && userLogged.userRole !== 'pm') {
		return <div className="p-4 text-center text-red-600 font-bold">Access Denied: Only Admin and PM can manage weekly hours.</div>
	}

	if (fetching) return <div className="p-4 text-center">Loading...</div>

	return (
		<div className="">
			<div className="flex justify-between items-center mb-8">
				<h2 className="text-2xl font-medium">{isNew() ? 'New Weekly Hour' : 'Edit Weekly Hour'}</h2>
			</div>

			<form onSubmit={handleSubmit} className="flex flex-col gap-6">
				<div className="flex flex-col gap-6">

					{isNew() ? (
						<FloatLabel>
							<Dropdown
								inputId="user"
								value={users.find((u) => u.id === form.idUser) || null}
								options={users}
								onChange={(e) => handleUserSelect(e.value)}
								optionLabel="name"
								filter
								className="w-full p-inputtext-sm"
							/>
							<label htmlFor="user">User</label>
						</FloatLabel>
					) : (
						<FloatLabel>
							<InputText
								id="userName"
								value={form.userName}
								className="p-inputtext-sm w-full"
								disabled
							/>
							<label htmlFor="userName">User</label>
						</FloatLabel>
					)}

					<div className="flex gap-4">
						<FloatLabel className="flex-1">
							<InputNumber
								inputId="costHour"
								value={form.costHour}
								onValueChange={(e) => setForm((prev) => ({ ...prev, costHour: e.value }))}
								mode="decimal"
								minFractionDigits={2}
								maxFractionDigits={2}
								min={0}
								inputClassName="p-inputtext-sm w-full"
								className="w-full"
							/>
							<label htmlFor="costHour">Cost per Hour</label>
						</FloatLabel>

						<FloatLabel className="flex-1">
							<InputNumber
								inputId="workLoad"
								value={form.workLoad}
								onValueChange={(e) => setForm((prev) => ({ ...prev, workLoad: e.value }))}
								mode="decimal"
								minFractionDigits={0}
								maxFractionDigits={2}
								min={0}
								inputClassName="p-inputtext-sm w-full"
								className="w-full"
							/>
							<label htmlFor="workLoad">Workload (h/week)</label>
						</FloatLabel>
					</div>

					<FloatLabel>
						<Dropdown
							inputId="currency"
							value={form.currency}
							options={CURRENCIES}
							onChange={(e) => setForm((prev) => ({ ...prev, currency: e.value }))}
							className="w-full p-inputtext-sm"
						/>
						<label htmlFor="currency">Currency</label>
					</FloatLabel>

					<div className="flex gap-4">
						<FloatLabel className="flex-1">
							<Calendar
								inputId="valid_from"
								value={form.valid_from}
								onChange={(e) => setForm((prev) => ({ ...prev, valid_from: e.value }))}
								dateFormat="yy-mm-dd"
								showIcon
								inputClassName="p-inputtext-sm w-full"
								className="w-full"
							/>
							<label htmlFor="valid_from">Valid From</label>
						</FloatLabel>

						<FloatLabel className="flex-1">
							<Calendar
								inputId="valid_until"
								value={form.valid_until}
								onChange={(e) => setForm((prev) => ({ ...prev, valid_until: e.value }))}
								dateFormat="yy-mm-dd"
								showIcon
								minDate={form.valid_from || undefined}
								inputClassName="p-inputtext-sm w-full"
								className="w-full"
							/>
							<label htmlFor="valid_until">Valid Until (optional)</label>
						</FloatLabel>
					</div>

					{!isNew() && (
						<div className="flex items-center gap-2 px-1">
							<InputSwitch
								inputId="borrado"
								checked={form.borrado === 0}
								onChange={(e) => setForm((prev) => ({ ...prev, borrado: e.value ? 0 : 1 }))}
							/>
							<label htmlFor="borrado" className="text-gray-700 font-medium">
								{form.borrado === 0 ? 'Active' : 'Deleted'}
							</label>
						</div>
					)}
				</div>

				{error && (
					<div className="p-3 bg-red-100 text-red-700 rounded ml-auto">
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
						label={loading ? 'Saving...' : isNew() ? 'Save' : 'Update'}
						size="small"
						disabled={loading}
					/>
				</div>
			</form>
		</div>
	)
}
