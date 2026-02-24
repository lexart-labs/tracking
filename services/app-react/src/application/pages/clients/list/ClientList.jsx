import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Tag } from 'primereact/tag'
import clientService from '@/services/clientService'
import sessionStore from '@/stores/session'
import BreadCrumbs from '@/components/shared/BreadCrumbs'

/**
 * ClientList Component
 * Displays a searchable, sortable list of clients using PrimeReact DataTable.
 * Aligned with legacy Users module styling.
 */
export default function ClientList() {
	const [clients, setClients] = useState([])
	const [globalFilter, setGlobalFilter] = useState(null)
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
				<button
					className="lexart-btn-circle"
					onClick={() => navigate(`/client/${rowData.id}`)}
					title="Edit"
				>
					<i className="ri-edit-line" />
				</button>
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

	if (userLogged.userRole !== 'admin' && userLogged.userRole !== 'pm') {
		return <div className="p-4 text-center text-red-600 font-bold">Access Denied: Only Admin and PM can manage clients.</div>
	}

	return (
		<>
			<div className="lexart-wa__hdr lexart-flex">
				<div className="lexart-flex-5 flex justify-between items-center w-full">
					<h1 className="lexart-wa__tit">
						<a className="lexart-bc-item">Clients</a>
					</h1>
					<div className="lexart-btn__right m-0">
						<button
							className="lexart-btn lexart-btn--round"
							onClick={() => navigate('/client/NEW')}
						>
							+ CLIENT
						</button>
					</div>
				</div>
			</div>

			<div className="lexart-wa__cnt">
				<DataTable
					value={clients}
					loading={loading}
					paginator
					rows={10}
					paginatorClassName="border-none bg-transparent"
					rowsPerPageOptions={[5, 10, 25, 50]}
					tableStyle={{ minWidth: '50rem' }}
					className="lexart-table"
					emptyMessage="No clients found."
					filterDisplay="row"
					pt={{
						root: { className: 'border-none shadow-none bg-transparent' },
						header: { className: 'hidden' },
						thead: { className: 'bg-transparent' },
						column: {
							headerCell: { className: 'bg-transparent border-none p-3 font-bold text-gray-800' },
							filterCell: { className: 'bg-transparent border-none p-3' },
							bodyCell: { className: 'p-3 border-b border-gray-100' },
							filterMenuButton: { className: 'hidden' }, // Hide the filter icon
							filterClearButton: { className: 'hidden' } // Hide clear button
						},
						filterRow: { className: 'bg-transparent' },
						filterInput: { className: 'field-filter' }
					}}
				>
					<Column field="id" header="ID" sortable filter filterPlaceholder="ID" style={{ width: '8rem' }} />
					<Column field="name" header="Name" body={clientNameTemplate} sortable filter filterPlaceholder="Name" />
					<Column field="company" header="Company" sortable filter filterPlaceholder="Company" />
					<Column header="Status" body={statusBodyTemplate} sortable sortField="active" style={{ width: '10rem' }} />
					<Column body={actionBodyTemplate} exportable={false} style={{ width: '8rem' }} />
				</DataTable>
			</div>
		</>
	)
}
