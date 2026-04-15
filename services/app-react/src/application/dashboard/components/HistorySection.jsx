import React from 'react'
import HistoryItem from './HistoryItem'

export default function HistorySection({ history, onStart, onStop, onSaveSelection, submitting, hasAnyActiveTrack, activeTrackId }) {
    if (!history || history.length === 0) return null

    return (
        <details open>
            <summary>
                <i className="ri-arrow-right-s-line summary-chevron"></i>
                <span className="summary-title">History</span>
            </summary>
            <div className="summary-content">
                <section className="history-container">
                    {history.map((item, index) => (
                        <HistoryItem 
                            key={index} 
                            item={item} 
                            onStart={onStart}
                            onStop={onStop}
                            onSaveSelection={onSaveSelection}
                            submitting={submitting}
                            isFirstItem={index === 0}
                            isCurrentTrack={activeTrackId === item.id}
                            hasAnyActiveTrack={hasAnyActiveTrack}
                        />
                    ))}
                </section>
            </div>
        </details>
    )
}
