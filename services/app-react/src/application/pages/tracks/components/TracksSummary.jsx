import React from 'react'
import { Card } from 'primereact/card'
import { formatMinutes } from './GroupedTracksTable'

function TracksSummary({ grouped, summary }) {
    if (!grouped.length) return null

    const totals = summary?.totals || []
    const projects = summary?.projects || []

    return (
        <Card title="Summary" className="mt-4">
            {totals.map((total, idx) => {
                const currencyProjects = projects.filter((project) => project.currency === total.currency)
                return (
                    <div key={total.currency} className={idx > 0 ? 'mt-4' : ''}>
                        <ul className="list-none p-0 m-0">
                            {currencyProjects.map((p) => (
                                <li
                                    key={`${p.currency}-${p.idProyecto}`}
                                    className="flex justify-between py-1 border-b border-gray-100"
                                >
                                    <span>{p.projectName}</span>
                                    <span className="text-gray-600">
                                        {formatMinutes(p.minutes)}
                                        <span className="ml-4">{p.currency} {Number(p.amount).toFixed(2)}</span>
                                    </span>
                                </li>
                            ))}
                            <li className="flex justify-between py-2 font-bold">
                                <span>TOTAL {total.currency}</span>
                                <span>
                                    {formatMinutes(total.minutes)}
                                    <span className="ml-4">{total.currency} {Number(total.amount).toFixed(2)}</span>
                                </span>
                            </li>
                        </ul>
                    </div>
                )
            })}
        </Card>
    )
}

export default TracksSummary
