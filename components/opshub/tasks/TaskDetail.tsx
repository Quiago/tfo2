'use client'

import { UserAvatar } from '@/components/shared/UserAvatar'
import s from '@/styles/opshub/work-orders.module.css'
import {
    ArrowLeft,
    CheckCircle,
    Clock,
    FlaskConical,
    Play,
    Settings,
    ShieldCheck
} from 'lucide-react'
import { TaskStatus, TaskType } from './WorkOrderTaskCard'

interface TaskDetailProps {
    task: {
        id: string
        number: number
        type: TaskType
        title: string
        description?: string
        status: TaskStatus
        assignee: {
            name: string
            avatarInitials: string
            avatarColor: string
        }
        steps?: string[]
        estimatedDuration?: string
        blockedBy?: string[]
    }
    onBack: () => void
    onStart?: () => void
    onComplete?: () => void
}

const typeIcon: Record<TaskType, React.ReactNode> = {
    investigation: <FlaskConical className="w-4 h-4" />,
    execution: <Settings className="w-4 h-4" />,
    verification: <CheckCircle className="w-4 h-4" />,
    approval: <ShieldCheck className="w-4 h-4" />,
}

export function TaskDetail({ task, onBack, onStart, onComplete }: TaskDetailProps) {
    return (
        <div className={s.taskDetailContainer}>
            {/* Header */}
            <div className={s.taskDetailHeader}>
                <button onClick={onBack} className={s.backBtn}>
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-xs text-[var(--tp-text-muted)] uppercase tracking-wider font-semibold">
                        <span>#{task.number}</span>
                        <span>•</span>
                        <span>{task.type}</span>
                    </div>
                </div>
            </div>

            <div className={s.taskDetailContent}>
                <div className={s.taskDetailMain}>
                    <h2 className={s.taskDetailTitle}>{task.title}</h2>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 mb-6">
                        <span className={`${s.tag} ${task.status === 'completed' ? s.statusResolved :
                                task.status === 'in-progress' ? s.statusProgress :
                                    task.status === 'blocked' ? 'border-red-200 bg-red-50 text-red-700' :
                                        s.statusClosed
                            }`}>
                            {task.status.replace('-', ' ').toUpperCase()}
                        </span>
                        {task.estimatedDuration && (
                            <span className="flex items-center gap-1.5 text-xs text-[var(--tp-text-muted)] bg-[var(--tp-bg-surface)] px-2 py-1 rounded border border-[var(--tp-stroke)]">
                                <Clock className="w-3 h-3" />
                                {task.estimatedDuration}
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    <div className="mb-8">
                        <h3 className={s.detailSectionTitle}>Description</h3>
                        <p className={s.taskDescription}>
                            {task.description || "No description provided for this task."}
                        </p>
                    </div>

                    {/* Steps / Checklist */}
                    {task.steps && task.steps.length > 0 && (
                        <div className="mb-8">
                            <h3 className={s.detailSectionTitle}>Checklist</h3>
                            <div className="space-y-3">
                                {task.steps.map((step, idx) => (
                                    <div key={idx} className="flex items-start gap-3 p-3 bg-[var(--tp-bg-surface)] border border-[var(--tp-stroke-subtle)] rounded-lg">
                                        <div className={`mt-0.5 w-4 h-4 rounded border ${task.status === 'completed' ? 'bg-emerald-500 border-emerald-500' : 'border-[var(--tp-stroke)]'} flex items-center justify-center`}>
                                            {task.status === 'completed' && <CheckCircle className="w-3 h-3 text-white" />}
                                        </div>
                                        <span className="text-sm text-[var(--tp-text-body)]">{step}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className={s.taskDetailSidebar}>
                    <div className={s.sidebarBox}>
                        <h4 className={s.sidebarBoxTitle}>Assignee</h4>
                        <div className="flex items-center gap-3 mt-3">
                            <UserAvatar
                                initials={task.assignee.avatarInitials}
                                color={task.assignee.avatarColor}
                                size="md"
                            />
                            <div>
                                <p className="text-sm font-medium text-[var(--tp-text-heading)]">{task.assignee.name}</p>
                                <p className="text-xs text-[var(--tp-text-muted)]">Technician</p>
                            </div>
                        </div>
                    </div>

                    {task.blockedBy && task.blockedBy.length > 0 && (
                        <div className={`${s.sidebarBox} border-red-200 bg-red-50/50`}>
                            <h4 className="text-xs font-bold text-red-700 uppercase mb-2 flex items-center gap-2">
                                <ShieldCheck className="w-3.5 h-3.5" /> Blocked By
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {task.blockedBy.map(id => (
                                    <span key={id} className="px-2 py-1 bg-white border border-red-200 rounded text-xs font-medium text-red-600">
                                        Task #{id}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-3 mt-4">
                        {task.status === 'pending' && onStart && (
                            <button
                                onClick={onStart}
                                className="w-full py-2.5 px-4 bg-[var(--tp-accent-blue)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--tp-accent-blue-light)] transition flex items-center justify-center gap-2"
                            >
                                <Play className="w-4 h-4" /> Start Task
                            </button>
                        )}
                        {task.status === 'in-progress' && onComplete && (
                            <button
                                onClick={onComplete}
                                className="w-full py-2.5 px-4 bg-[var(--tp-accent-green)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--tp-accent-green-light)] transition flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="w-4 h-4" /> Mark Complete
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
