'use client'

import { UserAvatar } from '@/components/shared/UserAvatar'
import type { TaskType, TaskStatus, TaskPriority } from './MyTaskCard'
import {
    CheckCircle,
    ClipboardCheck,
    FlaskConical,
    Play,
    Settings,
    ShieldCheck,
} from 'lucide-react'

interface WOTaskCardProps {
    taskNumber: number
    type: TaskType
    title: string
    assigneeName: string
    assigneeInitials: string
    assigneeColor: string
    status: TaskStatus
    blockedBy?: string[]
    onStart?: () => void
    onComplete?: () => void
}

const typeIcon: Record<TaskType, React.ReactNode> = {
    investigation: <FlaskConical className="w-3.5 h-3.5" />,
    execution: <Settings className="w-3.5 h-3.5" />,
    verification: <ClipboardCheck className="w-3.5 h-3.5" />,
    approval: <ShieldCheck className="w-3.5 h-3.5" />,
}

const typeColor: Record<TaskType, string> = {
    investigation: 'text-purple-400',
    execution: 'text-cyan-400',
    verification: 'text-emerald-400',
    approval: 'text-amber-400',
}

const statusConfig: Record<TaskStatus, { dot: string; label: string }> = {
    pending: { dot: 'bg-zinc-500', label: 'Pending' },
    'in-progress': { dot: 'bg-cyan-500 animate-pulse', label: 'In Progress' },
    completed: { dot: 'bg-emerald-500', label: 'Completed' },
    blocked: { dot: 'bg-red-500', label: 'Blocked' },
}

export function WorkOrderTaskCard({
    taskNumber, type, title, assigneeName, assigneeInitials, assigneeColor,
    status, blockedBy, onStart, onComplete,
}: WOTaskCardProps) {
    const sc = statusConfig[status]

    return (
        <div className={`flex items-start gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-lg ${status === 'completed' ? 'opacity-60' : ''}`}>
            {/* Task number + type icon */}
            <div className={`flex flex-col items-center gap-1 pt-0.5 ${typeColor[type]}`}>
                <span className="text-xs font-bold">#{taskNumber}</span>
                {typeIcon[type]}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                    <span className="text-[10px] text-zinc-500 font-medium">{sc.label}</span>
                </div>
                <h4 className="text-sm text-zinc-200 font-medium">{title}</h4>

                <div className="flex items-center gap-2 mt-1.5">
                    <UserAvatar initials={assigneeInitials} color={assigneeColor} size="sm" />
                    <span className="text-xs text-zinc-500">{assigneeName}</span>
                </div>

                {blockedBy && blockedBy.length > 0 && (
                    <p className="mt-1 text-[10px] text-red-400">
                        Blocked by #{blockedBy.join(', #')}
                    </p>
                )}
            </div>

            {/* Actions */}
            <div className="flex-shrink-0">
                {status === 'pending' && onStart && (
                    <button onClick={onStart} className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-cyan-400 border border-cyan-800 hover:bg-cyan-900/30 rounded transition">
                        <Play className="w-3 h-3" /> Start
                    </button>
                )}
                {status === 'in-progress' && onComplete && (
                    <button onClick={onComplete} className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-emerald-400 border border-emerald-800 hover:bg-emerald-900/30 rounded transition">
                        <CheckCircle className="w-3 h-3" /> Done
                    </button>
                )}
                {status === 'completed' && (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                )}
            </div>
        </div>
    )
}
