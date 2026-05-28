import React from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Tag } from 'primereact/tag'

export default function TasksTable({ tasks, loading, onEdit, onDelete, onTrackingToggle, activeTrackId, hasActiveTrack }) {
    const statusBodyTemplate = (rowData) => {
        const severity = rowData.isActive === 1 ? 'success' : 'danger'
        return <Tag value={rowData.isActive === 1 ? 'Active' : 'Inactive'} severity={severity} />
    }

    const progressBodyTemplate = (rowData) => {
        const progressMap = {
            'To-do': { severity: 'info', value: 'To-do' },
            'In-Progress': { severity: 'warning', value: 'In-Progress' },
            'In-Review': { severity: 'help', value: 'In-Review' },
            'Done': { severity: 'success', value: 'Done' }
        }
        const statusValue = rowData.status || 'To-do'
        const progress = progressMap[statusValue] || { severity: 'secondary', value: statusValue }
        return <Tag value={progress.value} severity={progress.severity} className="px-3 py-1 rounded-full text-xs font-semibold" />
    }
    const actionsTemplate = (rowData) => {
        const isTracking = activeTrackId && Number(activeTrackId) === Number(rowData.id)
        const disablePlay = !!activeTrackId && !isTracking
        
        return (
            <div className="flex gap-2">
                <Button
                    icon={isTracking ? "pi pi-pause" : "pi pi-play"}
                    className={`p-button-rounded p-button-sm shadow-sm transition-all 
                        ${isTracking 
                            ? 'p-button-danger ring-2 ring-danger/20' 
                            : (disablePlay 
                                ? 'p-button-secondary opacity-40 grayscale cursor-not-allowed' 
                                : 'p-button-success ring-2 ring-success/20'
                            )
                        }`}
                    onClick={() => onTrackingToggle(rowData)}
                    tooltip={isTracking ? "Pause Tracking" : (disablePlay ? "Another task is running" : "Start Tracking")}
                    disabled={disablePlay}
                />
                <Button
                    icon="pi pi-pencil"
                    className="p-button-rounded p-button-outlined p-button-sm hover:bg-primary/10"
                    onClick={() => onEdit(rowData)}
                    tooltip="Edit Task"
                />
            </div>
        )
    }

    return (
        <DataTable
            value={tasks}
            loading={loading}
            paginator
            rows={10}
            className="lexart-table shadow-sm rounded-xl overflow-hidden"
            emptyMessage="No tasks found."
            responsiveLayout="stack"
            rowHover
        >
            <Column field="id" header="ID" sortable className="text-gray-500 font-medium" />
            <Column field="projectName" header="Project" sortable className="font-semibold text-gray-700" />
            <Column field="name" header="Task Name" sortable className="font-medium" />
            <Column field="startDate" header="Start Date" sortable />
            <Column field="endDate" header="End Date" sortable />
            <Column field="duration" header="Duration" sortable />
            <Column body={progressBodyTemplate} header="Progress" sortable sortField="status" />
            <Column body={actionsTemplate} header="Actions" style={{ width: '120px' }} />
        </DataTable>
    )
}
