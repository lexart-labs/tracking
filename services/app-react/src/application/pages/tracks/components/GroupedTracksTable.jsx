import React, { useMemo, forwardRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'

function parseDurationToMinutes(duration) {
    if (!duration) return 0
    const parts = duration.split(':').map(Number)
    if (parts.length >= 3) return parts[0] * 60 + parts[1] + Math.round(parts[2] / 60)
    if (parts.length === 2) return parts[0] * 60 + parts[1]
    return 0
}

export function formatMinutes(minutes) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function formatDatetime(datetime) {
    if (!datetime) return '—'
    const [datePart, timePart] = String(datetime).split(' ')
    if (!datePart) return '—'
    const [y, m, d] = datePart.split('-')
    const time = timePart ? timePart.substring(0, 5) : ''
    return `${d}/${m}/${y}${time ? ` ${time}` : ''}`
}

const GroupedTracksTable = forwardRef(function GroupedTracksTable({ grouped, summary, loading, isAdminOrPm, onEdit }, ref) {

    const flatTracks = useMemo(() => grouped.flatMap((g) => g.tracks), [grouped])

    const groupSubtotals = useMemo(() => {
        const map = {}
        for (const project of summary?.projects || []) {
            if (!map[project.idProyecto]) {
                map[project.idProyecto] = []
            }
            map[project.idProyecto].push(project)
        }
        return map
    }, [summary])

    const rowGroupHeaderTemplate = (data) => (
        <span className="font-bold">{data.projectName}</span>
    )

    const rowGroupFooterTemplate = (data) => {
        const sub = groupSubtotals[data.idProyecto]
        if (!sub) return null
        const colCount = isAdminOrPm ? 10 : 9
        return (
            <td colSpan={colCount} className="text-right font-semibold bg-gray-50 pr-4">
                {sub.map((item) => (
                    <span key={`${item.currency}-${item.idProyecto}`} className="ml-4">
                        <span className="mr-2">Subtotal: {formatMinutes(item.minutes)}</span>
                        {item.currency} {Number(item.amount).toFixed(2)}
                    </span>
                ))}
            </td>
        )
    }

    const durationTemplate = (rowData) => formatMinutes(parseDurationToMinutes(rowData.duration))
    const startTemplate = (rowData) => formatDatetime(rowData.startTime)
    const endTemplate = (rowData) => formatDatetime(rowData.endTime)
    const costHourTemplate = (rowData) => `${rowData.currency} ${Number(rowData.costHour).toFixed(2)}`
    const trackCostTemplate = (rowData) => `${rowData.currency} ${Number(rowData.trackCost).toFixed(2)}`
    const actionsTemplate = (rowData) => (
        <Button
            icon="pi pi-pencil"
            rounded
            outlined
            size="small"
            onClick={() => onEdit(rowData)}
            aria-label="Edit"
            title="Edit"
        />
    )

    return (
        <DataTable
            ref={ref}
            value={flatTracks}
            loading={loading}
            rowGroupMode="subheader"
            groupRowsBy="idProyecto"
            sortField="idProyecto"
            sortOrder={1}
            rowGroupHeaderTemplate={rowGroupHeaderTemplate}
            rowGroupFooterTemplate={rowGroupFooterTemplate}
            emptyMessage="No tracks found for the selected filters."
            className="lexart-table"
            tableStyle={{ minWidth: '70rem' }}
        >
            {isAdminOrPm && <Column field="userName" header="User" sortable />}
            <Column field="clientName" header="Client" sortable />
            <Column field="projectName" header="Project" sortable />
            <Column field="name" header="Task" />
            <Column header="Start" body={startTemplate} />
            <Column header="End" body={endTemplate} />
            <Column header="Duration" body={durationTemplate} />
            <Column header="Cost/Hour" body={costHourTemplate} />
            <Column header="Cost" body={trackCostTemplate} />
            <Column header="" body={actionsTemplate} style={{ width: '4rem' }} />
        </DataTable>
    )
})

export default GroupedTracksTable
