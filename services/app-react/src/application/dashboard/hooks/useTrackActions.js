import { useState, useCallback } from 'react'
import tracksService from '@/services/tracksService'

export function useTrackActions(user, onRefresh) {
    const [submitting, setSubmitting] = useState(false)

    const toSQLFormat = (date) => {
        if (!date) return null
        const pad = (n) => String(n).padStart(2, '0')
        const y = date.getFullYear()
        const m = pad(date.getMonth() + 1)
        const d = pad(date.getDate())
        const h = pad(date.getHours())
        const mi = pad(date.getMinutes())
        const s = pad(date.getSeconds())
        return `${y}-${m}-${d} ${h}:${mi}:${s}`
    }

    const notifyParentToSyncTimer = () => {
        if (window.parent && window.parent.postMessage) {
            window.parent.postMessage({ action: 'refresh-timer' }, '*');
        }
    }

    const notifyParentToShowToast = (message, type = 'info') => {
        if (window.parent && window.parent.postMessage) {
            window.parent.postMessage({ action: 'show-toast', message, type }, '*');
        }
    }

    const startTrack = useCallback(async (item) => {
        setSubmitting(true)
        try {
            const payload = {
                idUser: user.userId,
                idTask: item.idTask,
                name: item.name || item.taskName,
                taskName: item.name || item.taskName,
                projectName: item.projectName,
                startTime: toSQLFormat(new Date()),
                idProyecto: item.projectId || item.idProyecto,
                typeTrack: item.typeTrack || 'manual',
                currency: item.currency || 'USD'
            }
            await tracksService.create(payload)
            if (onRefresh) onRefresh()
            notifyParentToSyncTimer()
        } catch (err) {
            console.error('Error starting track:', err)
            notifyParentToShowToast('Error al iniciar el track: ' + (err.response?.data?.message || err.message), 'error')
        } finally {
            setSubmitting(false)
        }
    }, [user, onRefresh])

    const stopTrack = useCallback(async (currentTrack) => {
        setSubmitting(true)
        try {
            const payload = {
                id: currentTrack.id,
                idUser: user.userId,
                startTime: currentTrack.startTime,
                endTime: toSQLFormat(new Date())
            }
            await tracksService.update(payload, user.userRole)
            if (onRefresh) onRefresh()
            notifyParentToSyncTimer()
        } catch (err) {
            console.error('Error stopping track:', err)
            notifyParentToShowToast('Error al detener el track: ' + (err.response?.data?.message || err.message), 'error')
        } finally {
            setSubmitting(false)
        }
    }, [user, onRefresh])

    const createManualTrack = useCallback(async (item, startDate, endDate) => {
        if (!startDate || !endDate) return notifyParentToShowToast('Por favor, selecciona una fecha de inicio y una de fin.', 'warning')
        if (endDate < startDate) return notifyParentToShowToast('La fecha de fin debe ser posterior a la de inicio.', 'warning')

        setSubmitting(true)
        try {
            const payload = {
                idUser: user.userId,
                idTask: item.idTask,
                name: item.name || item.taskName,
                taskName: item.name || item.taskName,
                projectName: item.projectName,
                startTime: toSQLFormat(startDate),
                endTime: toSQLFormat(endDate),
                idProyecto: item.projectId || item.idProyecto,
                typeTrack: item.typeTrack || 'manual',
                currency: item.currency || 'USD'
            }
            await tracksService.create(payload)
            if (onRefresh) onRefresh()
            notifyParentToSyncTimer()
            notifyParentToShowToast('Track guardado con éxito.', 'success')
        } catch (err) {
            console.error('Error creating manual track:', err)
            notifyParentToShowToast('No se pudo guardar el track manual: ' + JSON.stringify(err.response?.data || err.message), 'error')
        } finally {
            setSubmitting(false)
        }
    }, [user, onRefresh])

    return { startTrack, stopTrack, createManualTrack, submitting }
}
