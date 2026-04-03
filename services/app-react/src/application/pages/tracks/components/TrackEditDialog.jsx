import { useState, useEffect, useContext } from 'react'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { FloatLabel } from 'primereact/floatlabel'
import { Button } from 'primereact/button'
import { Calendar } from 'primereact/calendar'
import tracksService from '@/services/tracksService'
import { resizerContext } from '@/providers/iframe-resizer'

function toDatetimeObject(str) {
    if (!str) return null
    const [datePart, timePart] = str.split(' ')
    const [y, m, d] = datePart.split('-').map(Number)
    const [hh, mm, ss] = (timePart || '00:00:00').split(':').map(Number)
    return new Date(y, m - 1, d, hh, mm, ss || 0)
}

function toDatetimeString(date) {
    if (!date) return null
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const hh = String(date.getHours()).padStart(2, '0')
    const mm = String(date.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${d} ${hh}:${mm}:00`
}

function TrackEditDialog({ visible, track, onHide, onSaved }) {
    const { user } = useContext(resizerContext)
    const userRole = user?.userRole

    const [form, setForm] = useState({
        name: '',
        startTime: null,
        endTime: null,
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (track) {
            setForm({
                name: track.name ?? '',
                startTime: toDatetimeObject(track.startTime),
                endTime: toDatetimeObject(track.endTime),
            })
            setError('')
        }
    }, [track])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.name || !form.startTime) {
            return setError('Task name and start time are required.')
        }
        setLoading(true)
        setError('')
        try {
            await tracksService.update({
                id: track.id,
                name: form.name,
                startTime: toDatetimeString(form.startTime),
                endTime: toDatetimeString(form.endTime),
                idUser: track.idUser,
                idProyecto: track.idProyecto,
                currency: track.currency,
            }, userRole)
            onSaved()
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Error saving track.')
        } finally {
            setLoading(false)
        }
    }

    const footer = (
        <div className="flex justify-between">
            <Button
                label="Cancel"
                icon="pi pi-times"
                size="small"
                className="p-button-text"
                onClick={onHide}
                disabled={loading}
            />
            <Button
                label={loading ? 'Saving...' : 'Update'}
                icon="pi pi-check"
                size="small"
                onClick={handleSubmit}
                disabled={loading}
            />
        </div>
    )

    return (
        <Dialog
            header="Edit Track"
            visible={visible}
            onHide={onHide}
            footer={footer}
            style={{ width: '32rem' }}
            modal
        >
            <div className="flex flex-col gap-5 pt-2">
                <FloatLabel>
                    <InputText
                        id="dlg-name"
                        value={form.name}
                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                        className="w-full p-inputtext-sm"
                    />
                    <label htmlFor="dlg-name">Task</label>
                </FloatLabel>

                <FloatLabel>
                    <Calendar
                        inputId="dlg-startTime"
                        value={form.startTime}
                        onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.value }))}
                        showTime
                        hourFormat="24"
                        dateFormat="dd/mm/yy"
                        showIcon
                        className="w-full"
                        inputClassName="p-inputtext-sm w-full"
                    />
                    <label htmlFor="dlg-startTime">Start Time</label>
                </FloatLabel>

                <FloatLabel>
                    <Calendar
                        inputId="dlg-endTime"
                        value={form.endTime}
                        onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.value }))}
                        showTime
                        hourFormat="24"
                        dateFormat="dd/mm/yy"
                        showIcon
                        minDate={form.startTime || undefined}
                        className="w-full"
                        inputClassName="p-inputtext-sm w-full"
                    />
                    <label htmlFor="dlg-endTime">End Time</label>
                </FloatLabel>

                <div className="flex gap-4">
                    <FloatLabel className="flex-1">
                        <InputText
                            id="dlg-costHour"
                            value={track ? `${track.currency} ${Number(track.costHour).toFixed(2)}` : ''}
                            className="w-full p-inputtext-sm"
                            disabled
                        />
                        <label htmlFor="dlg-costHour">Cost/Hour</label>
                    </FloatLabel>
                    <FloatLabel className="flex-1">
                        <InputText
                            id="dlg-trackCost"
                            value={track ? `${track.currency} ${Number(track.trackCost).toFixed(2)}` : ''}
                            className="w-full p-inputtext-sm"
                            disabled
                        />
                        <label htmlFor="dlg-trackCost">Cost</label>
                    </FloatLabel>
                </div>

                {error && (
                    <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
                        {error}
                    </div>
                )}
            </div>
        </Dialog>
    )
}

export default TrackEditDialog
