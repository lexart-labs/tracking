import React, { useContext, useEffect } from "react"
import { resizerContext } from "@/providers/iframe-resizer"
// Nota: Quité BreadCrumbs si no se usa, o puedes cambiar PageHeader por BreadCrumbs si te equivocaste de nombre.
import PageHeader from "@/components/shared/PageHeader" // <-- FALTABA ESTE IMPORT
import { useDashboardData } from './hooks/useDashboardData'
import { useTrackActions } from './hooks/useTrackActions'
import HistorySection from './components/HistorySection'
import { CurrentTracksSection } from './components/CurrentTracksSection'
import ErrorBoundary from "@/components/shared/ErrorBoundary"
import HistorySkeleton from "./components/HistorySkeleton"
import './Dashboard.css'

export function Dashboard() {
    const { user, refreshCounter } = useContext(resizerContext)
    const userRole = user?.userRole

    const { history, activeTracks, loading, refresh } = useDashboardData(userRole)
    const { startTrack, stopTrack, createManualTrack, submitting } = useTrackActions(user, refresh)

    // Es mejor importar useEffect directamente para mantener el código limpio
    useEffect(() => {
        if (refreshCounter > 0) {
            refresh()
        }
    }, [refreshCounter, refresh])

    const activeTrack = history.find(item => !item.endTime || item.endTime === '0000-00-00 00:00:00')
    const hasAnyActiveTrack = !!activeTrack
    const activeTrackId = activeTrack ? activeTrack.id : null

    return (
        <div className="p-4 lg:p-10 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            <PageHeader title="Dashboard" description="Monitor your daily working hours" />
            <div className="dashboard-container p-4" data-testid="dashboard-container">
                <div className="grid gap-6">
                    <ErrorBoundary>
                        {loading && !history.length ? (
                            <HistorySkeleton />
                        ) : (
                            (userRole === 'admin' || userRole === 'pm' || userRole === 'developer') && (
                                <HistorySection 
                                    history={history} 
                                    onStart={startTrack}
                                    onStop={stopTrack}
                                    onSaveSelection={createManualTrack}
                                    submitting={submitting}
                                    hasAnyActiveTrack={hasAnyActiveTrack}
                                    activeTrackId={activeTrackId}
                                    data-testid="history-section"
                                />
                            )
                        )}
                    </ErrorBoundary>

                    <ErrorBoundary>
                        <CurrentTracksSection 
                            tracks={activeTracks} 
                            userRole={userRole} 
                            data-testid="current-tracks-section"
                        />
                    </ErrorBoundary>
                </div>
            </div>
        </div>
    )
}
