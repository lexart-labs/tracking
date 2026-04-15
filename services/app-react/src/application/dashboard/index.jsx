import React, { useContext } from "react"
import { resizerContext } from "@/providers/iframe-resizer"
import BreadCrumbs from "@/components/shared/BreadCrumbs"
import { useDashboardData } from './hooks/useDashboardData'
import { useTrackActions } from './hooks/useTrackActions'
import HistorySection from './components/HistorySection'
import { CurrentTracksSection } from './components/CurrentTracksSection'
import './Dashboard.css'

export function Dashboard() {
    const { user } = useContext(resizerContext)
    const userRole = user?.userRole

    const { history, activeTracks, loading, refresh } = useDashboardData(userRole)
    const { startTrack, stopTrack, createManualTrack, submitting } = useTrackActions(user, refresh)

    const activeTrack = history.find(item => !item.endTime || item.endTime === '0000-00-00 00:00:00')
    const hasAnyActiveTrack = !!activeTrack
    const activeTrackId = activeTrack ? activeTrack.id : null

    return (
        <div className="dashboard-container p-4">
            <div className="flex justify-between items-center mb-4">
                <BreadCrumbs items={[{ label: 'Dashboard', url: '#/' }, { label: 'Current Tracks' }]} />
                {loading && <i className="pi pi-spin pi-spinner text-xl text-blue-500"></i>}
            </div>
            
            <div className="grid gap-6">
                {(userRole === 'admin' || userRole === 'pm' || userRole === 'developer') && (
                    <HistorySection 
                        history={history} 
                        onStart={startTrack}
                        onStop={stopTrack}
                        onSaveSelection={createManualTrack}
                        submitting={submitting}
                        hasAnyActiveTrack={hasAnyActiveTrack}
                        activeTrackId={activeTrackId}
                    />
                )}

                <CurrentTracksSection 
                    tracks={activeTracks} 
                    userRole={userRole} 
                />
            </div>

            {loading && !history.length && !activeTracks.length && (
                <div className="flex justify-center p-10">
                    <i className="pi pi-spin pi-spinner text-4xl text-blue-500"></i>
                </div>
            )}
        </div>
    )
}
