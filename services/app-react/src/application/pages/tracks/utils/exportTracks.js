import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

function formatDatetime(datetime) {
    if (!datetime) return ''
    const [datePart, timePart] = String(datetime).split(' ')
    if (!datePart) return ''
    const [y, m, d] = datePart.split('-')
    const time = timePart ? timePart.substring(0, 5) : ''
    return `${d}/${m}/${y}${time ? ` ${time}` : ''}`
}

function parseDurationToMinutes(duration) {
    if (!duration) return 0
    const parts = duration.split(':').map(Number)
    if (parts.length >= 3) return parts[0] * 60 + parts[1] + Math.round(parts[2] / 60)
    if (parts.length === 2) return parts[0] * 60 + parts[1]
    return 0
}

function formatMinutes(totalMinutes) {
    const h = Math.floor(totalMinutes / 60)
    const m = totalMinutes % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function exportToPDF(grouped, isAdminOrPm, filters) {
    const doc = new jsPDF({ orientation: 'landscape' })

    doc.setFontSize(14)
    doc.text('Tracks Report', 14, 16)

    if (filters?.from && filters?.to) {
        const fmt = (d) => d.toLocaleDateString('es-UY')
        doc.setFontSize(9)
        doc.text(`Period: ${fmt(filters.from)} \u2014 ${fmt(filters.to)}`, 14, 23)
    }

    const headers = isAdminOrPm
        ? ['User', 'Project', 'Client', 'Task', 'Start', 'End', 'Duration', 'Cost/Hr', 'Cost']
        : ['Project', 'Client', 'Task', 'Start', 'End', 'Duration', 'Cost/Hr', 'Cost']

    const body = []
    for (const g of grouped) {
        body.push([{
            content: g.projectName,
            colSpan: headers.length,
            styles: { fillColor: [224, 224, 255], fontStyle: 'bold', fontSize: 9 },
        }])

        for (const t of g.tracks) {
            const cur = t.currency || 'USD'
            const row = [
                t.projectName || '',
                t.clientName || '',
                t.name || '',
                formatDatetime(t.startTime),
                formatDatetime(t.endTime),
                formatMinutes(parseDurationToMinutes(t.duration)),
                `${cur} ${Number(t.costHour).toFixed(2)}`,
                `${cur} ${Number(t.trackCost).toFixed(2)}`,
            ]
            if (isAdminOrPm) row.unshift(t.userName || '')
            body.push(row)
        }

        // Subtotal row
        const byCurrency = {}
        let subMinutes = 0
        for (const t of g.tracks) {
            const cur = t.currency || 'USD'
            if (!byCurrency[cur]) byCurrency[cur] = 0
            byCurrency[cur] += Number(t.trackCost) || 0
            subMinutes += parseDurationToMinutes(t.duration)
        }
        const subText = `Subtotal: ${formatMinutes(subMinutes)}   ${Object.entries(byCurrency).map(([c, v]) => `${c} ${v.toFixed(2)}`).join('   ')}`
        body.push([{
            content: subText,
            colSpan: headers.length,
            styles: { fillColor: [235, 235, 245], fontStyle: 'bold', halign: 'right', fontSize: 8 },
        }])
    }

    autoTable(doc, {
        head: [headers],
        body,
        startY: 28,
        styles: { fontSize: 7.5, cellPadding: 1.5 },
        headStyles: { fillColor: [112, 118, 254], textColor: 255 },
        didDrawPage: (data) => {
            doc.setFontSize(7)
            doc.text(
                `Page ${data.pageNumber}`,
                doc.internal.pageSize.width - 20,
                doc.internal.pageSize.height - 8
            )
        },
    })

    // Summary section
    const summaryStartY = (doc.lastAutoTable?.finalY ?? 28) + 12
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('Summary', 14, summaryStartY)
    doc.setFont(undefined, 'normal')

    const summary = {}
    for (const g of grouped) {
        for (const t of g.tracks) {
            const cur = t.currency || 'USD'
            const pid = g.idProyecto
            if (!summary[cur]) summary[cur] = { projects: {}, total: 0, totalMinutes: 0 }
            const cost = Number(t.trackCost) || 0
            const mins = parseDurationToMinutes(t.duration)
            summary[cur].total += cost
            summary[cur].totalMinutes += mins
            if (!summary[cur].projects[pid]) {
                summary[cur].projects[pid] = { name: g.projectName, cost: 0, minutes: 0 }
            }
            summary[cur].projects[pid].cost += cost
            summary[cur].projects[pid].minutes += mins
        }
    }

    let nextY = summaryStartY + 4
    for (const [cur, sec] of Object.entries(summary)) {
        const sumBody = [
            ...Object.values(sec.projects).map((p) => [
                p.name,
                formatMinutes(p.minutes),
                `${cur} ${p.cost.toFixed(2)}`,
            ]),
            [
                { content: `TOTAL ${cur}`, styles: { fontStyle: 'bold' } },
                { content: formatMinutes(sec.totalMinutes), styles: { fontStyle: 'bold' } },
                { content: `${cur} ${sec.total.toFixed(2)}`, styles: { fontStyle: 'bold' } },
            ],
        ]
        autoTable(doc, {
            head: [['Project', 'Duration', `Cost (${cur})`]],
            body: sumBody,
            startY: nextY,
            tableWidth: 130,
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [112, 118, 254], textColor: 255 },
        })
        nextY = (doc.lastAutoTable?.finalY ?? nextY) + 8
    }

    const blob = doc.output('blob')
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tracks.pdf'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function exportToCSV(grouped, isAdminOrPm, filename = 'tracks.csv') {
    const headers = isAdminOrPm
        ? ['User', 'Project', 'Client', 'Task', 'Start', 'End', 'Duration', 'Cost/Hour', 'Cost']
        : ['Project', 'Client', 'Task', 'Start', 'End', 'Duration', 'Cost/Hour', 'Cost']

    const rows = grouped.flatMap((g) =>
        g.tracks.map((t) => {
            const cur = t.currency || 'USD'
            const row = [
                t.projectName || '',
                t.clientName || '',
                t.name || '',
                formatDatetime(t.startTime),
                formatDatetime(t.endTime),
                formatMinutes(parseDurationToMinutes(t.duration)),
                `${cur} ${Number(t.costHour).toFixed(2)}`,
                `${cur} ${Number(t.trackCost).toFixed(2)}`,
            ]
            if (isAdminOrPm) row.unshift(t.userName || '')
            return row
        })
    )

    const escape = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`
    const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\r\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
}
