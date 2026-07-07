import React, { useState, useEffect } from 'react'
import { Calendar } from 'primereact/calendar'

export default function HistoryItem({ item, onStart, onStop, onSaveSelection, submitting, isFirstItem, isCurrentTrack, hasAnyActiveTrack }) {
	const [itemTab, setItemTab] = useState(1) // 1: Play, 2: Manual
	const [startDate, setStartDate] = useState(new Date())
	const [endDate, setEndDate] = useState(new Date())
	const [activePicker, setActivePicker] = useState(null) // 'start' or 'end'

	useEffect(() => {
		if (!activePicker) return

		const handleGlobalClick = (e) => {
			const hourSpan = e.target.closest('.p-hour-picker > span')
			const minuteSpan = e.target.closest('.p-minute-picker > span')

			if (!hourSpan && !minuteSpan) return

			const span = hourSpan || minuteSpan
			const isHour = !!hourSpan

			// If it's already an input, do nothing
			if (span.querySelector('input') || span.tagName === 'INPUT') return

			const currentText = span.textContent.trim()
			const input = document.createElement('input')
			input.type = 'number'
			input.value = currentText
			input.min = '0'
			input.max = isHour ? '23' : '59'
			
			// Premium glassmorphism / neat styles
			input.style.width = '2.5rem'
			input.style.textAlign = 'center'
			input.style.fontSize = 'inherit'
			input.style.fontWeight = 'bold'
			input.style.fontFamily = 'inherit'
			input.style.border = '1px solid var(--primary-color, #3b82f6)'
			input.style.borderRadius = '4px'
			input.style.background = 'rgba(255, 255, 255, 0.1)'
			input.style.color = 'inherit'
			input.style.outline = 'none'
			input.style.padding = '2px 0'

			span.replaceWith(input)
			input.focus()
			input.select()

			const saveValue = () => {
				let val = parseInt(input.value, 10)
				if (isNaN(val)) val = 0
				if (isHour) {
					val = Math.max(0, Math.min(23, val))
				} else {
					val = Math.max(0, Math.min(59, val))
				}

				const baseDate = activePicker === 'start' ? startDate : endDate
				const newDate = new Date(baseDate)

				if (isHour) {
					newDate.setHours(val)
				} else {
					newDate.setMinutes(val)
				}

				if (activePicker === 'start') {
					setStartDate(newDate)
				} else {
					setEndDate(newDate)
				}

				span.textContent = String(val).padStart(2, '0')
				input.replaceWith(span)
			}

			input.addEventListener('blur', saveValue)
			input.addEventListener('keydown', (ev) => {
				if (ev.key === 'Enter') {
					saveValue()
				} else if (ev.key === 'Escape') {
					input.replaceWith(span)
				}
			})
		}

		document.addEventListener('click', handleGlobalClick)
		return () => document.removeEventListener('click', handleGlobalClick)
	}, [activePicker, startDate, endDate])

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
									onShow={() => setActivePicker('start')}
									onHide={() => setActivePicker(null)}
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
									onShow={() => setActivePicker('end')}
									onHide={() => setActivePicker(null)}
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
									className={`action-circle-btn ${Number(item.isActive) !== 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
									onClick={() => Number(item.isActive) === 1 && onStart(item)}
									disabled={submitting || Number(item.isActive) !== 1}
									data-testid="start-track-btn"
									title={Number(item.isActive) !== 1 ? "Tarea inactiva" : "Iniciar track"}
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
