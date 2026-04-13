import React, { useMemo } from 'react'
import { Card } from 'primereact/card'
import { formatMinutes } from './GroupedTracksTable'

function parseDurationToMinutes(duration) {
    if (!duration) return 0
    const parts = duration.split(':').map(Number)
    if (parts.length >= 3) return parts[0] * 60 + parts[1] + Math.round(parts[2] / 60)
    if (parts.length === 2) return parts[0] * 60 + parts[1]
    return 0
}

function TracksSummary({ grouped }) {
    if (!grouped.length) return null

    const byCurrency = useMemo(() => {
        const map = {}
        for (const g of grouped) {
            for (const track of g.tracks) {
                const currency = track.currency || 'USD'
                if (!map[currency]) {
                    map[currency] = { projects: {}, totalCost: 0, totalMinutes: 0 }
                }
                const cost = Number(track.trackCost) || 0
                const minutes = parseDurationToMinutes(track.duration)
                map[currency].totalCost += cost
                map[currency].totalMinutes += minutes
                if (!map[currency].projects[g.idProyecto]) {
                    map[currency].projects[g.idProyecto] = {
                        projectName: g.projectName,
                        subtotalCost: 0,
                        subtotalMinutes: 0,
                    }
                }
                map[currency].projects[g.idProyecto].subtotalCost += cost
                map[currency].projects[g.idProyecto].subtotalMinutes += minutes
            }
        }
        return map
    }, [grouped])

    const currencies = Object.keys(byCurrency)

    return (
        <Card title="Summary" className="mt-4">
            {currencies.map((currency, idx) => {
                const section = byCurrency[currency]
                const projects = Object.values(section.projects)
                return (
                    <div key={currency} className={idx > 0 ? 'mt-4' : ''}>
                        <ul className="list-none p-0 m-0">
                            {projects.map((p) => (
                                <li
                                    key={p.projectName}
                                    className="flex justify-between py-1 border-b border-gray-100"
                                >
                                    <span>{p.projectName}</span>
                                    <span className="text-gray-600">
                                        {formatMinutes(p.subtotalMinutes)}
                                        <span className="ml-4">{currency} {p.subtotalCost.toFixed(2)}</span>
                                    </span>
                                </li>
                            ))}
                            <li className="flex justify-between py-2 font-bold">
                                <span>TOTAL {currency}</span>
                                <span>
                                    {formatMinutes(section.totalMinutes)}
                                    <span className="ml-4">{currency} {section.totalCost.toFixed(2)}</span>
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
