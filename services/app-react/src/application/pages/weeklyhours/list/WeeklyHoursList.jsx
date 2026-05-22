import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import weeklyhoursService from '@/services/weeklyhoursService'
import sessionStore from '@/stores/session'

import PageHeader from '@/components/shared/PageHeader'

export default function WeeklyHoursList() {
	const [records, setRecords] = useState([])
	const [loading, setLoading] = useState(true)
	const navigate = useNavigate()
	const { user: userLogged } = sessionStore()

	useEffect(() => {
		if (userLogged && userLogged.userRole) {
			loadRecords()
		}
	}, [userLogged])

	const loadRecords = async () => {
		setLoading(true)
		try {
			const data = await weeklyhoursService.getAll()
			setRecords(data)
		} catch (error) {
			console.error('Error loading weekly hours:', error)
		} finally {
			setLoading(false)
		}
	}

	const statusBodyTemplate = (rowData) => {
		const isActive = String(rowData.borrado) === '0'
		return (
			<span className={`lexart-tag ${isActive ? 'lexart-tag--success' : 'lexart-tag--danger'}`}>
				{isActive ? 'Active' : 'Deleted'}
			</span>
		)
	}

	const actionBodyTemplate = (rowData) => {
		return (
			<div className="flex justify-end pr-4">
				<Button
					icon="pi pi-pencil"
					rounded
					outlined
					size="small"
					onClick={() => navigate(`/weeklyhour/${rowData.id}`)}
					aria-label="Edit"
					title="Edit"
				/>
			</div>
		)
	}

	const userNameTemplate = (rowData) => {
		return (
			<div className="flex items-center gap-2">
				<i className="pi pi-user text-gray-400 bg-gray-100 p-2 rounded-full text-xs" />
				<span
					className="text-blue-500 underline cursor-pointer hover:text-blue-700"
					onClick={() => navigate(`/weeklyhour/${rowData.id}`)}
				>
					{rowData.userName}
				</span>
			</div>
		)
	}

	const costBodyTemplate = (rowData) => {
		return `${rowData.currency} ${Number(rowData.costHour).toFixed(2)}`
	}

	const dateBodyTemplate = (field) => (rowData) => {
		return rowData[field] || <span className="text-gray-400">—</span>
	}

	if (userLogged.userRole !== 'admin' && userLogged.userRole !== 'pm') {
		return <div className="p-4 text-center text-red-600 font-bold">Access Denied: Only Admin and PM can manage weekly hours.</div>
	}

	return (
		<div className="p-4 lg:p-10 max-w-[1600px] mx-auto animate-in fade-in duration-500">
			<PageHeader 
				title="Weekly Hours" 
				description="Manage and audit standard workloads and cost-per-hour settings" 
				buttonLabel="New Weekly Hour" 
				onButtonClick={() => navigate('/weeklyhour/NEW')}
			/>

			<div className="lexart-wa__cnt">
				<DataTable
					value={records}
					loading={loading}
					paginator
					rows={10}
					paginatorClassName="border-none bg-transparent"
					rowsPerPageOptions={[5, 10, 25, 50]}
					tableStyle={{ minWidth: '50rem' }}
					className="lexart-table"
					emptyMessage="No weekly hours found."
					filterDisplay="row"
					pt={{
						root: { className: 'border-none shadow-none bg-transparent' },
						header: { className: 'hidden' },
						thead: { className: 'bg-transparent' },
						column: {
							headerCell: { className: 'bg-transparent border-none p-3 font-bold text-gray-800' },
							filterCell: { className: 'bg-transparent border-none p-3' },
							bodyCell: { className: 'p-3 border-b border-gray-100' },
							filterMenuButton: { className: 'hidden' },
							filterClearButton: { className: 'hidden' },
						},
						filterRow: { className: 'bg-transparent' },
						filterInput: { className: 'field-filter' },
					}}
				>
					<Column field="id" header="ID" sortable filter filterPlaceholder="ID" style={{ width: '6rem' }} />
					<Column field="userName" header="User" body={userNameTemplate} sortable filter filterPlaceholder="User" />
					<Column field="costHour" header="Cost/Hour" body={costBodyTemplate} sortable style={{ width: '12rem' }} />
					<Column field="workLoad" header="Workload (h)" sortable style={{ width: '10rem' }} />
					<Column field="valid_from" header="Valid From" body={dateBodyTemplate('valid_from')} sortable filter filterPlaceholder="Date" style={{ width: '10rem' }} />
					<Column field="valid_until" header="Valid Until" body={dateBodyTemplate('valid_until')} sortable style={{ width: '10rem' }} />
					<Column header="Status" body={statusBodyTemplate} sortable sortField="borrado" style={{ width: '8rem' }} />
					<Column body={actionBodyTemplate} exportable={false} style={{ width: '6rem' }} />
				</DataTable>
			</div>
		</div>
	)
}
