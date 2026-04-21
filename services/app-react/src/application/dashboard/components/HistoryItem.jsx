import React, { useState } from 'react'
import { Calendar } from 'primereact/calendar'

export default function HistoryItem({ item, onStart, onStop, onSaveSelection, submitting, isFirstItem, isCurrentTrack, hasAnyActiveTrack }) {
	const [itemTab, setItemTab] = useState(1) // 1: Play, 2: Manual
	const [startDate, setStartDate] = useState(new Date())
	const [endDate, setEndDate] = useState(new Date())

	const formatStartTime = (dateStr) => {
		const d = new Date(dateStr)
		const day = d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '')
		const numDay = d.getDate()
		const month = d.toLocaleDateString('es-ES', { month: 'long' })
		const year = d.getFullYear()
		const time = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
		return `${day}. ${numDay} ${month} ${year} ${time}`
	}

	const formatEndTime = (dateStr) => {
		if (!dateStr || dateStr === '0000-00-00 00:00:00') return 'Current'
		const d = new Date(dateStr)
		return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
	}

	const calculateTimeTracked = (start, end) => {
		if (!end || end === '0000-00-00 00:00:00') {
			const diff = new Date() - new Date(start)
			return (diff / (1000 * 60 * 60)).toFixed(2)
		}
		const diff = new Date(end) - new Date(start)
		return (diff / (1000 * 60 * 60)).toFixed(2)
	}

	return (
		<div className="history-item">
			<div className="history-item__title_container">
				<div className="history-item__title_tracked_time">
					<span>
						{formatStartTime(item.startTime)} - {formatEndTime(item.endTime)} ({calculateTimeTracked(item.startTime, item.endTime)} hrs)
					</span>
				</div>
				<div className="history-item__title__tabs">
					<button
						className={`history-tab-btn ${itemTab === 1 ? 'active' : ''}`}
						onClick={() => setItemTab(1)}
					>
						<i className="pi pi-play" style={{ fontSize: '0.8rem' }}></i>
					</button>
					<button
						className={`history-tab-btn ${itemTab === 2 ? 'active' : ''}`}
						onClick={() => setItemTab(2)}
					>
						<i className="pi pi-clock" style={{ fontSize: '0.8rem' }}></i>
					</button>
				</div>
			</div>

			<div className="history-item__data_container">
				<div className="history-item__duration">
					<div className="flex items-center gap-2">
						<span className="lexart-tag lexart-tag--info">{item.projectName}</span>
						{item.clientName && <span className="lexart-tag lexart-tag--secondary">{item.clientName}</span>}
						<span className="history-item__task_name">{item.name}</span>
					</div>
				</div>

				<div className="history-item__actions">
					{itemTab === 2 && (
						<div className="flex gap-4 items-end">
							<div className="history-item__datepicker">
								<span>Desde</span>
								<Calendar
									value={startDate}
									onChange={(e) => setStartDate(e.value)}
									showTime
									hourFormat="24"
									dateFormat="dd/mm/yy"
								/>
							</div>
							<div className="history-item__datepicker">
								<span>Hasta</span>
								<Calendar
									value={endDate}
									onChange={(e) => setEndDate(e.value)}
									showTime
									hourFormat="24"
									dateFormat="dd/mm/yy"
								/>
							</div>
							<button
								className="action-circle-btn"
								onClick={() => onSaveSelection(item, startDate, endDate)}
								disabled={submitting}
							>
								<i className={submitting ? "pi pi-spin pi-spinner" : "pi pi-save"}></i>
							</button>
						</div>
					)}

					{itemTab === 1 && (
						<>
							{isCurrentTrack && (
								<button
									className="action-circle-btn tracking"
									onClick={() => onStop(item)}
									disabled={submitting}
								>
									<i className={submitting ? "pi pi-spin pi-spinner" : "pi pi-pause"}></i>
								</button>
							)}
							{!hasAnyActiveTrack && (
								<button
									className="action-circle-btn"
									onClick={() => onStart(item)}
									disabled={submitting}
									data-testid="start-track-btn"
								>
									<i className={submitting ? "pi pi-spin pi-spinner" : "pi pi-play"}></i>
								</button>
							)}

						</>
					)}
				</div>
			</div>
		</div>
	)
}
