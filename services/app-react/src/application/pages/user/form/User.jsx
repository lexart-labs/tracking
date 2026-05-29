//Core
import { useContext, useRef, useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { resizerContext } from "@/providers/iframe-resizer"
//Stores and services
import sessionStore from '@/stores/session'
import { UserService, getPhotoUrl } from "@/services/userService"
//Componentes
import BreadCrumbs from "@/components/shared/BreadCrumbs"
import { InputText } from "primereact/inputtext"
import { FloatLabel } from "primereact/floatlabel"
import { Button } from "primereact/button"
import { Card } from "primereact/card"
import { Password } from "primereact/password"
import { Dropdown } from "primereact/dropdown"
import { FileUpload } from "primereact/fileupload"
import { InputNumber } from "primereact/inputnumber"
import { Toast } from "primereact/toast"



const roles = ['developer', 'client', 'admin', 'arquitect', 'pm']

export function User() {
	const { userId } = useParams()
	const userLogged = sessionStore.getState().user || {}
	const navigate = useNavigate()
	const userService = new UserService()

	const [form, setForm] = useState({
		name: '',
		email: '',
		password: '',
		role: '',
		idSlack: '',
		idClient: null,
		image: null,
		imagePreview: null,
		image_base: '',
		photo: ''
	})
	const [submitted, setSubmitted] = useState(false)
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const [authorized, setAuthorized] = useState(true)
	const toast = useRef(null)

	const isNewUser = () => userId === 'NEW';
	const isAdminOrPm = userLogged.userRole === 'admin' || userLogged.userRole === 'pm';
	const currentUserId = userLogged.id || userLogged.userId;
	const isSelf = !userId || String(userId) === String(currentUserId);

	useEffect(() => {
		const effectiveUserId = isNewUser() ? null : (userId || currentUserId);

		if (!isAdminOrPm && (!isSelf || isNewUser())) {
			setAuthorized(false);
			return;
		}

		setAuthorized(true);
		if (isNewUser() || !effectiveUserId) return;
		loadUserData(effectiveUserId)
	}, [userId, userLogged])

	const loadUserData = async (id) => {
		try {
			const userData = await userService.getUser(id)

			const imagePreview = userData.photo || null

			setForm(prev => ({
				...prev,
				...userData,
				imagePreview: imagePreview,
				image_base: userData.image_base || '',
				photo: getPhotoUrl(userData.photo) || ''
			}))
		} catch (err) {
			setError('Error loading user data')
		}
	}

	const handleChange = (e) => {
		const { name, value } = e.target
		setForm((prev) => ({ ...prev, [name]: value }))
	}

	const handleFileSelect = (event) => {
		const file = event.files[0];
		if (!file) return;

		// Convert to base64
		const reader = new FileReader();
		reader.readAsDataURL(file);

		reader.onloadend = () => {
			const base64Data = reader.result;
			setForm(prev => ({
				...prev,
				image: file,
				imagePreview: base64Data,
				image_base: base64Data
			}));
		};
	};

	const handleSubmit = async (e) => {
		e.preventDefault()
		setError(null)
		if (!form.name) return setError('Name is required')
		if (!form.email) return setError('Email is required')
		if (!form.password && isNewUser()) return setError('Password is required')
		if (!form.role) return setError('Role is required')
		if (form.password && form.password.length < 8) return setError('Password must be at least 8 characters long')

		setSubmitted(true)
		setLoading(true)
		setError('')

		try {
			// Only include image_base if user selected a NEW image (starts with "data:")
			// Never send imagePreview (base64 display copy), photo (resolved URL), or image (File object)
			const hasNewImage = form.image_base && form.image_base.startsWith('data:')

			const formData = {
				name: form.name,
				email: form.email,
				role: form.role,
				idSlack: form.idSlack,
				idClient: form.idClient,
				...(form.password ? { password: form.password } : {}),
				...(hasNewImage ? { image_base: form.image_base } : {}),
			}

			if (isNewUser()) {
				await userService.createUser(formData)
			} else {
				await userService.updateUser(userId, formData)
			}

			setSubmitted(false)
			setLoading(false)
			toast.current?.show({ severity: 'success', summary: 'Saved', detail: isNewUser() ? 'User created successfully' : 'User updated successfully', life: 3000 })

			const shouldNavigateToUsers = isNewUser() || (!isSelf && isAdminOrPm)
			if (shouldNavigateToUsers) {
				navigate('/users')
			}
		} catch (error) {
			setError(error.message || 'Error saving user data')
			setSubmitted(false)
			setLoading(false)
		}
	}

	if (!authorized) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-white rounded-lg shadow-sm border border-gray-100 max-w-md mx-auto my-12 animate-in fade-in duration-300">
				<i className="pi pi-exclamation-triangle text-red-500 text-5xl mb-4" />
				<h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
				<p className="text-gray-600 mb-6">
					You do not have permission to view or edit this user's profile.
				</p>
				<Button
					label="Go Back"
					icon="pi pi-arrow-left"
					size="small"
					onClick={() => navigate(-1)}
				/>
			</div>
		)
	}

	return (
		<div className="">
			<Toast ref={toast} />
			<div className="flex justify-between items-center mb-8">
				<h2 className="text-2xl font-medium">
					{isNewUser() ? 'Creating User' : isSelf ? 'My Profile' : 'Editing User'}
				</h2>
				{isSelf && (
					<span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded border border-blue-200">
						Editando tu perfil
					</span>
				)}
			</div>

			<form onSubmit={handleSubmit} className="flex flex-col gap-6">
				<div className="grid grid-cols-2 gap-4">
					<div className="col">
						<FloatLabel className="w-full">
							<InputText
								id="name"
								name="name"
								value={form.name}
								onChange={handleChange}
								required
								className="p-inputtext-sm w-full"
							/>
							<label htmlFor="name">Name *</label>
						</FloatLabel>
					</div>
					<div className="col">
						<FloatLabel className="w-full">
							<InputText
								id="email"
								name="email"
								value={form.email}
								onChange={handleChange}
								required
								className="p-inputtext-sm w-full"
								inputstyle={{ width: '100%' }}
							/>
							<label htmlFor="email">Email *</label>
						</FloatLabel>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="col">
						<FloatLabel className="w-full">
							<Password
								id="password"
								name="password"
								value={form.password}
								onChange={handleChange}
								className="p-inputtext-sm w-full"
								inputClassName="w-full"
							/>
							<label htmlFor="password">Password</label>
						</FloatLabel>
					</div>
					<div className="col">
						<FloatLabel className="w-full">
							<Dropdown
								id="role"
								name="role"
								value={form.role}
								options={roles}
								onChange={(e) => handleChange({ target: { name: 'role', value: e.value } })}
								disabled={userLogged.userRole !== 'admin'}
								className="p-inputtext-sm w-full"
								inputstyle={{ width: '100%' }}
							/>
							<label htmlFor="role">Role</label>
						</FloatLabel>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="col">
						<FloatLabel className="w-full">
							<InputText
								id="slackId"
								name="idSlack"
								value={form.idSlack}
								onChange={handleChange}
								className="p-inputtext-sm w-full"
								inputstyle={{ width: '100%' }}
							/>
							<label htmlFor="slackId">Slack ID</label>
						</FloatLabel>
					</div>
					<div className="col">
						<div className="flex flex-col gap-2">
							Imagen actual:
							<img
								src={form.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || 'User')}&background=random`}
								alt="Profile"
								className="w-40 h-40 object-cover rounded-full mb-2"
								onError={(e) => {
									e.target.onerror = null;
									e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || 'User')}&background=random`;
								}}
							/>
							<FileUpload
								mode="basic"
								name="image"
								onSelect={handleFileSelect}
								accept="image/*"
								maxFileSize={1000000}
								className="w-full"
							/>
							{/* Show preview only for newly selected images (not the existing saved photo) */}
					{form.imagePreview && form.imagePreview.startsWith('data:') && (
						<div className="flex flex-col gap-1">
							<span className="text-xs text-gray-500">Nueva imagen seleccionada:</span>
							<img
								src={form.imagePreview}
								alt="Profile preview"
								className="w-40 h-40 object-cover rounded-full mb-2 border-2 border-blue-400"
							/>
						</div>
					)}
						</div>
					</div>
				</div>

				{form.role === 'client' && (
					<div className="col">
						<FloatLabel className="w-full">
							<InputNumber
								id="clientId"
								name="idClient"
								value={form.idClient}
								onChange={(e) => setForm((prev) => ({ ...prev, idClient: e.value }))}
								disabled={userLogged.userRole !== 'admin'}
								className="p-inputtext-sm w-full"
								inputstyle={{ width: '100%' }}
							/>
							<label htmlFor="clientId">Client ID</label>
						</FloatLabel>
					</div>
				)}

				{error && (
					<div className="p-3 bg-red-100 text-red-700 rounded text-right  ml-auto animate-bounce">
						{error}
					</div>
				)}

				<div className="flex justify-between items-center">
					<Button
						label="Back"
						icon="pi pi-arrow-left"
						size="small"
						className="p-button-text"
						onClick={() => navigate(-1)}
					/>
					<Button
						type="submit"
						label={loading ? "Saving..." : isNewUser() ? "Save" : "Update"}
						size="small"
						disabled={submitted || loading}
					/>
				</div>
			</form>
		</div>
	)
}
