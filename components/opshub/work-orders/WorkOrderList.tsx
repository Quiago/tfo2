'use client'

import { useOpshubStore } from '@/lib/store/opshub-store'
import { type WorkOrderStatus } from '@/lib/types/opshub'
import { ArrowLeft, ClipboardList, Search } from 'lucide-react'
import { useState } from 'react'
import { WorkOrderListCard } from './WorkOrderListCard'

type FilterStatus = 'all' | WorkOrderStatus

interface WorkOrderListProps {
    onSelectWorkOrder: (id: string) => void
    onBack?: () => void
}

export function WorkOrderList({ onSelectWorkOrder, onBack }: WorkOrderListProps) {
    const workOrders = useOpshubStore(s => s.workOrders)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')

    const filtered = workOrders.filter(wo => {
        if (statusFilter !== 'all' && wo.status !== statusFilter) return false
        if (search.trim()) {
            const q = search.toLowerCase()
            return (
                wo.title.toLowerCase().includes(q) ||
                wo.number.toLowerCase().includes(q) ||
                wo.tags.some(t => t.toLowerCase().includes(q))
            )
        }
        return true
    })

    const filters: { value: FilterStatus; label: string }[] = [
        { value: 'all', label: 'All' },
        { value: 'open', label: 'Open' },
        { value: 'in-progress', label: 'In Progress' },
        { value: 'resolved', label: 'Resolved' },
        { value: 'closed', label: 'Closed' },
    ]

    return (
        <div className="max-w-4xl mx-auto py-6 px-4">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    {onBack && (
                        <button onClick={onBack} className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition">
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                    )}
                    <ClipboardList className="w-5 h-5 text-cyan-400" />
                    <h1 className="text-xl font-bold text-zinc-100">Work Orders</h1>
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-zinc-800 text-zinc-400 rounded-full">
                        {filtered.length}
                    </span>
                </div>
            </div>

            {/* Search + Filters */}
            <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search work orders..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-zinc-100 placeholder:text-zinc-600"
                    />
                </div>
            </div>

            <div className="flex items-center gap-1 mb-4 pb-3 border-b border-zinc-800">
                {filters.map(f => (
                    <button
                        key={f.value}
                        onClick={() => setStatusFilter(f.value)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition ${statusFilter === f.value
                            ? 'bg-cyan-900/40 text-cyan-400'
                            : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Work Order Cards */}
            {filtered.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-sm">
                    No work orders match your search
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(wo => (
                        <WorkOrderListCard
                            key={wo.id}
                            workOrder={wo}
                            onClick={onSelectWorkOrder}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
