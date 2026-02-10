'use client'

import { Check, Globe, X } from 'lucide-react'
import { useState } from 'react'

interface Facility {
    id: string
    name: string
    location: string
    aiRecommended?: boolean
}

interface PublishModalProps {
    facilities: Facility[]
    onConfirm: (selectedIds: string[]) => void
    onCancel: () => void
}

const DEFAULT_FACILITIES: Facility[] = [
    { id: 'factory-munich', name: 'Munich Plant', location: 'Germany', aiRecommended: true },
    { id: 'factory-shanghai', name: 'Shanghai Facility', location: 'China', aiRecommended: true },
    { id: 'factory-detroit', name: 'Detroit Assembly', location: 'USA', aiRecommended: true },
    { id: 'factory-tokyo', name: 'Tokyo Innovation Lab', location: 'Japan' },
    { id: 'factory-saopaulo', name: 'Sao Paulo Hub', location: 'Brazil' },
    { id: 'factory-riyadh', name: 'Riyadh Terminal B', location: 'Saudi Arabia', aiRecommended: true },
]

export function PublishModal({ facilities = DEFAULT_FACILITIES, onConfirm, onCancel }: PublishModalProps) {
    const [selected, setSelected] = useState<Set<string>>(() => {
        const initial = new Set<string>()
        facilities.forEach(f => { if (f.aiRecommended) initial.add(f.id) })
        return initial
    })

    const toggle = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-cyan-400" />
                        <h2 className="text-sm font-bold text-zinc-100">Publish to Facilities</h2>
                    </div>
                    <button onClick={onCancel} className="p-1 text-zinc-500 hover:text-zinc-300 transition">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Facility list */}
                <div className="p-5 space-y-2 max-h-80 overflow-y-auto">
                    {facilities.map(f => (
                        <button
                            key={f.id}
                            onClick={() => toggle(f.id)}
                            className={`flex items-center gap-3 w-full p-3 rounded-lg text-left transition ${
                                selected.has(f.id)
                                    ? 'bg-cyan-950/30 border border-cyan-800'
                                    : 'bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700'
                            }`}
                        >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                selected.has(f.id) ? 'bg-cyan-600 border-cyan-600' : 'border-zinc-600'
                            }`}>
                                {selected.has(f.id) && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <div className="flex-1">
                                <span className="text-sm text-zinc-200 font-medium">{f.name}</span>
                                <span className="ml-2 text-xs text-zinc-500">{f.location}</span>
                            </div>
                            {f.aiRecommended && (
                                <span className="px-1.5 py-0.5 text-[10px] bg-violet-900/40 text-violet-400 rounded font-medium">AI pick</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-zinc-800">
                    <button onClick={onCancel} className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition">
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(Array.from(selected))}
                        disabled={selected.size === 0}
                        className="px-4 py-2 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-700 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed rounded-lg transition"
                    >
                        Publish to {selected.size} {selected.size === 1 ? 'Facility' : 'Facilities'}
                    </button>
                </div>
            </div>
        </div>
    )
}
