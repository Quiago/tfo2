'use client'

import { UserAvatar } from '@/components/shared/UserAvatar'
import {
    CheckCircle,
    ClipboardCheck,
    FlaskConical,
    Play,
    Settings,
    ShieldCheck,
} from 'lucide-react'
import type { TaskStatus, TaskType } from './MyTaskCard'

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
        <div className={`flex items-start gap-4 p-4 hover:bg-zinc-800/30 transition ${status === 'completed' ? 'opacity-60 bg-zinc-900/30' : ''}`}>
            {/* Task number + type icon */}
            <div className={`flex flex-col items-center gap-1.5 pt-0.5 ${typeColor[type]}`}>
                <span className="text-xs font-mono font-bold">#{taskNumber}</span>
                {typeIcon[type]}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm text-zinc-200 font-medium truncate">{title}</h4>
                    {blockedBy && blockedBy.length > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] text-red-400 bg-red-900/20 border border-red-900/30 rounded font-medium">
                            Blocked by #{blockedBy.join(', #')}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        <span className="text-zinc-500">{sc.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <UserAvatar initials={assigneeInitials} color={assigneeColor} size="sm" />
                        <span className="text-zinc-500">{assigneeName}</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 self-center">
                {status === 'pending' && onStart && (
                    <button onClick={onStart} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-400 border border-cyan-900/50 hover:bg-cyan-900/20 rounded-md transition">
                        <Play className="w-3.5 h-3.5" /> Start
                    </button>
                )}
                {status === 'in-progress' && onComplete && (
                    <button onClick={onComplete} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 border border-emerald-900/50 hover:bg-emerald-900/20 rounded-md transition">
                        <CheckCircle className="w-3.5 h-3.5" /> Done
                    </button>
                )}
                {status === 'completed' && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-500 bg-emerald-900/10 rounded-md border border-emerald-900/20">
                        <CheckCircle className="w-3.5 h-3.5" /> Completed
                    </div>
                )}
                {status === 'blocked' && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 bg-red-900/10 rounded-md border border-red-900/20">
                        Blocked
                    </div>
                )}
            </div>
        </div>
    )
}
