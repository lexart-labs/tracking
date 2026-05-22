import React, { useState, useMemo, useEffect, useContext } from 'react'
import { Button } from 'primereact/button'
import BreadCrumbs from '@/components/shared/BreadCrumbs'
import PageHeader from '@/components/shared/PageHeader'
import FilterBar from '../components/FilterBar'
import GroupedTracksTable from '../components/GroupedTracksTable'
import TracksSummary from '../components/TracksSummary'
import TrackEditDialog from '../components/TrackEditDialog'
import tracksService from '@/services/tracksService'
import projectService from '@/services/projectService'
import userService from '@/services/userService'
import clientService from '@/services/clientService'
import { exportToPDF, exportToCSV } from '../utils/exportTracks'
import { resizerContext } from '@/providers/iframe-resizer'

function toApiDatetime(date, isEnd = false) {
    if (!date) return null
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return isEnd ? `${y}-${m}-${d} 23:59:59` : `${y}-${m}-${d} 00:00:00`
}

function parseDurationToMinutes(duration) {
    if (!duration) return 0
    const parts = duration.split(':').map(Number)
    if (parts.length >= 3) return parts[0] * 60 + parts[1] + Math.round(parts[2] / 60)
    if (parts.length === 2) return parts[0] * 60 + parts[1]
    return 0
}

function getDefaultFilters() {
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - 7)
    return { from, to, idUser: null, idClient: null, idProject: null }
}

function TracksList() {
    const { user } = useContext(resizerContext)
    const userRole = user?.userRole
    const isAdminOrPm = userRole === 'admin' || userRole === 'pm'

    const [filters, setFilters] = useState(getDefaultFilters)
    const [tracks, setTracks] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [users, setUsers] = useState([])
    const [clients, setClients] = useState([])
    const [projects, setProjects] = useState([])
    const [editTrack, setEditTrack] = useState(null)
    const [dialogVisible, setDialogVisible] = useState(false)
    const [exporting, setExporting] = useState(false)

    useEffect(() => {
        if (!isAdminOrPm) return
        Promise.all([
            userService.getUsers(),
            clientService.getClients(),
            projectService.getProjects(),
        ])
            .then(([u, c, p]) => {
                setUsers(u || [])
                setClients(c || [])
                setProjects(p || [])
            })
            .catch(() => {})
    }, [isAdminOrPm])

    const fetchTracks = async () => {
        setLoading(true)
        setError('')
        try {
            const params = {
                startTime: toApiDatetime(filters.from, false),
                endTime: toApiDatetime(filters.to, true),
                idUser: filters.idUser || null,
                idClient: filters.idClient || null,
                idProject: filters.idProject || null,
            }
            const data = await tracksService.getTracks(params, userRole)
            setTracks(data || [])
        } catch (err) {
            setError('Failed to load tracks.')
            setTracks([])
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (track) => {
        setEditTrack(track)
        setDialogVisible(true)
    }

    const handleSaved = () => {
        setDialogVisible(false)
        fetchTracks()
    }

    const { grouped, grandTotalCost, grandTotalMinutes } = useMemo(() => {
        if (!tracks.length) return { grouped: [], grandTotalCost: 0, grandTotalMinutes: 0 }

        const groups = {}
        for (const track of tracks) {
            const key = track.idProyecto ?? 'unknown'
            if (!groups[key]) {
                groups[key] = {
                    idProyecto: track.idProyecto,
                    projectName: track.projectName,
                    tracks: [],
                    subtotalCost: 0,
                    subtotalMinutes: 0,
                }
            }
            groups[key].tracks.push(track)
            groups[key].subtotalCost += Number(track.trackCost) || 0
            groups[key].subtotalMinutes += parseDurationToMinutes(track.duration)
        }

        const grouped = Object.values(groups)
        const grandTotalCost = grouped.reduce((sum, g) => sum + g.subtotalCost, 0)
        const grandTotalMinutes = grouped.reduce((sum, g) => sum + g.subtotalMinutes, 0)

        return { grouped, grandTotalCost, grandTotalMinutes }
    }, [tracks])

    if (userRole === 'client') {
        return (
            <div className="p-4">
                <BreadCrumbs items={[{ label: 'Tracks' }]} />
                <p className="text-red-500 mt-4">Access Denied</p>
            </div>
        )
    }

    return (
        <div className="p-4 lg:p-10 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            <BreadCrumbs items={[{ label: 'Tracks' }]} />
            <PageHeader title="Tracks" description="Record and monitor your daily working hours" />

            <div className="no-print">
                <FilterBar
                    filters={filters}
                    onChange={setFilters}
                    onApply={fetchTracks}
                    users={users}
                    clients={clients}
                    projects={projects}
                    isAdminOrPm={isAdminOrPm}
                    loading={loading}
                />
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            {grouped.length > 0 && (
                <div className="flex gap-2 justify-end mb-3 no-print">
                    <Button
                        label="CSV"
                        icon={exporting === 'csv' ? 'pi pi-spin pi-spinner' : 'pi pi-file'}
                        size="small"
                        severity="secondary"
                        outlined
                        disabled={!!exporting}
                        onClick={async () => {
                            setExporting('csv')
                            try {
                                await exportToCSV(grouped, isAdminOrPm)
                            } catch (e) {
                                console.error('CSV export error:', e)
                            } finally {
                                setExporting(false)
                            }
                        }}
                    />
                    <Button
                        label="PDF"
                        icon={exporting === 'pdf' ? 'pi pi-spin pi-spinner' : 'pi pi-file-pdf'}
                        size="small"
                        severity="danger"
                        outlined
                        disabled={!!exporting}
                        onClick={() => {
                            setExporting('pdf')
                            try {
                                exportToPDF(grouped, isAdminOrPm, filters)
                            } catch (e) {
                                console.error('PDF export error:', e)
                            } finally {
                                setExporting(false)
                            }
                        }}
                    />
                </div>
            )}

            <GroupedTracksTable
                grouped={grouped}
                loading={loading}
                isAdminOrPm={isAdminOrPm}
                onEdit={handleEdit}
            />

            <TracksSummary grouped={grouped} />

            <TrackEditDialog
                visible={dialogVisible}
                track={editTrack}
                onHide={() => setDialogVisible(false)}
                onSaved={handleSaved}
            />
        </div>
    )
}

export default TracksList
