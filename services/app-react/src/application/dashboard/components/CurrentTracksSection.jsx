import React from 'react'

export function CurrentTracksSection({ tracks, userRole, ...props }) {
	if (userRole !== 'admin' && userRole !== 'pm') return null

	const formatDate = (dateStr) => {
		if (!dateStr) return ''
		const d = new Date(dateStr)
		return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
			d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
	}

	return (
		<details open {...props}>
			<summary>
				<i className="ri-arrow-right-s-line summary-chevron"></i>
				<span className="summary-title">Current Tracks</span>
			</summary>
			<div className="summary-content">
				{tracks.length > 0 ? (
					<div className="overflow-x-auto">
						<table className="current-tracks-table">
							<thead>
								<tr>
									<th></th>
									<th>User</th>
									<th>Project</th>
									<th>Task</th>
									<th>Start Time</th>
								</tr>
							</thead>
							<tbody>
								{tracks.map((track, index) => (
									<tr key={index}>
										<td>
											<img
												src={track.photo ? (track.photo.startsWith('http') ? track.photo : `${import.meta.env.VITE_FILES_BASE || 'http://localhost:82/files/'}${track.photo}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(track.userName || 'User')}&background=random`}
												alt="avatar"
												className="usr-photo-table"
												onError={(e) => {
													e.target.onerror = null;
													e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(track.userName || 'User')}&background=random`;
												}}
											/>
										</td>
										<td>{track.userName}</td>
										<td>{track.projectName}</td>
										<td>{track.taskName}</td>
										<td>{formatDate(track.startTime)}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<div className="p-4 text-center text-gray-500">No tracks found</div>
				)}
			</div>
		</details>
	)
}
