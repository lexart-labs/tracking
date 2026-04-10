import { useState, useContext } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { InputText } from 'primereact/inputtext'
import { FloatLabel } from 'primereact/floatlabel'
import { Button } from 'primereact/button'
import { Calendar } from 'primereact/calendar'
import tracksService from '@/services/tracksService'
import BreadCrumbs from '@/components/shared/BreadCrumbs'
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

export default function TrackForm() {
    const { trackId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useContext(resizerContext)
    const userRole = user?.userRole

    const track = location.state?.track
    const [form, setForm] = useState({
        id: track?.id ?? null,
        name: track?.name ?? '',
        startTime: toDatetimeObject(track?.startTime),
        endTime: toDatetimeObject(track?.endTime),
        idUser: track?.idUser ?? null,
        idProyecto: track?.idProyecto ?? null,
        currency: track?.currency ?? '',
    })
    const [fetching] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(!track ? 'Track data not available. Please go back and try again.' : '')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.name || !form.startTime) {
            return setError('Task name and start time are required.')
        }
        setLoading(true)
        setError('')
        try {
            await tracksService.update({
                id: form.id,
                name: form.name,
                startTime: toDatetimeString(form.startTime),
                endTime: toDatetimeString(form.endTime),
                idUser: form.idUser,
                idProyecto: form.idProyecto,
                currency: form.currency,
            }, userRole)
            navigate(-1)
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Error saving track.')
        } finally {
            setLoading(false)
        }
    }

    if (fetching) return <div className="p-4 text-center">Loading...</div>

    return (
        <div className="p-4">
            <BreadCrumbs items={[{ label: 'Tracks', url: '/#/tracks' }, { label: 'Edit Track' }]} />
            <h2 className="text-xl font-bold mb-6 text-black">Edit Track</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-lg">
                <FloatLabel>
                    <InputText
                        id="name"
                        value={form.name}
                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                        className="w-full p-inputtext-sm"
                    />
                    <label htmlFor="name">Task</label>
                </FloatLabel>

                <FloatLabel>
                    <Calendar
                        inputId="startTime"
                        value={form.startTime}
                        onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.value }))}
                        showTime
                        hourFormat="24"
                        dateFormat="dd/mm/yy"
                        showIcon
                        className="w-full"
                        inputClassName="p-inputtext-sm w-full"
                    />
                    <label htmlFor="startTime">Start Time</label>
                </FloatLabel>

                <FloatLabel>
                    <Calendar
                        inputId="endTime"
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
                    <label htmlFor="endTime">End Time</label>
                </FloatLabel>

                <div className="flex gap-4">
                    <FloatLabel className="flex-1">
                        <InputText
                            id="costHour"
                            value={track ? `${track.currency} ${Number(track.costHour).toFixed(2)}` : '—'}
                            className="w-full p-inputtext-sm"
                            disabled
                        />
                        <label htmlFor="costHour">Cost/Hour</label>
                    </FloatLabel>

                    <FloatLabel className="flex-1">
                        <InputText
                            id="trackCost"
                            value={track ? `${track.currency} ${Number(track.trackCost).toFixed(2)}` : '—'}
                            className="w-full p-inputtext-sm"
                            disabled
                        />
                        <label htmlFor="trackCost">Cost</label>
                    </FloatLabel>
                </div>

                {error && (
                    <div className="p-3 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <div className="flex justify-between items-center mt-2">
                    <Button
                        type="button"
                        label="Back"
                        icon="pi pi-arrow-left"
                        size="small"
                        className="p-button-text"
                        onClick={() => navigate(-1)}
                    />
                    <Button
                        type="submit"
                        label={loading ? 'Saving...' : 'Update'}
                        size="small"
                        disabled={loading}
                    />
                </div>
            </form>
        </div>
    )
}
