import React, { useState, useEffect, useCallback } from 'react'
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'
import FilterBar from '../components/FilterBar'
import TasksTable from '../components/TasksTable'
import TaskFormDialog from '../components/TaskFormDialog'
import ProjectCreateDialog from '../components/ProjectCreateDialog'
import tasksService from '@/services/tasksService'
import tracksService from '@/services/tracksService'
import userService from '@/services/userService'
import clientService from '@/services/clientService'
import projectService from '@/services/projectService'
import { resizerContext } from '@/providers/iframe-resizer'
import sessionStore from '@/stores/session'

// Main Tasks List Component
export default function TasksList() {
    const { refreshCounter } = React.useContext(resizerContext)
    const [tasks, setTasks] = useState([])
    const [users, setUsers] = useState([])
    const [projects, setProjects] = useState([])
    const [clients, setClients] = useState([])
    const [loading, setLoading] = useState(false)
    const [filters, setFilters] = useState({ status: 'active', projectId: null, progress: null })
    const [taskDialogVisible, setTaskDialogVisible] = useState(false)
    const [projectDialogVisible, setProjectDialogVisible] = useState(false)
    const [selectedTask, setSelectedTask] = useState(null)
    const [activeTrack, setActiveTrack] = useState(null)
    const toast = React.useRef(null)

    const user = sessionStore(state => state.user)
    const isAdminOrPm = user?.userRole === 'admin' || user?.userRole === 'pm' || user?.isAdmin === 'true' || user?.isAdmin === true

    const loadActiveTrack = useCallback(async () => {
        try {
            const track = await tracksService.getCurrentUserLastTrack()
            const isRunning = track && (!track.endTime || track.endTime === '0000-00-00 00:00:00' || track.endTime === '' || track.endTime === null);
            if (isRunning) {
                setActiveTrack(track)
            } else {
                setActiveTrack(null)
            }
        } catch (error) {
            console.error('Failed to load active track', error)
        }
    }, [])

    const loadData = useCallback(async () => {
        setLoading(true)
        try {
            let tasksData
            if (filters.projectId) {
                tasksData = await tasksService.getByProject(filters.projectId)
            } else {
                tasksData = isAdminOrPm 
                    ? await tasksService.getAll(filters)
                    : await tasksService.getCurrentUserTasks(filters)
            }
            
            // Defensive: Ensure we only set an array to the state
            const tasksArray = Array.isArray(tasksData) ? tasksData : (tasksData?.task || tasksData?.data || [])
            setTasks(tasksArray)
            await loadActiveTrack()
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to load tasks' })
        } finally {
            setLoading(false)
        }
    }, [filters, isAdminOrPm, loadActiveTrack])

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
    }, [loadData, refreshCounter])

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

    const handleTrackingToggle = async (task) => {
        const getFormattedDate = () => {
            const now = new Date()
            return now.getFullYear() + '-' + 
                String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                String(now.getDate()).padStart(2, '0') + ' ' + 
                String(now.getHours()).padStart(2, '0') + ':' + 
                String(now.getMinutes()).padStart(2, '0') + ':' + 
                String(now.getSeconds()).padStart(2, '0')
        }

        try {
            const isTaskRunning = activeTrack && Number(activeTrack.idTask) === Number(task.id)

            if (isTaskRunning) {
                // Stop current track
                const { duracion, ...restOfTrack } = activeTrack
                const stopPayload = { ...restOfTrack, endTime: getFormattedDate() }
                const result = await tracksService.update(stopPayload, user?.userRole)
                
                // If update was successful, the track is no longer running
                setActiveTrack(null)
                toast.current.show({ severity: 'success', summary: 'Tracking', detail: 'Tracking stopped' })
            } else {
                // Stop any OTHER running track first to avoid duplicates in DB
                if (activeTrack) {
                    const { duracion, ...restOfTrack } = activeTrack
                    const stopPayload = { ...restOfTrack, endTime: getFormattedDate() }
                    await tracksService.update(stopPayload, user?.userRole)
                }

                // Start new track
                const startPayload = {
                    idTask: task.id,
                    idProyecto: task.idProject, 
                    idUser: user.userId, 
                    name: task.name,
                    startTime: getFormattedDate(),
                    typeTrack: 'manual',
                    currency: 'USD'
                }
                const result = await tracksService.create(startPayload)
                
                // Update state immediately with the new track from server response
                if (result && result.response && result.response[0]) {
                    setActiveTrack(result.response[0])
                } else {
                    // Fallback to reload if response is not as expected
                    await loadActiveTrack()
                }
                
                toast.current.show({ severity: 'success', summary: 'Tracking', detail: 'Tracking started' })
            }
            
            // Notify parent to update header timer
            window.parent.postMessage({ action: 'refresh-timer' }, '*')
            
            // Final sync of data
            await loadData()
        } catch (error) {
            console.error('Tracking toggle error:', error)
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to toggle tracking' })
            // Ensure we sync state on error too
            await loadActiveTrack()
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
        <div className="p-4 lg:p-10 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            <Toast ref={toast} />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-gray-100 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tasks</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Manage and track your project assignments</p>
                </div>
                <Button 
                    label="New Task" 
                    icon="pi pi-plus" 
                    className="p-button-primary rounded-xl px-8 h-[46px] shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                    onClick={() => { setSelectedTask(null); setTaskDialogVisible(true); }}
                />
            </div>

            <FilterBar 
                filters={filters} 
                projects={projects}
                onFilterChange={(name, value) => setFilters({ ...filters, [name]: value })}
                onApply={loadData}
                loading={loading}
            />

            <TasksTable 
                key={`tasks-table-${activeTrack?.idTask || 'none'}-${tasks.length}`}
                tasks={tasks} 
                loading={loading}
                activeTrackId={activeTrack?.idTask}
                hasActiveTrack={!!activeTrack}
                onEdit={(task) => { setSelectedTask(task); setTaskDialogVisible(true); }}
                onDelete={handleDeleteTask}
                onTrackingToggle={handleTrackingToggle}
            />

            <TaskFormDialog 
                key={`task-form-${taskDialogVisible}-${selectedTask?.id || 'new'}`}
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
