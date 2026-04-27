import React from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Tag } from 'primereact/tag'
import { AvatarGroup } from 'primereact/avatargroup'
import { Avatar } from 'primereact/avatar'

export default function TasksTable({ tasks, loading, onEdit, onDelete, onTrackingToggle, activeTrackId }) {
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
        const progress = progressMap[rowData.progress] || { severity: 'secondary', value: rowData.progress }
        return <Tag value={progress.value} severity={progress.severity} />
    }

    const assigneesBodyTemplate = (rowData) => {
        if (!rowData.assignees || rowData.assignees.length === 0) return '-'
        return (
            <AvatarGroup>
                {rowData.assignees.slice(0, 3).map((user) => (
                    <Avatar key={user.id} image={user.photo} label={!user.photo ? user.name[0] : null} shape="circle" title={user.name} />
                ))}
                {rowData.assignees.length > 3 && <Avatar label={`+${rowData.assignees.length - 3}`} shape="circle" />}
            </AvatarGroup>
        )
    }

    const actionsTemplate = (rowData) => {
        const isTracking = activeTrackId === rowData.id
        return (
            <div className="flex gap-2">
                <Button
                    icon={isTracking ? "pi pi-pause" : "pi pi-play"}
                    className={`p-button-rounded p-button-sm ${isTracking ? 'p-button-danger' : 'p-button-success'}`}
                    onClick={() => onTrackingToggle(rowData)}
                    tooltip={isTracking ? "Pause Tracking" : "Start Tracking"}
                />
                <Button
                    icon="pi pi-pencil"
                    className="p-button-rounded p-button-outlined p-button-sm"
                    onClick={() => onEdit(rowData)}
                    tooltip="Edit Task"
                />
                <Button
                    icon={rowData.isActive === 1 ? "pi pi-trash" : "pi pi-refresh"}
                    className={`p-button-rounded p-button-outlined p-button-sm ${rowData.isActive === 1 ? 'p-button-danger' : 'p-button-success'}`}
                    onClick={() => onDelete(rowData)}
                    tooltip={rowData.isActive === 1 ? "Deactivate" : "Activate"}
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
        >
            <Column field="id" header="ID" sortable />
            <Column field="projectName" header="Project" sortable />
            <Column field="name" header="Task Name" sortable />
            <Column field="startDate" header="Start Date" sortable />
            <Column field="endDate" header="End Date" sortable />
            <Column field="duration" header="Duration (est)" sortable />
            <Column body={progressBodyTemplate} header="Progress" sortable sortField="progress" />
            <Column body={statusBodyTemplate} header="Status" sortable sortField="isActive" />
            <Column body={assigneesBodyTemplate} header="Assignees" />
            <Column body={actionsTemplate} header="Actions" style={{ width: '150px' }} />
        </DataTable>
    )
}
