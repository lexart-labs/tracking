import React from 'react'
import { Dropdown } from 'primereact/dropdown'
import { Button } from 'primereact/button'

export default function FilterBar({ filters, onFilterChange, onApply, loading }) {
    const statusOptions = [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'All', value: 'all' }
    ]

    return (
        <div className="flex flex-wrap gap-4 items-end mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Status</label>
                <Dropdown
                    value={filters.status}
                    options={statusOptions}
                    onChange={(e) => onFilterChange('status', e.value)}
                    placeholder="Select Status"
                    className="h-[42px] flex items-center"
                    style={{ minWidth: '12rem' }}
                />
            </div>

            <div className="flex flex-col gap-2 ml-auto">
                <Button
                    label="Apply Filters"
                    icon="pi pi-search"
                    onClick={onApply}
                    loading={loading}
                    className="p-button-primary rounded-lg px-6 h-[42px]"
                />
            </div>
        </div>
    )
}
