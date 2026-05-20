import React, { useState, useEffect } from 'react'
import { Dialog } from 'primereact/dialog'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import { InputNumber } from 'primereact/inputnumber'
import { Calendar } from 'primereact/calendar'
import { Button } from 'primereact/button'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Checkbox } from 'primereact/checkbox'

export default function TaskFormDialog({ visible, onHide, task, onSave, projects, users, canCreateProject, onCreateProject }) {
    const [formData, setFormData] = useState({
        idProject: '',
        name: '',
        description: '',
        duration: 0,
        startDate: null,
        endDate: null,
        status: 'To-do',
        assignees: []
    })

    const statusOptions = [
        { label: 'To-do', value: 'To-do' },
        { label: 'In-Progress', value: 'In-Progress' },
        { label: 'In-Review', value: 'In-Review' },
        { label: 'Done', value: 'Done' }
    ]

    useEffect(() => {
        if (visible) {
            if (task) {
                const parsedAssignees = typeof task.users === 'string' 
                    ? JSON.parse(task.users) 
                    : (Array.isArray(task.users) ? task.users : (task.assignees || []));

                const assigneesWithId = parsedAssignees.map(item => {
                    const id = item.id ? Number(item.id) : (item.idUser ? Number(item.idUser) : null);
                    const matchingUser = users.find(u => Number(u.id) === id);
                    return matchingUser || { ...item, id };
                }).filter(item => item.id !== null);

                setFormData({
                    ...task,
                    idProject: task.idProject ? Number(task.idProject) : '',
                    description: task.description || '',
                    status: task.status || 'To-do',
                    duration: parseFloat(task.duration) || 0,
                    startDate: task.startDate ? new Date(task.startDate) : null,
                    endDate: task.endDate ? new Date(task.endDate) : null,
                    assignees: assigneesWithId
                })
            } else {
                setFormData({
                    idProject: '',
                    name: '',
                    description: '',
                    duration: 0,
                    startDate: null,
                    endDate: null,
                    status: 'To-do',
                    assignees: []
                })
            }
        }
    }, [visible, task, users])

    const footer = (
        <div className="flex justify-end gap-3 p-4 bg-gray-50/50 rounded-b-xl border-t border-gray-100">
            <Button 
                label="Cancel" 
                icon="pi pi-times" 
                className="p-button-text p-button-secondary font-semibold" 
                onClick={onHide} 
            />
            <Button 
                label="Save" 
                icon="pi pi-check" 
                className="p-button-primary px-6 shadow-md shadow-primary/20"
                onClick={() => onSave(formData)} 
            />
        </div>
    )

    return (
        <Dialog
            header={task ? "Edit Task" : "New Task"}
            visible={visible}
            style={{ width: '700px' }}
            footer={footer}
            onHide={onHide}
            className="lexart-dialog"
            breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        >
            <div className="flex flex-col gap-6 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="project" className="text-sm font-bold text-gray-600 uppercase tracking-wider">Project *</label>
                        <div className="flex gap-2">
                            <Dropdown
                                inputId="project"
                                value={formData.idProject}
                                options={projects}
                                optionLabel="name"
                                optionValue="id"
                                onChange={(e) => setFormData({ ...formData, idProject: e.value })}
                                placeholder="Select Project"
                                filter
                                disabled={!!task}
                                className="w-full border-gray-200"
                            />
                            {!task && canCreateProject && (
                                <Button
                                    icon="pi pi-plus"
                                    className="p-button-outlined p-button-primary"
                                    onClick={onCreateProject}
                                    tooltip="New Project"
                                />
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="name" className="text-sm font-bold text-gray-600 uppercase tracking-wider">Task Name *</label>
                        <InputText
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="What are you working on?"
                            className="border-gray-200"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="description" className="text-sm font-bold text-gray-600 uppercase tracking-wider">Description</label>
                        <InputText
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description"
                            className="border-gray-200"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="status" className="text-sm font-bold text-gray-600 uppercase tracking-wider">Progress</label>
                        <Dropdown
                            inputId="status"
                            value={formData.status}
                            options={statusOptions}
                            onChange={(e) => setFormData({ ...formData, status: e.value })}
                            className="border-gray-200"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="duration" className="text-sm font-bold text-gray-600 uppercase tracking-wider">Duration (hrs)</label>
                        <InputNumber
                            inputId="duration"
                            value={formData.duration}
                            onValueChange={(e) => setFormData({ ...formData, duration: e.value })}
                            min={0}
                            mode="decimal"
                            minFractionDigits={1}
                            maxFractionDigits={2}
                            className="border-gray-200"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="startDate" className="text-sm font-bold text-gray-600 uppercase tracking-wider">Start Date</label>
                            <Calendar
                                inputId="startDate"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.value })}
                                dateFormat="dd/mm/yy"
                                showIcon
                                className="border-gray-200"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="endDate" className="text-sm font-bold text-gray-600 uppercase tracking-wider">End Date</label>
                            <Calendar
                                inputId="endDate"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.value })}
                                dateFormat="dd/mm/yy"
                                showIcon
                                className="border-gray-200"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                    <label className="text-sm font-bold text-gray-600 uppercase tracking-wider block mb-2">Assign Users</label>
                    <DataTable
                        value={users}
                        selection={formData.assignees}
                        onSelectionChange={(e) => {
                            console.log('✅ Selection changed. New count:', e.value.length);
                            setFormData(prev => ({ ...prev, assignees: e.value }));
                        }}
                        selectionMode="multiple"
                        dataKey="id"
                        scrollable
                        scrollHeight="200px"
                        className="border border-gray-100 rounded-xl overflow-hidden shadow-sm"
                        rowClassName={() => 'hover:bg-gray-50/50 transition-colors'}
                    >
                        <Column selectionMode="multiple" style={{ width: '4rem' }} align="center" />
                        <Column field="name" header="Name" className="font-medium text-gray-700" />
                    </DataTable>
                </div>
            </div>
        </Dialog>
    )
}
