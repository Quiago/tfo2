'use client'

import { AvatarStack } from '@/components/shared/AvatarStack'
import { Calendar, Tag } from 'lucide-react'

// TODO: import from opshub types when available
export type WorkOrderStatus = 'open' | 'in-progress' | 'resolved' | 'closed'

export interface WorkOrderCard {
    id: string
    number: string
    title: string
    status: WorkOrderStatus
    priority: 'critical' | 'high' | 'medium' | 'low'
    team: { initials: string; color: string }[]
    createdAt: string
    tags: string[]
    equipmentName?: string
    factoryName?: string
}

interface WorkOrderListCardProps {
    workOrder: WorkOrderCard
    onClick?: (id: string) => void
}

const statusConfig: Record<WorkOrderStatus, { color: string; label: string }> = {
    open: { color: 'bg-emerald-900/40 text-emerald-400', label: 'Open' },
    'in-progress': { color: 'bg-cyan-900/40 text-cyan-400', label: 'In Progress' },
    resolved: { color: 'bg-purple-900/40 text-purple-400', label: 'Resolved' },
    closed: { color: 'bg-zinc-700 text-zinc-400', label: 'Closed' },
}

const priorityColor: Record<string, string> = {
    critical: 'text-red-400',
    high: 'text-orange-400',
    medium: 'text-amber-400',
    low: 'text-blue-400',
}

function timeAgo(dateStr: string): string {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
}

export function WorkOrderListCard({ workOrder, onClick }: WorkOrderListCardProps) {
    const sc = statusConfig[workOrder.status]

    return (
        <button
            onClick={() => onClick?.(workOrder.id)}
            className="w-full text-left bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 hover:bg-zinc-900/80 transition group"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    {/* Number + Status */}
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-zinc-500">{workOrder.number}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${sc.color}`}>
                            {sc.label}
                        </span>
                        <span className={`text-[10px] font-semibold uppercase ${priorityColor[workOrder.priority]}`}>
                            {workOrder.priority}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-cyan-400 transition truncate">
                        {workOrder.title}
                    </h3>

                    {/* Meta */}
                    <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                        {workOrder.factoryName && <span>{workOrder.factoryName}</span>}
                        {workOrder.equipmentName && (
                            <>
                                <span className="text-zinc-700">|</span>
                                <span>{workOrder.equipmentName}</span>
                            </>
                        )}
                        <span className="text-zinc-700">|</span>
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {timeAgo(workOrder.createdAt)}
                        </div>
                    </div>

                    {/* Tags */}
                    {workOrder.tags.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2">
                            {workOrder.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] bg-zinc-800 text-zinc-400 rounded">
                                    <Tag className="w-2.5 h-2.5" />{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Team avatars */}
                {workOrder.team.length > 0 && (
                    <AvatarStack members={workOrder.team} max={3} />
                )}
            </div>
        </button>
    )
}
