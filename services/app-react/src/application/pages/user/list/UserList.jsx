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
    const [globalFilter, setGlobalFilter] = useState('');

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

    return (
        <div className="p-4 lg:p-10 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            <PageHeader 
                title="Users" 
                description="Manage and edit collaborator accounts and system permissions" 
                buttonLabel="New User" 
                onButtonClick={() => navigate('/user/NEW')}
            />

            <div className="card">
                <DataTable
                    value={users}
                    paginator
                    rows={10}
                    dataKey="id"
                    loading={loading}
                    globalFilter={globalFilter}
                    emptyMessage="No users found."
                    className="p-datatable-sm w-full"
                    stripedRows
                    filterDisplay="row"
                >
                    <Column body={imageBodyTemplate} header="" style={{ width: '5rem' }}></Column>
                    <Column field="id" header="ID" sortable filter filterPlaceholder="Search by ID" style={{ width: '10%' }}></Column>
                    <Column field="name" header="Name" body={nameBodyTemplate} sortable filter filterPlaceholder="Search by Name" style={{ width: '25%' }}></Column>
                    <Column field="email" header="Email" sortable filter filterPlaceholder="Search by Email" style={{ width: '30%' }}></Column>
                    <Column field="role" header="Role" sortable filter filterPlaceholder="Search by Role" style={{ width: '20%' }}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }}></Column>
                </DataTable>
            </div>
        </div>
    );
}
