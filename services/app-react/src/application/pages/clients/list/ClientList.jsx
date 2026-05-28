import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import clientService from '@/services/clientService'
import sessionStore from '@/stores/session'
import PageHeader from '@/components/shared/PageHeader'

/**
 * ClientList Component
 * Displays a searchable, sortable list of clients using PrimeReact DataTable.
 * Aligned with legacy Users module styling.
 */
export default function ClientList() {
	const [clients, setClients] = useState([])
	const [draftFilters, setDraftFilters] = useState({ id: '', name: '', company: '' })
	const [appliedFilters, setAppliedFilters] = useState({ id: '', name: '', company: '' })
	const [loading, setLoading] = useState(true)
	const navigate = useNavigate()
	const { user: userLogged } = sessionStore()

	useEffect(() => {
		if (userLogged && userLogged.userRole) {
			loadClients()
		}
	}, [userLogged])

	/**
	 * Fetches the list of clients from the service.
	 */
	const loadClients = async () => {
		setLoading(true)
		try {
			const data = await clientService.getClients()
			setClients(data)
		} catch (error) {
			console.error('Error loading clients:', error)
		} finally {
			setLoading(false)
		}
	}

	/**
	 * Toggles the active status of a client.
	 * @param {Object} client The client object to update.
	 */
	const toggleActive = async (client) => {
		try {
			await clientService.toggleActive(client.id, !client.active)
			await loadClients()
		} catch (error) {
			console.error('Error toggling client status:', error)
		}
	}

	/**
	 * Template for the status column tags.
	 * @param {Object} rowData
	 * @returns {JSX.Element}
	 */
	const statusBodyTemplate = (rowData) => {
		return (
			<span className={`lexart-tag ${rowData.active ? 'lexart-tag--success' : 'lexart-tag--danger'}`}>
				{rowData.active ? 'Active' : 'Inactive'}
			</span>
		)
	}

	/**
	 * Template for the action column (circular Edit button).
	 * @param {Object} rowData
	 * @returns {JSX.Element}
	 */
	const actionBodyTemplate = (rowData) => {
		return (
			<div className="flex justify-end pr-4">
				<Button
					icon="pi pi-pencil"
					rounded
					outlined
					className="p-button-sm mr-2"
					onClick={() => navigate(`/client/${rowData.id}`)}
					aria-label="Edit"
				/>
			</div>
		)
	}

	/**
	 * Template for the Client Name column.
	 * Includes a user icon and navigates to the edit page on click.
	 * @param {Object} client
	 * @returns {JSX.Element}
	 */
	const clientNameTemplate = (client) => {
		return (
			<div className="flex items-center gap-2">
				<i className="pi pi-user text-gray-400 bg-gray-100 p-2 rounded-full text-xs" />
				<span
					className="text-blue-500 underline cursor-pointer hover:text-blue-700"
					onClick={() => navigate(`/client/${client.id}`)}
				>
					{client.name}
				</span>
			</div>
		)
	}

	const filteredClients = clients.filter((c) => {
		const idOk = !appliedFilters.id || String(c.id || '').toLowerCase().includes(appliedFilters.id.toLowerCase())
		const nameOk = !appliedFilters.name || String(c.name || '').toLowerCase().includes(appliedFilters.name.toLowerCase())
		const companyOk = !appliedFilters.company || String(c.company || '').toLowerCase().includes(appliedFilters.company.toLowerCase())
		return idOk && nameOk && companyOk
	})

	const handleApplyFilters = () => setAppliedFilters({ ...draftFilters })
	const handleClearFilters = () => {
		const empty = { id: '', name: '', company: '' }
		setDraftFilters(empty)
		setAppliedFilters(empty)
	}

	if (userLogged.userRole !== 'admin' && userLogged.userRole !== 'pm') {
		return <div className="p-4 text-center text-red-600 font-bold">Access Denied: Only Admin and PM can manage clients.</div>
	}

	return (
		<div className="p-4 lg:p-10 max-w-[1600px] mx-auto animate-in fade-in duration-500">
			<PageHeader 
				title="Clients" 
				description="Manage your client list and track associated company accounts" 
				buttonLabel="New Client" 
				onButtonClick={() => navigate('/client/NEW')}
			/>

			<div className="lexart-wa__cnt">
				<div className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 items-end">
					<div className="flex flex-col gap-2">
						<label className="text-xs font-bold text-gray-500 uppercase ml-1">ID</label>
						<InputText value={draftFilters.id} onChange={(e) => setDraftFilters((p) => ({ ...p, id: e.target.value }))} placeholder="ID" className="h-[42px]" />
					</div>
					<div className="flex flex-col gap-2">
						<label className="text-xs font-bold text-gray-500 uppercase ml-1">Name</label>
						<InputText value={draftFilters.name} onChange={(e) => setDraftFilters((p) => ({ ...p, name: e.target.value }))} placeholder="Name" className="h-[42px]" />
					</div>
					<div className="flex flex-col gap-2">
						<label className="text-xs font-bold text-gray-500 uppercase ml-1">Company</label>
						<InputText value={draftFilters.company} onChange={(e) => setDraftFilters((p) => ({ ...p, company: e.target.value }))} placeholder="Company" className="h-[42px]" />
					</div>
					<div className="flex gap-2 ml-auto">
						<Button label="Apply" icon="pi pi-search" className="p-button-primary rounded-lg h-[42px] px-6" onClick={handleApplyFilters} />
						<Button label="Clear" icon="pi pi-filter-slash" className="p-button-secondary p-button-outlined rounded-lg h-[42px] px-4" onClick={handleClearFilters} />
					</div>
				</div>
				<DataTable
					value={filteredClients}
					loading={loading}
					paginator
					rows={10}
					paginatorClassName="border-none bg-transparent"
					rowsPerPageOptions={[5, 10, 25, 50]}
					tableStyle={{ minWidth: '50rem' }}
					className="lexart-table"
					emptyMessage="No clients found."
					pt={{
						root: { className: 'border-none shadow-none bg-transparent' },
						header: { className: 'hidden' },
						thead: { className: 'bg-transparent' },
						column: {
							headerCell: { className: 'bg-transparent border-none p-3 font-bold text-gray-800' },
							bodyCell: { className: 'p-3 border-b border-gray-100' },
						},
						filterInput: { className: 'field-filter' }
					}}
				>
					<Column field="id" header="ID" sortable style={{ width: '8rem' }} />
					<Column field="name" header="Name" body={clientNameTemplate} sortable />
					<Column field="company" header="Company" sortable />
					<Column header="Status" body={statusBodyTemplate} sortable sortField="active" style={{ width: '10rem' }} />
					<Column body={actionBodyTemplate} exportable={false} style={{ width: '8rem' }} />
				</DataTable>
			</div>
		</div>
	)
}
