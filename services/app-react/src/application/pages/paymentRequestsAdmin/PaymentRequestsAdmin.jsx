import { useState, useEffect } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Dropdown } from 'primereact/dropdown'
import { Dialog } from 'primereact/dialog'
import { InputNumber } from 'primereact/inputnumber'
import { InputTextarea } from 'primereact/inputtextarea'
import { Calendar } from 'primereact/calendar'
import paymentRequestService from '@/services/paymentRequestService'
import userService from '@/services/userService'
import sessionStore from '@/stores/session'

const STATUSES = ['All', 'Pending', 'Approved', 'Rejected', 'Canceled']
const CONCEPTS = ['Closure', 'Benefits', 'Compensation', 'External']
const CURRENCIES = [
	{ label: 'USD', value: 'USD' },
	{ label: 'UYU', value: 'UYU' },
	{ label: 'Reales (BRL)', value: 'BRL' },
]

const STATUS_CLASSES = {
	Pending: 'lexart-tag--info',
	Approved: 'lexart-tag--success',
	Rejected: 'lexart-tag--danger',
	Canceled: 'lexart-tag--warning',
}

const INITIAL_FILTERS = {
	status: 'Pending',
	concept: null,
	user: null,
	currency: null,
	startDate: null,
	endDate: null,
}

export default function PaymentRequestsAdmin() {
	const { user: userLogged } = sessionStore()
	const [requests, setRequests] = useState([])
	const [users, setUsers] = useState([])
	const [loading, setLoading] = useState(false)
	const [filters, setFilters] = useState({ ...INITIAL_FILTERS })

	// Status update dialog
	const [statusDialog, setStatusDialog] = useState({ visible: false, request: null, status: null })
	const [observation, setObservation] = useState('')

	// Edit dialog
	const [editDialog, setEditDialog] = useState({ visible: false, request: null })
	const [editDetails, setEditDetails] = useState([])

	useEffect(() => {
		loadUsers()
		loadRequests(INITIAL_FILTERS)
	}, [])

	const loadUsers = async () => {
		try {
			const data = await userService.getUsers()
			setUsers(data)
		} catch (e) {
			console.error('Error loading users:', e)
		}
	}

	const loadRequests = async (f) => {
		setLoading(true)
		try {
			const data = await paymentRequestService.getAll(f)
			const mapped = (data || []).map((r) => {
				const startDetail = r.payment_request_details?.find((d) => d.start_date)
				const endDetail = r.payment_request_details?.find((d) => d.end_date)
				r.payment_request_details?.forEach((d) => {
					if (d.bill_link && !/^https?:\/\//.test(d.bill_link)) d.bill_link = 'https://' + d.bill_link
					if (d.report_link && !/^https?:\/\//.test(d.report_link)) d.report_link = 'https://' + d.report_link
				})
				return {
					...r,
					total: r.payment_request_details?.reduce((acc, d) => acc + (d.amount || 0), 0) ?? 0,
					created_at_display: r.created_at
						? new Date(r.created_at).toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'short', day: '2-digit' })
						: '',
					start_date_display: startDetail?.start_date
						? new Date(startDetail.start_date).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: '2-digit', year: 'numeric' })
						: '',
					end_date_display: endDetail?.end_date
						? new Date(endDetail.end_date).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: '2-digit', year: 'numeric' })
						: '',
				}
			})
			setRequests(mapped)
		} catch (e) {
			console.error('Error loading payment requests:', e)
		} finally {
			setLoading(false)
		}
	}

	const handleFilterChange = (field, value) => {
		setFilters((prev) => ({ ...prev, [field]: value }))
	}

	const handleApplyFilters = () => loadRequests(filters)

	const handleClearFilters = () => {
		setFilters({ ...INITIAL_FILTERS })
		loadRequests(INITIAL_FILTERS)
	}

	// Status dialog
	const openStatusDialog = (request, status) => {
		setStatusDialog({ visible: true, request, status })
		setObservation('')
	}

	const closeStatusDialog = () => setStatusDialog({ visible: false, request: null, status: null })

	const handleUpdateStatus = async () => {
		try {
			await paymentRequestService.updateStatus(statusDialog.request.id, {
				status: statusDialog.status,
				reply: observation,
			})
			closeStatusDialog()
			loadRequests(filters)
		} catch (e) {
			console.error('Error updating status:', e)
		}
	}

	// Edit dialog
	const openEditDialog = (request) => {
		setEditDetails(
			(request.payment_request_details || []).map((detail) => ({
				detail_id: detail.id,
				concept: detail.concept,
				amount: detail.amount ?? null,
				concept_description: detail.concept_description ?? '',
			}))
		)
		setEditDialog({ visible: true, request })
	}

	const closeEditDialog = () => {
		setEditDialog({ visible: false, request: null })
		setEditDetails([])
	}

	const handleEditDetailChange = (detailId, field, value) => {
		setEditDetails((prev) =>
			prev.map((detail) =>
				detail.detail_id === detailId ? { ...detail, [field]: value } : detail
			)
		)
	}

	const handleSaveEdit = async () => {
		try {
			await paymentRequestService.updateDetail(editDialog.request.id, {
				details: editDetails,
			})
			closeEditDialog()
			loadRequests(filters)
		} catch (e) {
			console.error('Error updating detail:', e)
		}
	}

	// Templates
	const statusTemplate = (row) => (
		<span className={`lexart-tag ${STATUS_CLASSES[row.status] || ''}`}>{row.status}</span>
	)

	const conceptsTemplate = (row) => (
		<div className="flex flex-col gap-1">
			{row.payment_request_details?.map((d, i) => (
				<div key={i} className="text-sm">
					<span className="font-medium">{d.concept}</span>
					{d.concept_description && <span className="text-gray-500"> — {d.concept_description}</span>}
					{d.bill_link && (
						<a href={d.bill_link} target="_blank" rel="noreferrer" className="ml-1 text-blue-500 underline text-xs">bill</a>
					)}
					{d.report_link && (
						<a href={d.report_link} target="_blank" rel="noreferrer" className="ml-1 text-blue-500 underline text-xs">report</a>
					)}
				</div>
			))}
		</div>
	)

	const totalTemplate = (row) => (
		<span>{Number(row.total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {row.currency}</span>
	)

	const userTemplate = (row) => (
		<span>{row.user?.name || `#${row.user_id}`}</span>
	)

	const actionsTemplate = (row) => (
		<div className="flex gap-1 justify-end pr-2">
			{row.status === 'Pending' && (
				<>
					<button
						className="lexart-btn-circle"
						title="Approve"
						onClick={() => openStatusDialog(row, 'Approved')}
					>
						<i className="ri-check-line" />
					</button>
					<button
						className="lexart-btn-circle"
						title="Reject"
						onClick={() => openStatusDialog(row, 'Rejected')}
					>
						<i className="ri-close-line" />
					</button>
				</>
			)}
			<button
				className="lexart-btn-circle"
				title="Edit"
				onClick={() => openEditDialog(row)}
			>
				<i className="ri-edit-line" />
			</button>
		</div>
	)

	if (userLogged?.userRole !== 'admin' && userLogged?.userRole !== 'pm') {
		return <div className="p-4 text-center text-red-600 font-bold">Access Denied: Only Admin and PM can access this page.</div>
	}

	const userOptions = [
		{ label: 'All users', value: '' },
		...users.map((u) => ({ label: u.name, value: u.id })),
	]

	return (
		<>
			<div className="lexart-wa__hdr lexart-flex">
				<div className="lexart-flex-5 flex justify-between items-center w-full">
					<h1 className="lexart-wa__tit">
						<a className="lexart-bc-item">Payment Requests</a>
					</h1>
				</div>
			</div>

			<div className="lexart-wa__cnt">
				{/* Filters */}
				<div className="flex flex-wrap gap-3 mb-4 items-end">
					<div className="flex flex-col gap-1">
						<label className="text-xs text-gray-500 font-medium">Status</label>
						<Dropdown
							value={filters.status}
							options={STATUSES.map((s) => ({ label: s, value: s }))}
							onChange={(e) => handleFilterChange('status', e.value)}
							placeholder="Status"
							style={{ minWidth: '130px' }}
						/>
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-xs text-gray-500 font-medium">Concept</label>
						<Dropdown
							value={filters.concept ?? ''}
							options={[{ label: 'All concepts', value: '' }, ...CONCEPTS.map((c) => ({ label: c, value: c }))]}
							onChange={(e) => handleFilterChange('concept', e.value || null)}
							placeholder="Concept"
							style={{ minWidth: '140px' }}
						/>
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-xs text-gray-500 font-medium">User</label>
						<Dropdown
							value={filters.user ?? ''}
							options={userOptions}
							onChange={(e) => handleFilterChange('user', e.value || null)}
							placeholder="User"
							filter
							style={{ minWidth: '160px' }}
						/>
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-xs text-gray-500 font-medium">Currency</label>
						<Dropdown
							value={filters.currency ?? ''}
							options={[{ label: 'All currencies', value: '' }, ...CURRENCIES]}
							onChange={(e) => handleFilterChange('currency', e.value || null)}
							placeholder="Currency"
							style={{ minWidth: '130px' }}
						/>
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-xs text-gray-500 font-medium">From</label>
						<Calendar
							value={filters.startDate}
							onChange={(e) => handleFilterChange('startDate', e.value)}
							placeholder="Start date"
							dateFormat="yy-mm-dd"
							style={{ minWidth: '140px' }}
						/>
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-xs text-gray-500 font-medium">To</label>
						<Calendar
							value={filters.endDate}
							onChange={(e) => handleFilterChange('endDate', e.value)}
							placeholder="End date"
							dateFormat="yy-mm-dd"
							style={{ minWidth: '140px' }}
						/>
					</div>
					<div className="flex gap-2">
						<button className="lexart-btn lexart-btn--round" onClick={handleApplyFilters}>
							Apply
						</button>
						<button className="lexart-btn lexart-btn--alt" onClick={handleClearFilters}>
							Clear
						</button>
					</div>
				</div>

				{/* Table */}
				<DataTable
					value={requests}
					loading={loading}
					paginator
					rows={10}
					rowsPerPageOptions={[5, 10, 25, 50]}
					paginatorClassName="border-none bg-transparent"
					tableStyle={{ minWidth: '60rem' }}
					className="lexart-table"
					emptyMessage="No payment requests found."
					pt={{
						root: { className: 'border-none shadow-none bg-transparent' },
						header: { className: 'hidden' },
						thead: { className: 'bg-transparent' },
						column: {
							headerCell: { className: 'bg-transparent border-none p-3 font-bold text-gray-800' },
							bodyCell: { className: 'p-3 border-b border-gray-100' },
						},
					}}
				>
					<Column field="id" header="ID" sortable style={{ width: '5rem' }} />
					<Column header="User" body={userTemplate} sortable sortField="user_id" />
					<Column header="Status" body={statusTemplate} sortable sortField="status" style={{ width: '9rem' }} />
					<Column header="Concepts" body={conceptsTemplate} />
					<Column header="Total" body={totalTemplate} sortable sortField="total" style={{ width: '12rem' }} />
					<Column field="created_at_display" header="Date" sortable style={{ width: '10rem' }} />
					<Column header="Period" body={(row) => row.start_date_display ? `${row.start_date_display} – ${row.end_date_display}` : ''} style={{ width: '14rem' }} />
					<Column body={actionsTemplate} exportable={false} style={{ width: '9rem' }} />
				</DataTable>
			</div>

			{/* Approve/Reject Dialog */}
			<Dialog
				visible={statusDialog.visible}
				onHide={closeStatusDialog}
				header={`${statusDialog.status} Request`}
				style={{ width: '420px' }}
				footer={
					<div className="flex justify-end gap-2">
						<button className="lexart-btn lexart-btn--alt" onClick={closeStatusDialog}>Cancel</button>
						<button className="lexart-btn lexart-btn--round" onClick={handleUpdateStatus}>Confirm</button>
					</div>
				}
			>
				<div className="flex flex-col gap-3 pt-2">
					<p className="text-sm text-gray-600">
						You are about to mark this request as <strong>{statusDialog.status}</strong>.
					</p>
					<div className="flex flex-col gap-1">
						<label className="text-xs text-gray-500 font-medium">Observation (optional)</label>
						<InputTextarea
							value={observation}
							onChange={(e) => setObservation(e.target.value)}
							rows={3}
							autoResize
							placeholder="Add a reply or observation..."
						/>
					</div>
				</div>
			</Dialog>

			{/* Edit Dialog */}
			<Dialog
				visible={editDialog.visible}
				onHide={closeEditDialog}
				header="Edit Payment Request"
				style={{ width: '560px' }}
				footer={
					<div className="flex justify-end gap-2">
						<button className="lexart-btn lexart-btn--alt" onClick={closeEditDialog}>Cancel</button>
						<button className="lexart-btn lexart-btn--round" onClick={handleSaveEdit}>Save</button>
					</div>
				}
			>
				<div className="flex flex-col gap-4 pt-2 max-h-[60vh] overflow-auto pr-1">
					{editDetails.map((detail) => (
						<div key={detail.detail_id} className="border border-gray-200 rounded p-3 flex flex-col gap-3">
							<div className="text-sm font-semibold text-gray-700">{detail.concept}</div>
							<div className="flex flex-col gap-1">
								<label className="text-xs text-gray-500 font-medium">Amount</label>
								<InputNumber
									value={detail.amount}
									onValueChange={(e) => handleEditDetailChange(detail.detail_id, 'amount', e.value)}
									minFractionDigits={2}
									maxFractionDigits={2}
								/>
							</div>
							<div className="flex flex-col gap-1">
								<label className="text-xs text-gray-500 font-medium">Description</label>
								<InputTextarea
									value={detail.concept_description}
									onChange={(e) => handleEditDetailChange(detail.detail_id, 'concept_description', e.target.value)}
									rows={3}
									autoResize
								/>
							</div>
						</div>
					))}
					{editDetails.length === 0 && (
						<p className="text-sm text-gray-500">No editable details found for this request.</p>
					)}
				</div>
			</Dialog>
		</>
	)
}
