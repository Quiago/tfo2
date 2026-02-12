'use client'

import { AvatarStack } from '@/components/shared/AvatarStack'
import { Calendar, Trash2 } from 'lucide-react'

import { type WorkOrderCard, type WorkOrderStatus } from '@/lib/types/opshub'

interface WorkOrderListCardProps {
    workOrder: WorkOrderCard
    onClick?: (id: string) => void
    onDelete?: (id: string) => void
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

export function WorkOrderListCard({ workOrder, onClick, onDelete }: WorkOrderListCardProps) {
    const sc = statusConfig[workOrder.status]

    return (
        <div
            className="group relative w-full text-left bg-zinc-900 border-b border-zinc-800 p-4 hover:bg-zinc-800/50 transition first:rounded-t-lg last:rounded-b-lg last:border-0"
        >
            <div
                className="flex items-start justify-between gap-3 cursor-pointer"
                onClick={() => onClick?.(workOrder.id)}
            >
                <div className="flex-1 min-w-0">
                    {/* ID - Status - Priority (Text Only) */}
                    <div className="flex items-center gap-0 text-xs font-mono mb-1">
                        <span className="text-zinc-500 mr-1">{workOrder.number}</span>
                        <span className="text-zinc-600 mr-1">-</span>
                        <span className={`${sc.color.replace('bg-', 'text-').replace('/40', '')} mr-1 font-medium`}>
                            {workOrder.status.replace('-', '_')}
                        </span>
                        <span className="text-zinc-600 mr-1">-</span>
                        <span className={`${priorityColor[workOrder.priority]} font-medium`}>
                            {workOrder.priority}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-cyan-400 transition truncate pr-8">
                        {workOrder.title}
                    </h3>

                    {/* Meta */}
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-zinc-500">
                        {workOrder.facility && <span>{workOrder.facility}</span>}
                        {workOrder.equipmentName && (
                            <>
                                <span className="text-zinc-700">&middot;</span>
                                <span>{workOrder.equipmentName}</span>
                            </>
                        )}
                        <span className="text-zinc-700">&middot;</span>
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {timeAgo(workOrder.createdAt)}
                        </div>
                    </div>

                    {/* Tags */}
                    {workOrder.tags.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2">
                            {workOrder.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="text-[10px] text-zinc-500 hover:text-zinc-300 cursor-pointer">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Team avatars */}
                {workOrder.team.length > 0 && (
                    <AvatarStack
                        members={workOrder.team.map(m => ({
                            initials: m.avatarInitials,
                            color: m.avatarColor,
                        }))}
                        max={3}
                    />
                )}
            </div>

            {/* Delete Action - Show on hover */}
            {onDelete && (
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        if (confirm('Are you sure you want to delete this Work Order?')) {
                            onDelete(workOrder.id)
                        }
                    }}
                    className="absolute top-4 right-4 p-1.5 text-zinc-600 hover:text-red-400 hover:bg-zinc-800 rounded opacity-0 group-hover:opacity-100 transition"
                    title="Delete Work Order"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}
        </div>
    )
}
