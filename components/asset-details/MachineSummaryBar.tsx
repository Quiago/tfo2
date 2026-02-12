'use client'

import { ExternalLink, Plus } from 'lucide-react'

const STATS = [
    { label: 'Health', value: '92%', color: 'text-emerald-400' },
    { label: 'Last Maintenance', value: '3 days ago', color: 'text-zinc-300' },
    { label: 'Avg Energy', value: '114.9 kW', color: 'text-zinc-300' },
    { label: 'Efficiency', value: '96.9%', color: 'text-cyan-400' },
    { label: 'Uptime', value: '98.9%', color: 'text-emerald-400' },
    { label: 'Cycle Count', value: '1,204', color: 'text-zinc-300' },
]

export function MachineSummaryBar({ onCreateWorkOrder }: { onCreateWorkOrder?: () => void }) {
    return (
        <div className="h-full bg-zinc-900 flex items-center gap-6 px-5 overflow-x-auto">
            {/* Stats */}
            {STATS.map((s) => (
                <div key={s.label} className="flex flex-col items-center flex-shrink-0">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{s.label}</span>
                    <span className={`text-sm font-semibold ${s.color}`}>{s.value}</span>
                </div>
            ))}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Action buttons */}
            <button
                onClick={onCreateWorkOrder}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700 transition-colors flex-shrink-0"
            >
                <Plus size={13} />
                Create Work Order
            </button>
            <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700 transition-colors flex-shrink-0">
                <ExternalLink size={13} />
                View Docs
            </button>
        </div>
    )
}
