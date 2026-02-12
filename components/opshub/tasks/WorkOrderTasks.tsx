'use client'

import { useState } from 'react'
import { WorkOrderTaskCard, type TaskStatus, type TaskType } from './WorkOrderTaskCard'

interface TaskItem {
    id: string
    taskNumber: number
    type: TaskType
    title: string
    assigneeName: string
    assigneeInitials: string
    assigneeColor: string
    status: TaskStatus
    blockedBy?: string[]
}

const MOCK_WO_TASKS: TaskItem[] = [
    { id: 't1', taskNumber: 1, type: 'investigation', title: 'Inspect Motor A7 vibration readings and acoustic signature', assigneeName: 'Klaus Muller', assigneeInitials: 'KM', assigneeColor: '#3b82f6', status: 'completed' },
    { id: 't2', taskNumber: 2, type: 'investigation', title: 'Confirm bearing degradation via oil sample analysis', assigneeName: 'Anna Schmidt', assigneeInitials: 'AS', assigneeColor: '#8b5cf6', status: 'in-progress' },
    { id: 't3', taskNumber: 3, type: 'execution', title: 'Replace bearing SKF-6205 following SOP-M-047', assigneeName: 'Klaus Muller', assigneeInitials: 'KM', assigneeColor: '#3b82f6', status: 'blocked', blockedBy: ['2'] },
    { id: 't4', taskNumber: 4, type: 'verification', title: 'Post-replacement vibration test — confirm RMS < 2.5 mm/s', assigneeName: 'Klaus Muller', assigneeInitials: 'KM', assigneeColor: '#3b82f6', status: 'pending', blockedBy: ['3'] },
    { id: 't5', taskNumber: 5, type: 'approval', title: 'Sign off work order and update maintenance log', assigneeName: 'Hans Weber', assigneeInitials: 'HW', assigneeColor: '#f59e0b', status: 'pending', blockedBy: ['4'] },
]

export function WorkOrderTasks() {
    const [tasks, setTasks] = useState(MOCK_WO_TASKS)

    const handleStart = (id: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'in-progress' as TaskStatus } : t))
    }

    const handleComplete = (id: string) => {
        setTasks(prev => {
            const updated = prev.map(t => t.id === id ? { ...t, status: 'completed' as TaskStatus } : t)
            // Unblock tasks that were blocked by this one
            const completed = updated.find(t => t.id === id)
            if (completed) {
                return updated.map(t => {
                    if (t.blockedBy?.includes(String(completed.taskNumber))) {
                        const remaining = t.blockedBy.filter(b => b !== String(completed.taskNumber))
                        return { ...t, blockedBy: remaining, status: remaining.length === 0 ? 'pending' as TaskStatus : t.status }
                    }
                    return t
                })
            }
            return updated
        })
    }

    const completedCount = tasks.filter(t => t.status === 'completed').length

    return (
        <div className="space-y-4">
            {/* Progress */}
            <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                        style={{ width: `${(completedCount / tasks.length) * 100}%` }}
                    />
                </div>
                <span className="text-xs text-zinc-400 font-medium">
                    {completedCount}/{tasks.length}
                </span>
            </div>

            {/* Task list with dependency lines */}
            <div className="border border-zinc-800 rounded-md overflow-hidden bg-zinc-900/50">
                {tasks.map((task, i) => (
                    <div key={task.id} className={`${i !== tasks.length - 1 ? 'border-b border-zinc-800/50' : ''}`}>
                        <WorkOrderTaskCard
                            taskNumber={task.taskNumber}
                            type={task.type}
                            title={task.title}
                            assigneeName={task.assigneeName}
                            assigneeInitials={task.assigneeInitials}
                            assigneeColor={task.assigneeColor}
                            status={task.status}
                            blockedBy={task.blockedBy}
                            onStart={() => handleStart(task.id)}
                            onComplete={() => handleComplete(task.id)}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
