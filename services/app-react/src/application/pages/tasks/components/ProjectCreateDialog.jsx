import React, { useState } from 'react'
import { Dialog } from 'primereact/dialog'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'

export default function ProjectCreateDialog({ visible, onHide, onSave, clients }) {
    const [formData, setFormData] = useState({
        idClient: '',
        name: '',
        description: '',
        active: 1,
        duration: '0',
        presupuesto: 0
    })

    const footer = (
        <div className="flex justify-end gap-2">
            <Button label="Cancel" icon="pi pi-times" className="p-button-text p-button-secondary" onClick={onHide} />
            <Button label="Create Project" icon="pi pi-check" className="p-button-primary px-4" onClick={() => onSave(formData)} />
        </div>
    )

    return (
        <Dialog
            header="Create New Project"
            visible={visible}
            style={{ width: '450px' }}
            footer={footer}
            onHide={onHide}
            className="p-fluid"
            modal
        >
            <div className="flex flex-col gap-4 mt-2">
                <div className="field">
                    <label htmlFor="client" className="block text-sm font-semibold text-gray-700 mb-1">Client *</label>
                    <Dropdown
                        id="client"
                        value={formData.idClient}
                        options={clients}
                        optionLabel="name"
                        optionValue="id"
                        onChange={(e) => setFormData({ ...formData, idClient: e.value })}
                        placeholder="Select a client"
                        filter
                        className="rounded-lg"
                    />
                </div>
                <div className="field">
                    <label htmlFor="projectName" className="block text-sm font-semibold text-gray-700 mb-1">Project Name *</label>
                    <InputText
                        id="projectName"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Website Redesign"
                        className="rounded-lg"
                    />
                </div>
                <div className="field">
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
                    <InputText
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Brief project description"
                        className="rounded-lg"
                    />
                </div>
            </div>
        </Dialog>
    )
}
