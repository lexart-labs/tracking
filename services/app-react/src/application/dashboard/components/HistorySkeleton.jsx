import React from 'react';

export default function HistorySkeleton() {
    return (
        <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50/50">
                    <div className="flex items-center space-x-3 w-2/3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    </div>
                    <div className="w-24 h-8 bg-gray-200 rounded-full"></div>
                </div>
            ))}
        </div>
    );
}
