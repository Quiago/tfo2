'use client'

import { UserAvatar } from '@/components/shared/UserAvatar'
import {
    CheckCircle,
    ClipboardCheck,
    Eye,
    FlaskConical,
    Play,
    Settings,
    ShieldCheck
} from 'lucide-react'

// TODO: import from opshub types when available
export type TaskType = 'investigation' | 'execution' | 'verification' | 'approval'
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'blocked'
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low'

export interface WorkOrderTask {
    id: string
    taskNumber: number
    type: TaskType
    title: string
    description: string
    workOrderId: string
    workOrderRef: string
    assigneeId: string
    assigneeName: string
    assigneeInitials: string
    assigneeColor: string
    status: TaskStatus
    priority: TaskPriority
    blockedBy?: string[]
    completedAt?: string
}

interface MyTaskCardProps {
    task: WorkOrderTask
    onStart?: (id: string) => void
    onComplete?: (id: string) => void
    onView?: (id: string) => void
}

const priorityBorder: Record<TaskPriority, string> = {
    critical: 'border-l-red-500',
    high: 'border-l-orange-500',
    medium: 'border-l-amber-500',
    low: 'border-l-blue-500',
}

const typeConfig: Record<TaskType, { icon: React.ReactNode; color: string; label: string }> = {
    investigation: { icon: <FlaskConical className="w-3 h-3" />, color: 'bg-purple-900/40 text-purple-400', label: 'Investigation' },
    execution: { icon: <Settings className="w-3 h-3" />, color: 'bg-cyan-900/40 text-cyan-400', label: 'Execution' },
    verification: { icon: <ClipboardCheck className="w-3 h-3" />, color: 'bg-emerald-900/40 text-emerald-400', label: 'Verification' },
    approval: { icon: <ShieldCheck className="w-3 h-3" />, color: 'bg-amber-900/40 text-amber-400', label: 'Approval' },
}

const statusBadge: Record<TaskStatus, { color: string; label: string }> = {
    pending: { color: 'bg-zinc-700 text-zinc-300', label: 'Pending' },
    'in-progress': { color: 'bg-cyan-900/40 text-cyan-400', label: 'In Progress' },
    completed: { color: 'bg-emerald-900/40 text-emerald-400', label: 'Completed' },
    blocked: { color: 'bg-red-900/40 text-red-400', label: 'Blocked' },
}

export function MyTaskCard({ task, onStart, onComplete, onView }: MyTaskCardProps) {
    const tc = typeConfig[task.type]
    const sb = statusBadge[task.status]

    return (
        <div className={`bg-zinc-900 border border-zinc-800 border-l-4 ${priorityBorder[task.priority]} rounded-lg p-4`}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    {/* Type + Status badges */}
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded ${tc.color}`}>
                            {tc.icon}
                            {tc.label}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${sb.color}`}>
                            {sb.label}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-semibold text-zinc-100 leading-tight">
                        {task.title}
                    </h3>

                    {/* WO ref + assignee */}
                    <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                        <span className="font-mono">{task.workOrderRef}</span>
                        <span className="text-zinc-700">|</span>
                        <div className="flex items-center gap-1.5">
                            <UserAvatar initials={task.assigneeInitials} color={task.assigneeColor} size="sm" />
                            <span>{task.assigneeName}</span>
                        </div>
                    </div>

                    {/* Blocked info */}
                    {task.blockedBy && task.blockedBy.length > 0 && (
                        <p className="mt-1.5 text-[11px] text-red-400">
                            Blocked by #{task.blockedBy.join(', #')}
                        </p>
                    )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-1.5">
                    {task.status === 'pending' && onStart && (
                        <button onClick={() => onStart(task.id)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded transition">
                            <Play className="w-3 h-3" /> Start
                        </button>
                    )}
                    {task.status === 'in-progress' && onComplete && (
                        <button onClick={() => onComplete(task.id)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded transition">
                            <CheckCircle className="w-3 h-3" /> Complete
                        </button>
                    )}
                    {onView && (
                        <button onClick={() => onView(task.id)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-700 hover:border-zinc-600 rounded transition">
                            <Eye className="w-3 h-3" /> View
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
