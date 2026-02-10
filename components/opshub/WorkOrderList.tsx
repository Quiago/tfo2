'use client'

import { ClipboardList, Search } from 'lucide-react'
import { useState } from 'react'
import { WorkOrderListCard, type WorkOrderCard, type WorkOrderStatus } from './WorkOrderListCard'

// Mock work orders for demo
const MOCK_WORK_ORDERS: WorkOrderCard[] = [
    {
        id: 'wo-1', number: 'WO-4821', title: 'Motor A7 Bearing Replacement — Line 3',
        status: 'in-progress', priority: 'critical',
        team: [{ initials: 'KM', color: '#3b82f6' }, { initials: 'AS', color: '#8b5cf6' }, { initials: 'AI', color: '#7c3aed' }],
        createdAt: '2026-02-09T14:30:00Z', tags: ['motors', 'predictive', 'bearing'],
        equipmentName: 'Motor A7', factoryName: 'Munich Plant',
    },
    {
        id: 'wo-2', number: 'WO-4818', title: 'HVAC Zone B Filter Replacement',
        status: 'open', priority: 'low',
        team: [{ initials: 'TY', color: '#06b6d4' }],
        createdAt: '2026-02-09T09:30:00Z', tags: ['hvac', 'filter', 'energy'],
        equipmentName: 'HVAC Zone B', factoryName: 'Tokyo Innovation Lab',
    },
    {
        id: 'wo-3', number: 'WO-4815', title: 'Weld Parameter Update — Cell 2',
        status: 'resolved', priority: 'medium',
        team: [{ initials: 'JM', color: '#f59e0b' }, { initials: 'RC', color: '#ef4444' }],
        createdAt: '2026-02-08T15:45:00Z', tags: ['welding', 'parameters', 'aluminum'],
        equipmentName: 'KUKA KR300 #2', factoryName: 'Detroit Assembly',
    },
    {
        id: 'wo-4', number: 'WO-4810', title: 'Paint Booth #3 Temperature Investigation',
        status: 'in-progress', priority: 'high',
        team: [{ initials: 'LW', color: '#10b981' }, { initials: 'AI', color: '#7c3aed' }],
        createdAt: '2026-02-09T15:55:00Z', tags: ['paint', 'temperature', 'critical'],
        equipmentName: 'Paint Booth #3', factoryName: 'Shanghai Facility',
    },
    {
        id: 'wo-5', number: 'WO-4805', title: 'Robot Arm Calibration — KUKA KR300 #2',
        status: 'open', priority: 'medium',
        team: [{ initials: 'WZ', color: '#ec4899' }],
        createdAt: '2026-02-09T11:00:00Z', tags: ['robotics', 'calibration'],
        equipmentName: 'KUKA KR300 #2', factoryName: 'Detroit Assembly',
    },
    {
        id: 'wo-6', number: 'WO-4798', title: 'Humidity Sensor False Alarm Investigation',
        status: 'closed', priority: 'low',
        team: [{ initials: 'CS', color: '#22c55e' }],
        createdAt: '2026-02-07T19:30:00Z', tags: ['humidity', 'sensors', 'false-alarm'],
        equipmentName: 'Humidity Sensors', factoryName: 'Sao Paulo Hub',
    },
]

type FilterStatus = 'all' | WorkOrderStatus

interface WorkOrderListProps {
    onSelectWorkOrder?: (id: string) => void
}

export function WorkOrderList({ onSelectWorkOrder }: WorkOrderListProps) {
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')

    const filtered = MOCK_WORK_ORDERS.filter(wo => {
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
                    <ClipboardList className="w-5 h-5 text-cyan-400" />
                    <h1 className="text-xl font-bold text-zinc-100">Work Orders</h1>
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-zinc-800 text-zinc-400 rounded-full">
                        {MOCK_WORK_ORDERS.length}
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
                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition ${
                            statusFilter === f.value
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
