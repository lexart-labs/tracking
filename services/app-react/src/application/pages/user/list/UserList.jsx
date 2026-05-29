import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import sessionStore from '@/stores/session'
import { UserService, getPhotoUrl } from "@/services/userService"
import PageHeader from "@/components/shared/PageHeader"

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from "primereact/button"
import { Dropdown } from 'primereact/dropdown';

export function UserList() {
    const navigate = useNavigate();
    const userLogged = sessionStore.getState().user || {};
    const userService = new UserService();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('active'); // 'active', 'inactive', 'all'

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

    const handleToggleStatus = async (user) => {
        const isActive = !user.deleted_at && user.status !== 0;
        const confirmMessage = isActive
            ? `¿Estás seguro de que deseas deshabilitar a ${user.name}?`
            : `¿Estás seguro de que deseas habilitar a ${user.name}?`;

        if (!window.confirm(confirmMessage)) return;

        try {
            setLoading(true);
            if (isActive) {
                await userService.deleteUser(user.id);
            } else {
                await userService.undeleteUser(user.id);
            }
            await loadUsers();
        } catch (error) {
            console.error('Error toggling user status:', error);
            alert('Error al actualizar el estado del usuario');
        } finally {
            setLoading(false);
        }
    };

    const imageBodyTemplate = (rowData) => {
        const photoUrl = getPhotoUrl(rowData.photo);

        return (
            <img
                src={photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(rowData.name || 'User')}&background=random`}
                alt={rowData.name}
                className="w-10 h-10 object-cover rounded-full"
                onError={(e) => {
                    e.target.onerror = null;
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

    const statusBodyTemplate = (rowData) => {
        const isActive = !rowData.deleted_at && rowData.status !== 0;
        if (isActive) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                    <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-green-500"></span>
                    Activo
                </span>
            );
        }

        const dateStr = rowData.deleted_at ? new Date(rowData.deleted_at).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : '';

        return (
            <span 
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200 cursor-help"
                title={dateStr ? `Deshabilitado el: ${dateStr}` : 'Inactivo'}
            >
                <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-red-500"></span>
                Inactivo {dateStr && `(${dateStr.split(' ')[0]})`}
            </span>
        );
    };

    const actionBodyTemplate = (rowData) => {
        const isSelf = rowData.id === userLogged.id;
        const isActive = !rowData.deleted_at && rowData.status !== 0;
        const canManage = userLogged.userRole === 'admin' || userLogged.userRole === 'pm';

        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-pencil"
                    rounded
                    outlined
                    className="p-button-sm"
                    onClick={() => navigate(`/user/${rowData.id}`)}
                    aria-label="Edit"
                    tooltip="Editar usuario"
                />
                {canManage && (
                    <Button
                        icon={isActive ? "pi pi-user-minus" : "pi pi-user-plus"}
                        severity={isActive ? "danger" : "success"}
                        rounded
                        outlined
                        className="p-button-sm"
                        onClick={() => handleToggleStatus(rowData)}
                        disabled={isSelf}
                        title={isSelf ? "No puedes deshabilitar tu propia cuenta" : (isActive ? "Deshabilitar usuario" : "Habilitar usuario")}
                    />
                )}
            </div>
        );
    };

    // Front-end status filtering
    const filteredUsers = users.filter((u) => {
        const isActive = !u.deleted_at && u.status !== 0;
        if (statusFilter === 'active') return isActive;
        if (statusFilter === 'inactive') return !isActive;
        return true;
    });

    const statusFilterOptions = [
        { label: 'Activos', value: 'active' },
        { label: 'Inactivos', value: 'inactive' },
        { label: 'Todos', value: 'all' }
    ];

    return (
        <div className="p-4 lg:p-10 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            <PageHeader 
                title="Users" 
                description="Manage and edit collaborator accounts and system permissions" 
                buttonLabel="New User" 
                onButtonClick={() => navigate('/user/NEW')}
            />

            <div className="card">
                <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Filtrar por estado:</span>
                        <Dropdown
                            value={statusFilter}
                            options={statusFilterOptions}
                            onChange={(e) => setStatusFilter(e.value)}
                            className="w-48 text-sm"
                        />
                    </div>
                </div>

                <DataTable
                    value={filteredUsers}
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
                    <Column field="email" header="Email" sortable filter filterPlaceholder="Search by Email" style={{ width: '25%' }}></Column>
                    <Column field="role" header="Role" sortable filter filterPlaceholder="Search by Role" style={{ width: '15%' }}></Column>
                    <Column header="Status" body={statusBodyTemplate} style={{ width: '15%' }}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }}></Column>
                </DataTable>
            </div>
        </div>
    );
}
