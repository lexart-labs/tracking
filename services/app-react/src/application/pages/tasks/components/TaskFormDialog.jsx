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
        idProyecto: '',
        name: '',
        duration: 0,
        startDate: null,
        endDate: null,
        progress: 'To-do',
        assignees: []
    })

    const progressOptions = [
        { label: 'To-do', value: 'To-do' },
        { label: 'In-Progress', value: 'In-Progress' },
        { label: 'In-Review', value: 'In-Review' },
        { label: 'Done', value: 'Done' }
    ]

    useEffect(() => {
        if (task) {
            setFormData({
                ...task,
                startDate: task.startDate ? new Date(task.startDate) : null,
                endDate: task.endDate ? new Date(task.endDate) : null,
                assignees: task.assignees || []
            })
        } else {
            setFormData({
                idProyecto: '',
                name: '',
                duration: 0,
                startDate: null,
                endDate: null,
                progress: 'To-do',
                assignees: []
            })
        }
    }, [task, visible])

    const handleAssigneeToggle = (user) => {
        const isAssigned = formData.assignees.some(a => a.id === user.id)
        let updatedAssignees
        if (isAssigned) {
            updatedAssignees = formData.assignees.filter(a => a.id !== user.id)
        } else {
            updatedAssignees = [...formData.assignees, user]
        }
        setFormData({ ...formData, assignees: updatedAssignees })
    }

    const assigneeCheckboxTemplate = (rowData) => {
        return (
            <Checkbox
                checked={formData.assignees.some(a => a.id === rowData.id)}
                onChange={() => handleAssigneeToggle(rowData)}
            />
        )
    }

    const footer = (
        <div>
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={onHide} />
            <Button label="Save" icon="pi pi-check" onClick={() => onSave(formData)} />
        </div>
    )

    return (
        <Dialog
            header={task ? "Edit Task" : "New Task"}
            visible={visible}
            style={{ width: '600px' }}
            footer={footer}
            onHide={onHide}
            className="p-fluid"
        >
            <div className="grid">
                <div className="col-12 field">
                    <label htmlFor="project" className="font-bold">Project *</label>
                    <div className="flex gap-2">
                        <Dropdown
                            id="project"
                            value={formData.idProyecto}
                            options={projects}
                            optionLabel="name"
                            optionValue="id"
                            onChange={(e) => setFormData({ ...formData, idProyecto: e.value })}
                            placeholder="Select Project"
                            filter
                        />
                        {canCreateProject && (
                            <Button
                                icon="pi pi-plus"
                                className="p-button-outlined"
                                onClick={onCreateProject}
                                tooltip="New Project"
                                style={{ width: 'auto' }}
                            />
                        )}
                    </div>
                </div>

                <div className="col-12 field">
                    <label htmlFor="name" className="font-bold">Task Name *</label>
                    <InputText
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="What are you working on?"
                    />
                </div>

                <div className="col-4 field">
                    <label htmlFor="duration" className="font-bold">Duration (hrs)</label>
                    <InputNumber
                        id="duration"
                        value={formData.duration}
                        onValueChange={(e) => setFormData({ ...formData, duration: e.value })}
                        min={0}
                    />
                </div>

                <div className="col-8 field">
                    <label htmlFor="progress" className="font-bold">Progress</label>
                    <Dropdown
                        id="progress"
                        value={formData.progress}
                        options={progressOptions}
                        onChange={(e) => setFormData({ ...formData, progress: e.value })}
                    />
                </div>

                <div className="col-6 field">
                    <label htmlFor="startDate" className="font-bold">Start Date</label>
                    <Calendar
                        id="startDate"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.value })}
                        dateFormat="dd/mm/yy"
                        showIcon
                    />
                </div>

                <div className="col-6 field">
                    <label htmlFor="endDate" className="font-bold">End Date</label>
                    <Calendar
                        id="endDate"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.value })}
                        dateFormat="dd/mm/yy"
                        showIcon
                    />
                </div>

                <div className="col-12 mt-4">
                    <label className="font-bold mb-2 block">Assign Users</label>
                    <DataTable
                        value={users}
                        scrollable
                        scrollHeight="200px"
                        className="border rounded overflow-hidden"
                    >
                        <Column body={assigneeCheckboxTemplate} style={{ width: '3rem' }} />
                        <Column field="name" header="Name" />
                    </DataTable>
                </div>
            </div>
        </Dialog>
    )
}
