import React from 'react'
import { Dropdown } from 'primereact/dropdown'
import { Button } from 'primereact/button'

export default function FilterBar({ filters, onFilterChange, onApply, loading, projects }) {
    const statusOptions = [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'All', value: 'all' }
    ]

    const progressOptions = [
        { label: 'To-do', value: 'To-do' },
        { label: 'In-Progress', value: 'In-Progress' },
        { label: 'In-Review', value: 'In-Review' },
        { label: 'Done', value: 'Done' }
    ]

    return (
        <div className="flex flex-wrap gap-4 items-end mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-wider">Project</label>
                <Dropdown
                    value={filters.projectId}
                    options={projects}
                    optionLabel="name"
                    optionValue="id"
                    onChange={(e) => onFilterChange('projectId', e.value)}
                    placeholder="Select Project"
                    filter
                    showClear
                    className="h-[42px] flex items-center border-gray-200"
                    style={{ minWidth: '15rem' }}
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-wider">Status</label>
                <Dropdown
                    value={filters.status}
                    options={statusOptions}
                    onChange={(e) => onFilterChange('status', e.value)}
                    placeholder="Active Projects"
                    className="h-[42px] flex items-center border-gray-200"
                    style={{ minWidth: '10rem' }}
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-wider">Progress</label>
                <Dropdown
                    value={filters.progress}
                    options={progressOptions}
                    onChange={(e) => onFilterChange('progress', e.value)}
                    placeholder="All Statuses"
                    showClear
                    className="h-[42px] flex items-center border-gray-200"
                    style={{ minWidth: '12rem' }}
                />
            </div>

            <div className="flex flex-col gap-2 ml-auto">
                <Button
                    label="Apply Filters"
                    icon="pi pi-search"
                    onClick={onApply}
                    loading={loading}
                    className="p-button-primary rounded-lg px-8 h-[42px] shadow-sm"
                />
            </div>
        </div>
    )
}
