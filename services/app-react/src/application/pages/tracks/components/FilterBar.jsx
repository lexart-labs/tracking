import React, { useMemo } from 'react'
import { Calendar } from 'primereact/calendar'
import { Dropdown } from 'primereact/dropdown'
import { Button } from 'primereact/button'
import { FloatLabel } from 'primereact/floatlabel'

function FilterBar({ filters, onChange, onApply, users, clients, projects, isAdminOrPm, loading }) {
    const maxToDate = useMemo(() => {
        if (!filters.from) return null
        const d = new Date(filters.from)
        d.setMonth(d.getMonth() + 1)
        return d
    }, [filters.from])

    const rangeError = useMemo(() => {
        if (filters.from && filters.to && maxToDate && filters.to > maxToDate) {
            return 'Date range cannot exceed one month.'
        }
        return null
    }, [filters.from, filters.to, maxToDate])

    const isApplyDisabled = loading || !!rangeError || !filters.from || !filters.to

    return (
        <div className="flex flex-wrap gap-4 items-end mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-col gap-2">
                <label htmlFor="tracks-from" className="text-xs font-bold text-gray-500 uppercase ml-1">From</label>
                <Calendar
                    inputId="tracks-from"
                    value={filters.from}
                    onChange={(e) => onChange({ ...filters, from: e.value })}
                    dateFormat="dd/mm/yy"
                    showIcon
                    className="h-[42px]"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="tracks-to" className="text-xs font-bold text-gray-500 uppercase ml-1">To</label>
                <Calendar
                    inputId="tracks-to"
                    value={filters.to}
                    onChange={(e) => onChange({ ...filters, to: e.value })}
                    dateFormat="dd/mm/yy"
                    showIcon
                    className="h-[42px]"
                    minDate={filters.from || undefined}
                    maxDate={maxToDate || undefined}
                />
            </div>

            {isAdminOrPm && (
                <>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="tracks-client" className="text-xs font-bold text-gray-500 uppercase ml-1">Client</label>
                        <Dropdown
                            inputId="tracks-client"
                            value={filters.idClient}
                            options={clients}
                            optionLabel="name"
                            optionValue="id"
                            onChange={(e) => onChange({ ...filters, idClient: e.value })}
                            showClear
                            filter
                            filterBy="name"
                            placeholder="Select Client"
                            style={{ minWidth: '12rem' }}
                            className="h-[42px] flex items-center"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="tracks-user" className="text-xs font-bold text-gray-500 uppercase ml-1">User</label>
                        <Dropdown
                            inputId="tracks-user"
                            value={filters.idUser}
                            options={users}
                            optionLabel="name"
                            optionValue="id"
                            onChange={(e) => onChange({ ...filters, idUser: e.value })}
                            showClear
                            filter
                            filterBy="name"
                            placeholder="Select User"
                            style={{ minWidth: '12rem' }}
                            className="h-[42px] flex items-center"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="tracks-project" className="text-xs font-bold text-gray-500 uppercase ml-1">Project</label>
                        <Dropdown
                            inputId="tracks-project"
                            value={filters.idProject}
                            options={projects}
                            optionLabel="name"
                            optionValue="id"
                            onChange={(e) => onChange({ ...filters, idProject: e.value })}
                            showClear
                            filter
                            filterBy="name"
                            placeholder="Select Project"
                            style={{ minWidth: '12rem' }}
                            className="h-[42px] flex items-center"
                        />
                    </div>
                </>
            )}

            <div className="flex flex-col gap-2 ml-auto">
                {rangeError && <span className="text-red-500 text-[10px] font-semibold absolute -mt-4">{rangeError}</span>}
                <Button
                    label="Apply Filters"
                    icon="pi pi-search"
                    onClick={onApply}
                    disabled={isApplyDisabled}
                    loading={loading}
                    className="p-button-primary rounded-lg px-6 h-[42px]"
                />
            </div>
        </div>
    )
}

export default FilterBar
