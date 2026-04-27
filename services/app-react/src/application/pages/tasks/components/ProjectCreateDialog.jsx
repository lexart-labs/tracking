import React, { useState } from 'react'
import { Dialog } from 'primereact/dialog'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'

export default function ProjectCreateDialog({ visible, onHide, onSave, clients }) {
    const [formData, setFormData] = useState({
        idClient: '',
        name: ''
    })

    const footer = (
        <div>
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={onHide} />
            <Button label="Create" icon="pi pi-check" onClick={() => onSave(formData)} />
        </div>
    )

    return (
        <Dialog
            header="New Project"
            visible={visible}
            style={{ width: '400px' }}
            footer={footer}
            onHide={onHide}
            className="p-fluid"
        >
            <div className="grid">
                <div className="col-12 field">
                    <label htmlFor="client" className="font-bold">Client *</label>
                    <Dropdown
                        id="client"
                        value={formData.idClient}
                        options={clients}
                        optionLabel="name"
                        optionValue="id"
                        onChange={(e) => setFormData({ ...formData, idClient: e.value })}
                        placeholder="Select Client"
                        filter
                    />
                </div>
                <div className="col-12 field">
                    <label htmlFor="projectName" className="font-bold">Project Name *</label>
                    <InputText
                        id="projectName"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Project title"
                    />
                </div>
            </div>
        </Dialog>
    )
}
