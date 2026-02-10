'use client'

import { ListTodo } from 'lucide-react'
import { useState } from 'react'
import { MyTaskCard, type TaskStatus, type WorkOrderTask } from './MyTaskCard'

// Mock tasks for demo
const MOCK_MY_TASKS: WorkOrderTask[] = [
    {
        id: 'task-1', taskNumber: 1, type: 'investigation', title: 'Investigate Motor A7 bearing vibration anomaly',
        description: 'Inspect motor A7 on Line 3. Check vibration readings, perform acoustic analysis.',
        workOrderId: 'wo-1', workOrderRef: 'WO-4821', assigneeId: 'user-1', assigneeName: 'Klaus Muller',
        assigneeInitials: 'KM', assigneeColor: '#3b82f6', status: 'in-progress', priority: 'critical',
    },
    {
        id: 'task-2', taskNumber: 2, type: 'execution', title: 'Replace bearing SKF-6205 on Motor A7',
        description: 'Follow SOP-M-047 for bearing replacement procedure.',
        workOrderId: 'wo-1', workOrderRef: 'WO-4821', assigneeId: 'user-1', assigneeName: 'Klaus Muller',
        assigneeInitials: 'KM', assigneeColor: '#3b82f6', status: 'blocked', priority: 'critical',
        blockedBy: ['1'],
    },
    {
        id: 'task-3', taskNumber: 3, type: 'verification', title: 'Verify HVAC Zone B filter replacement',
        description: 'Check air filter condition and verify energy consumption normalization.',
        workOrderId: 'wo-2', workOrderRef: 'WO-4818', assigneeId: 'user-1', assigneeName: 'Klaus Muller',
        assigneeInitials: 'KM', assigneeColor: '#3b82f6', status: 'pending', priority: 'medium',
    },
    {
        id: 'task-4', taskNumber: 4, type: 'approval', title: 'Approve weld parameter update for Cell 2',
        description: 'Review new parameters for aluminum 6061-T6 welding.',
        workOrderId: 'wo-3', workOrderRef: 'WO-4815', assigneeId: 'user-1', assigneeName: 'Klaus Muller',
        assigneeInitials: 'KM', assigneeColor: '#3b82f6', status: 'pending', priority: 'low',
    },
]

type FilterStatus = 'all' | TaskStatus

export function MyTasks() {
    const [filter, setFilter] = useState<FilterStatus>('all')
    const [tasks, setTasks] = useState(MOCK_MY_TASKS)

    const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)

    const counts = {
        all: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        'in-progress': tasks.filter(t => t.status === 'in-progress').length,
        blocked: tasks.filter(t => t.status === 'blocked').length,
        completed: tasks.filter(t => t.status === 'completed').length,
    }

    const handleStart = (id: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'in-progress' as TaskStatus } : t))
    }

    const handleComplete = (id: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'completed' as TaskStatus, completedAt: new Date().toISOString() } : t))
    }

    const filters: { value: FilterStatus; label: string }[] = [
        { value: 'all', label: 'All' },
        { value: 'in-progress', label: 'In Progress' },
        { value: 'pending', label: 'Pending' },
        { value: 'blocked', label: 'Blocked' },
        { value: 'completed', label: 'Completed' },
    ]

    return (
        <div className="max-w-3xl mx-auto py-6 px-4">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <ListTodo className="w-5 h-5 text-cyan-400" />
                    <h1 className="text-xl font-bold text-zinc-100">My Tasks</h1>
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-zinc-800 text-zinc-400 rounded-full">
                        {tasks.length}
                    </span>
                </div>
            </div>

            {/* Filter bar */}
            <div className="flex items-center gap-1 mb-4 pb-3 border-b border-zinc-800">
                {filters.map(f => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition ${
                            filter === f.value
                                ? 'bg-cyan-900/40 text-cyan-400'
                                : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
                        }`}
                    >
                        {f.label}
                        {counts[f.value] > 0 && (
                            <span className="ml-1 text-zinc-600">({counts[f.value]})</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Task list */}
            {filtered.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-sm">
                    No tasks match this filter
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(task => (
                        <MyTaskCard
                            key={task.id}
                            task={task}
                            onStart={handleStart}
                            onComplete={handleComplete}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
