import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import sessionStore from '@/stores/session'
import { UserService } from "@/services/userService"
import PageHeader from "@/components/shared/PageHeader"

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from "primereact/button"
import { InputText } from 'primereact/inputtext';

export function UserList() {
    const navigate = useNavigate();
    const userLogged = sessionStore.getState().user || {};
    const userService = new UserService();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [draftFilters, setDraftFilters] = useState({ id: '', name: '', email: '', role: '' });
    const [appliedFilters, setAppliedFilters] = useState({ id: '', name: '', email: '', role: '' });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await userService.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const imageBodyTemplate = (rowData) => {
        const photoUrl = rowData.photo ? import.meta.env.VITE_BASE_PHOTO + rowData.photo : null;

        return (
            <img
                src={photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(rowData.name || 'User')}&background=random`}
                alt={rowData.name}
                className="w-10 h-10 object-cover rounded-full"
                onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(rowData.name || 'User')}&background=random`;
                }}
            />
        );
    };

    const nameBodyTemplate = (rowData) => {
        if (userLogged.userRole === 'admin') {
            return (
                <Link to={`/user/${rowData.id}`} className="text-blue-500 hover:text-blue-700 underline">
                    {rowData.name}
                </Link>
            );
        }
        return <>{rowData.name}</>;
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <Button
                icon="pi pi-pencil"
                rounded
                outlined
                className="p-button-sm mr-2"
                onClick={() => navigate(`/user/${rowData.id}`)}
                aria-label="Edit"
            />
        );
    };

    const filteredUsers = users.filter((u) => {
        const idOk = !appliedFilters.id || String(u.id || '').toLowerCase().includes(appliedFilters.id.toLowerCase())
        const nameOk = !appliedFilters.name || String(u.name || '').toLowerCase().includes(appliedFilters.name.toLowerCase())
        const emailOk = !appliedFilters.email || String(u.email || '').toLowerCase().includes(appliedFilters.email.toLowerCase())
        const roleOk = !appliedFilters.role || String(u.role || '').toLowerCase().includes(appliedFilters.role.toLowerCase())
        return idOk && nameOk && emailOk && roleOk
    })

    const handleApplyFilters = () => setAppliedFilters({ ...draftFilters })
    const handleClearFilters = () => {
        const empty = { id: '', name: '', email: '', role: '' }
        setDraftFilters(empty)
        setAppliedFilters(empty)
    }

    return (
        <div className="p-4 lg:p-10 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            <PageHeader 
                title="Users" 
                description="Manage and edit collaborator accounts and system permissions" 
                buttonLabel="New User" 
                onButtonClick={() => navigate('/user/NEW')}
            />

            <div className="card">
                <div className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 items-end">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">ID</label>
                        <InputText value={draftFilters.id} onChange={(e) => setDraftFilters((p) => ({ ...p, id: e.target.value }))} placeholder="Search by ID" className="h-[42px]" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Name</label>
                        <InputText value={draftFilters.name} onChange={(e) => setDraftFilters((p) => ({ ...p, name: e.target.value }))} placeholder="Search by Name" className="h-[42px]" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email</label>
                        <InputText value={draftFilters.email} onChange={(e) => setDraftFilters((p) => ({ ...p, email: e.target.value }))} placeholder="Search by Email" className="h-[42px]" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Role</label>
                        <InputText value={draftFilters.role} onChange={(e) => setDraftFilters((p) => ({ ...p, role: e.target.value }))} placeholder="Search by Role" className="h-[42px]" />
                    </div>
                    <div className="flex gap-2 ml-auto">
                        <Button label="Apply" icon="pi pi-search" className="p-button-primary rounded-lg h-[42px] px-6" onClick={handleApplyFilters} />
                        <Button label="Clear" icon="pi pi-filter-slash" className="p-button-secondary p-button-outlined rounded-lg h-[42px] px-4" onClick={handleClearFilters} />
                    </div>
                </div>
                <DataTable
                    value={filteredUsers}
                    paginator
                    rows={10}
                    dataKey="id"
                    loading={loading}
                    emptyMessage="No users found."
                    className="p-datatable-sm w-full"
                    stripedRows
                >
                    <Column body={imageBodyTemplate} header="" style={{ width: '5rem' }}></Column>
                    <Column field="id" header="ID" sortable style={{ width: '10%' }}></Column>
                    <Column field="name" header="Name" body={nameBodyTemplate} sortable style={{ width: '25%' }}></Column>
                    <Column field="email" header="Email" sortable style={{ width: '30%' }}></Column>
                    <Column field="role" header="Role" sortable style={{ width: '20%' }}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }}></Column>
                </DataTable>
            </div>
        </div>
    );
}
