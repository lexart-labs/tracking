import { useState, useEffect } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dropdown } from 'primereact/dropdown'
import { InputNumber } from 'primereact/inputnumber'
import { InputTextarea } from 'primereact/inputtextarea'
import { InputText } from 'primereact/inputtext'
import { Calendar } from 'primereact/calendar'
import { Dialog } from 'primereact/dialog'
import paymentRequestService from '@/services/paymentRequestService'
import sessionStore from '@/stores/session'
import PageHeader from '@/components/shared/PageHeader'

const CONCEPTS = ['Closure', 'Benefits', 'Compensation', 'External']

const STATUS_CLASSES = {
	Pending: 'lexart-tag--info',
	Approved: 'lexart-tag--success',
	Rejected: 'lexart-tag--danger',
	Canceled: 'lexart-tag--warning',
}

const INITIAL_DETAIL = {
	concept: null,
	concept_description: '',
	amount: null,
	start_date: null,
	end_date: null,
	bill_link: '',
	report_link: '',
}

function formatDate(date) {
	if (!date) return null
	return new Date(date).toISOString().split('T')[0]
}

export default function PaymentRequests() {
	const { user } = sessionStore()
	const userId = user?.userId

	const [history, setHistory] = useState([])
	const [loadingHistory, setLoadingHistory] = useState(false)
	const [pendingDetails, setPendingDetails] = useState([])
	const [detail, setDetail] = useState({ ...INITIAL_DETAIL })
	const [loadingAmount, setLoadingAmount] = useState(false)
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState('')

	// Details dialog
	const [detailsDialog, setDetailsDialog] = useState({ visible: false, request: null })
	// Cancel dialog
	const [cancelDialog, setCancelDialog] = useState({ visible: false, id: null })

	const minDate = new Date()
	minDate.setMonth(minDate.getMonth() - 2)

	useEffect(() => {
		if (userId) loadHistory()
	}, [userId])

	const loadHistory = async () => {
		setLoadingHistory(true)
		try {
			const data = await paymentRequestService.getUserHistory(userId)
			const mapped = (data || []).map((r) => ({
				...r,
				created_at_display: r.created_at
					? new Date(r.created_at).toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'short', day: '2-digit' })
					: '',
				total: r.payment_request_details?.reduce((acc, d) => acc + (d.amount || 0), 0) ?? 0,
			}))
			setHistory(mapped)
		} catch (e) {
			console.error('Error loading history:', e)
		} finally {
			setLoadingHistory(false)
		}
	}

	const handleConceptChange = async (concept) => {
		const next = { ...INITIAL_DETAIL, concept }
		setDetail(next)
		setError('')
	}

	const fetchClosureAmount = async (start, end) => {
		if (!start || !end) return
		setLoadingAmount(true)
		try {
			const result = await paymentRequestService.getClosureAmount(userId, formatDate(start), formatDate(end))
			setDetail((prev) => ({ ...prev, amount: result.amount ?? null }))
		} catch (e) {
			console.error('Error fetching closure amount:', e)
		} finally {
			setLoadingAmount(false)
		}
	}

	const handleDateChange = (field, value) => {
		const next = { ...detail, [field]: value }
		setDetail(next)
		if (detail.concept === 'Closure') {
			const start = field === 'start_date' ? value : detail.start_date
			const end = field === 'end_date' ? value : detail.end_date
			if (start && end) fetchClosureAmount(start, end)
		}
	}

	const handleAddDetail = () => {
		if (!detail.concept) return setError('Please select a concept.')
		if (!detail.concept_description) return setError('Please add a description.')
		if (!detail.amount || detail.amount <= 0) return setError('Amount must be greater than zero.')
		if (detail.concept === 'External' && (!detail.bill_link || !detail.report_link)) {
			return setError('Invoice and Report links are required for External concept.')
		}
		setError('')
		setPendingDetails((prev) => [...prev, { ...detail, id: Date.now() }])
		setDetail({ ...INITIAL_DETAIL })
	}

	const handleRemoveDetail = (id) => {
		setPendingDetails((prev) => prev.filter((d) => d.id !== id))
	}

	const handleSubmit = async () => {
		if (pendingDetails.length === 0) return setError('Add at least one concept before submitting.')
		setSubmitting(true)
		setError('')
		try {
			await paymentRequestService.create(pendingDetails)
			setPendingDetails([])
			setDetail({ ...INITIAL_DETAIL })
			await loadHistory()
		} catch (e) {
			setError('Error submitting request. Please try again.')
			console.error(e)
		} finally {
			setSubmitting(false)
		}
	}

	const handleCancel = async () => {
		try {
			await paymentRequestService.cancel(cancelDialog.id)
			setCancelDialog({ visible: false, id: null })
			await loadHistory()
		} catch (e) {
			console.error('Error canceling request:', e)
		}
	}

	const total = pendingDetails.reduce((acc, d) => acc + (d.amount || 0), 0)

	// Templates
	const statusTemplate = (row) => (
		<span className={`lexart-tag ${STATUS_CLASSES[row.status] || ''}`}>{row.status}</span>
	)

	const totalTemplate = (row) => (
		<span>{Number(row.total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {row.currency}</span>
	)

	const actionsTemplate = (row) => (
		<div className="flex gap-1 justify-end pr-2">
			<Button
				icon="pi pi-info-circle"
				rounded
				outlined
				className="p-button-sm"
				onClick={() => setDetailsDialog({ visible: true, request: row })}
				title="View details"
				aria-label="View details"
			/>
			{row.status === 'Pending' && (
				<Button
					icon="pi pi-times"
					rounded
					outlined
					severity="danger"
					className="p-button-sm"
					onClick={() => setCancelDialog({ visible: true, id: row.id })}
					title="Cancel"
					aria-label="Cancel"
				/>
			)}
		</div>
	)

	return (
		<div className="p-4 lg:p-10 max-w-[1600px] mx-auto animate-in fade-in duration-500">
			<PageHeader 
				title="Payment Requests" 
				description="Submit and track your payment requests and reimbursements" 
			/>

			<div className="flex flex-col gap-6 min-h-[600px]">

				{/* Form */}
				<div className="flex gap-4 items-start">
					{/* Concept form */}
					<div className="flex-1 border border-gray-200 rounded p-4 flex flex-col gap-3">
						<h2 className="font-semibold text-gray-700 text-sm mb-1">New Concept</h2>

						<div className="flex flex-col gap-1">
							<label className="text-xs text-gray-500 font-medium">Concept</label>
							<Dropdown
								value={detail.concept}
								options={CONCEPTS.map((c) => ({ label: c, value: c }))}
								onChange={(e) => handleConceptChange(e.value)}
								placeholder="Select concept"
							/>
						</div>

						{detail.concept === 'Closure' && (
							<div className="flex gap-3">
								<div className="flex flex-col gap-1 flex-1">
									<label className="text-xs text-gray-500 font-medium">From</label>
									<Calendar
										value={detail.start_date}
										onChange={(e) => handleDateChange('start_date', e.value)}
										minDate={minDate}
										maxDate={new Date()}
										dateFormat="yy-mm-dd"
										placeholder="Start date"
									/>
								</div>
								<div className="flex flex-col gap-1 flex-1">
									<label className="text-xs text-gray-500 font-medium">To</label>
									<Calendar
										value={detail.end_date}
										onChange={(e) => handleDateChange('end_date', e.value)}
										minDate={minDate}
										maxDate={new Date()}
										dateFormat="yy-mm-dd"
										placeholder="End date"
									/>
								</div>
							</div>
						)}

						<div className="flex flex-col gap-1">
							<label className="text-xs text-gray-500 font-medium">Amount</label>
							<InputNumber
								value={detail.amount}
								onValueChange={(e) => setDetail((prev) => ({ ...prev, amount: e.value }))}
								disabled={detail.concept === 'Closure'}
								placeholder={loadingAmount ? 'Calculating...' : '0.00'}
								minFractionDigits={2}
								maxFractionDigits={2}
							/>
						</div>

						<div className="flex flex-col gap-1">
							<label className="text-xs text-gray-500 font-medium">Observation</label>
							<InputTextarea
								value={detail.concept_description}
								onChange={(e) => setDetail((prev) => ({ ...prev, concept_description: e.target.value }))}
								rows={2}
								autoResize
								placeholder="Add a description..."
							/>
						</div>

						{detail.concept === 'External' && (
							<>
								<div className="flex flex-col gap-1">
									<label className="text-xs text-gray-500 font-medium">Invoice Link</label>
									<InputText
										value={detail.bill_link}
										onChange={(e) => setDetail((prev) => ({ ...prev, bill_link: e.target.value }))}
										placeholder="https://..."
									/>
								</div>
								<div className="flex flex-col gap-1">
									<label className="text-xs text-gray-500 font-medium">Report Link</label>
									<InputText
										value={detail.report_link}
										onChange={(e) => setDetail((prev) => ({ ...prev, report_link: e.target.value }))}
										placeholder="https://..."
									/>
								</div>
							</>
						)}

						{error && <p className="text-red-500 text-xs">{error}</p>}

						<button className="lexart-btn lexart-btn--round mt-1" onClick={handleAddDetail}>
							+ Add
						</button>
					</div>

					{/* Pending list */}
					<div className="flex-1 border border-gray-200 rounded p-4 flex flex-col gap-3 min-h-[200px]">
						<h2 className="font-semibold text-gray-700 text-sm mb-1">Summary</h2>

						{pendingDetails.length === 0 ? (
							<p className="text-gray-400 text-sm">No concepts added yet.</p>
						) : (
							<>
								<div className="flex flex-col gap-2">
									{pendingDetails.map((d) => (
										<div key={d.id} className="flex justify-between items-start border-b border-gray-100 pb-2">
											<div>
												<span className="font-medium text-sm">{d.concept}</span>
												{d.concept_description && <p className="text-xs text-gray-500">{d.concept_description}</p>}
											</div>
											<div className="flex items-center gap-2">
												<span className="text-sm font-semibold">{Number(d.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
												<Button
													icon="pi pi-trash"
													rounded
													outlined
													severity="danger"
													className="p-button-sm"
													onClick={() => handleRemoveDetail(d.id)}
													title="Remove"
													aria-label="Remove"
												/>
											</div>
										</div>
									))}
								</div>
								<div className="flex justify-between items-center pt-1 font-semibold text-sm">
									<span>Total</span>
									<span>{Number(total).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
								</div>
								<button
									className="lexart-btn lexart-btn--round mt-1"
									onClick={handleSubmit}
									disabled={submitting}
								>
									{submitting ? 'Submitting...' : 'Submit Request'}
								</button>
							</>
						)}
					</div>
				</div>

				{/* History */}
				<div>
					<h2 className="font-semibold text-gray-700 text-sm mb-3">History</h2>
					<DataTable
						value={history}
						loading={loadingHistory}
						paginator
						rows={10}
						rowsPerPageOptions={[5, 10, 25]}
						paginatorClassName="border-none bg-transparent"
						tableStyle={{ minWidth: '40rem' }}
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
						<Column field="id" header="ID" style={{ width: '5rem' }} />
						<Column field="created_at_display" header="Date" />
						<Column header="Status" body={statusTemplate} style={{ width: '9rem' }} />
						<Column header="Total" body={totalTemplate} style={{ width: '12rem' }} />
						<Column body={actionsTemplate} exportable={false} style={{ width: '8rem' }} />
					</DataTable>
				</div>
			</div>

			{/* Details Dialog */}
			<Dialog
				visible={detailsDialog.visible}
				onHide={() => setDetailsDialog({ visible: false, request: null })}
				header="Request Details"
				style={{ width: '480px' }}
			>
				{detailsDialog.request && (
					<div className="flex flex-col gap-3 pt-2">
						<div className="flex justify-between text-sm">
							<span className="text-gray-500">Status</span>
							<span className={`lexart-tag ${STATUS_CLASSES[detailsDialog.request.status] || ''}`}>
								{detailsDialog.request.status}
							</span>
						</div>
						{detailsDialog.request.reply && (
							<div className="flex flex-col gap-1 text-sm">
								<span className="text-gray-500">Admin reply</span>
								<p className="bg-gray-50 p-2 rounded text-gray-700">{detailsDialog.request.reply}</p>
							</div>
						)}
						<div className="flex flex-col gap-2 mt-1">
							{detailsDialog.request.payment_request_details?.map((d, i) => (
								<div key={i} className="border border-gray-100 rounded p-3 text-sm">
									<div className="flex justify-between font-medium">
										<span>{d.concept}</span>
										<span>{Number(d.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} {detailsDialog.request.currency}</span>
									</div>
									{d.concept_description && <p className="text-gray-500 mt-1">{d.concept_description}</p>}
									{d.bill_link && <a href={d.bill_link} target="_blank" rel="noreferrer" className="text-blue-500 underline text-xs block mt-1">Invoice</a>}
									{d.report_link && <a href={d.report_link} target="_blank" rel="noreferrer" className="text-blue-500 underline text-xs block">Report</a>}
								</div>
							))}
						</div>
					</div>
				)}
			</Dialog>

			{/* Cancel Confirmation Dialog */}
			<Dialog
				visible={cancelDialog.visible}
				onHide={() => setCancelDialog({ visible: false, id: null })}
				header="Cancel Request"
				style={{ width: '380px' }}
				footer={
					<div className="flex justify-end gap-2">
						<button className="lexart-btn lexart-btn--alt" onClick={() => setCancelDialog({ visible: false, id: null })}>No</button>
						<button className="lexart-btn lexart-btn--round" onClick={handleCancel}>Yes, cancel it</button>
					</div>
				}
			>
				<p className="text-sm text-gray-600 pt-2">Are you sure you want to cancel this request?</p>
			</Dialog>
		</div>
	)
}
