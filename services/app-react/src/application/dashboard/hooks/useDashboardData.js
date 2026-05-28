import { useState, useCallback, useEffect } from 'react'
import tracksService from '@/services/tracksService'

export function useDashboardData(userRole) {
    const [history, setHistory] = useState([])
    const [activeTracks, setActiveTracks] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const isAdminOrPm = userRole === 'admin' || userRole === 'pm'
    const isDeveloper = userRole === 'developer'

    const fetchHistory = useCallback(async () => {
        try {
            const data = await tracksService.getHistory()
            setHistory(data || [])
        } catch (err) {
            console.error('Error fetching history:', err)
            setError('Failed to load history')
        }
    }, [])

    const fetchActiveTracks = useCallback(async () => {
        if (!isAdminOrPm) return
        try {
            const data = await tracksService.getActiveTracks()
            setActiveTracks(data || [])
        } catch (err) {
            console.error('Error fetching active tracks:', err)
            setError('Failed to load active tracks')
        }
    }, [isAdminOrPm])

    const refresh = useCallback(async () => {
        setLoading(true)
        setError(null)
        await Promise.all([
            (isAdminOrPm || isDeveloper) ? fetchHistory() : Promise.resolve(),
            isAdminOrPm ? fetchActiveTracks() : Promise.resolve()
        ])
        setLoading(false)
    }, [isAdminOrPm, isDeveloper, fetchHistory, fetchActiveTracks])

    useEffect(() => {
        refresh()
    }, [refresh])

    return { history, activeTracks, loading, error, refresh }
}
