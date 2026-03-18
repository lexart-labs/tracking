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
        <div className="flex flex-wrap gap-4 items-end mb-6">
            <FloatLabel>
                <Calendar
                    inputId="tracks-from"
                    value={filters.from}
                    onChange={(e) => onChange({ ...filters, from: e.value })}
                    dateFormat="dd/mm/yy"
                    showIcon
                />
                <label htmlFor="tracks-from">From</label>
            </FloatLabel>

            <FloatLabel>
                <Calendar
                    inputId="tracks-to"
                    value={filters.to}
                    onChange={(e) => onChange({ ...filters, to: e.value })}
                    dateFormat="dd/mm/yy"
                    showIcon
                    minDate={filters.from || undefined}
                    maxDate={maxToDate || undefined}
                />
                <label htmlFor="tracks-to">To</label>
            </FloatLabel>

            {isAdminOrPm && (
                <>
                    <FloatLabel>
                        <Dropdown
                            inputId="tracks-client"
                            value={filters.idClient}
                            options={clients}
                            optionLabel="name"
                            optionValue="id"
                            onChange={(e) => onChange({ ...filters, idClient: e.value })}
                            showClear
                            placeholder=" "
                            style={{ minWidth: '12rem' }}
                        />
                        <label htmlFor="tracks-client">Client</label>
                    </FloatLabel>

                    <FloatLabel>
                        <Dropdown
                            inputId="tracks-user"
                            value={filters.idUser}
                            options={users}
                            optionLabel="name"
                            optionValue="id"
                            onChange={(e) => onChange({ ...filters, idUser: e.value })}
                            showClear
                            placeholder=" "
                            style={{ minWidth: '12rem' }}
                        />
                        <label htmlFor="tracks-user">User</label>
                    </FloatLabel>

                    <FloatLabel>
                        <Dropdown
                            inputId="tracks-project"
                            value={filters.idProject}
                            options={projects}
                            optionLabel="name"
                            optionValue="id"
                            onChange={(e) => onChange({ ...filters, idProject: e.value })}
                            showClear
                            placeholder=" "
                            style={{ minWidth: '12rem' }}
                        />
                        <label htmlFor="tracks-project">Project</label>
                    </FloatLabel>
                </>
            )}

            <div className="flex flex-col gap-1">
                {rangeError && <span className="text-red-500 text-sm">{rangeError}</span>}
                <Button
                    label="Apply"
                    icon="pi pi-search"
                    onClick={onApply}
                    disabled={isApplyDisabled}
                    loading={loading}
                />
            </div>
        </div>
    )
}

export default FilterBar
