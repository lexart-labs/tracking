import React, { useState, useEffect, useCallback } from 'react'
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'
import FilterBar from '../components/FilterBar'
import TasksTable from '../components/TasksTable'
import TaskFormDialog from '../components/TaskFormDialog'
import ProjectCreateDialog from '../components/ProjectCreateDialog'
import tasksService from '@/services/tasksService'
import userService from '@/services/userService'
import clientService from '@/services/clientService'
import projectService from '@/services/projectService'
import sessionStore from '@/stores/session'

export default function TasksList() {
    const [tasks, setTasks] = useState([])
    const [users, setUsers] = useState([])
    const [projects, setProjects] = useState([])
    const [clients, setClients] = useState([])
    const [loading, setLoading] = useState(false)
    const [filters, setFilters] = useState({ status: 'active' })
    const [taskDialogVisible, setTaskDialogVisible] = useState(false)
    const [projectDialogVisible, setProjectDialogVisible] = useState(false)
    const [selectedTask, setSelectedTask] = useState(null)
    const toast = React.useRef(null)

    const session = sessionStore(state => state.session)
    const isAdminOrPm = session?.userRole === 'admin' || session?.userRole === 'pm'

    const loadData = useCallback(async () => {
        setLoading(true)
        try {
            const tasksData = isAdminOrPm 
                ? await tasksService.getAll(filters)
                : await tasksService.getCurrentUserTasks(filters)
            setTasks(tasksData)
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to load tasks' })
        } finally {
            setLoading(false)
        }
    }, [filters, isAdminOrPm])

    const loadMetadata = async () => {
        try {
            const [usersData, projectsData, clientsData] = await Promise.all([
                userService.getUsers(),
                projectService.getAll(),
                isAdminOrPm ? clientService.getClients() : Promise.resolve([])
            ])
            setUsers(usersData)
            setProjects(projectsData)
            setClients(clientsData)
        } catch (error) {
            console.error('Failed to load metadata', error)
        }
    }

    useEffect(() => {
        loadData()
        loadMetadata()
    }, [loadData])

    const handleSaveTask = async (taskData) => {
        try {
            if (taskData.id) {
                await tasksService.update(taskData)
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'Task updated' })
            } else {
                await tasksService.create(taskData)
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'Task created' })
            }
            setTaskDialogVisible(false)
            loadData()
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to save task' })
        }
    }

    const handleDeleteTask = async (task) => {
        try {
            if (task.isActive === 1) {
                await tasksService.delete(task.id)
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'Task deactivated' })
            } else {
                await tasksService.undelete(task.id)
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'Task activated' })
            }
            loadData()
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Action failed' })
        }
    }

    const handleSaveProject = async (projectData) => {
        try {
            await projectService.create(projectData)
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Project created' })
            setProjectDialogVisible(false)
            loadMetadata() // Refresh projects list
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to create project' })
        }
    }

    return (
        <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
            <Toast ref={toast} />
            
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Tasks</h1>
                    <p className="text-gray-500 mt-1">Manage projects, tasks, and assignments.</p>
                </div>
                <Button 
                    label="New Task" 
                    icon="pi pi-plus" 
                    className="p-button-primary rounded-xl px-6 shadow-md"
                    onClick={() => { setSelectedTask(null); setTaskDialogVisible(true); }}
                />
            </div>

            <FilterBar 
                filters={filters} 
                onFilterChange={(name, value) => setFilters({ ...filters, [name]: value })}
                onApply={loadData}
                loading={loading}
            />

            <TasksTable 
                tasks={tasks} 
                loading={loading}
                onEdit={(task) => { setSelectedTask(task); setTaskDialogVisible(true); }}
                onDelete={handleDeleteTask}
                onTrackingToggle={(task) => console.log('Toggle tracking for', task.id)}
            />

            <TaskFormDialog 
                visible={taskDialogVisible}
                onHide={() => setTaskDialogVisible(false)}
                task={selectedTask}
                onSave={handleSaveTask}
                projects={projects}
                users={users}
                canCreateProject={isAdminOrPm}
                onCreateProject={() => setProjectDialogVisible(true)}
            />

            <ProjectCreateDialog 
                visible={projectDialogVisible}
                onHide={() => setProjectDialogVisible(false)}
                onSave={handleSaveProject}
                clients={clients}
            />
        </div>
    )
}
