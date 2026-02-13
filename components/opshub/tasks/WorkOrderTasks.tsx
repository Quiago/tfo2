'use client'

import { useOpshubStore } from '@/lib/store/opshub-store'
import { useTfoStore } from '@/lib/store/tfo-store'
import { WorkOrderTaskCard } from './WorkOrderTaskCard'

import s from '@/styles/opshub/work-orders.module.css'

interface WorkOrderTasksProps {
    workOrderId: string
}

export function WorkOrderTasks({ workOrderId }: WorkOrderTasksProps) {
    const workOrder = useOpshubStore(s => s.workOrders.find(w => w.id === workOrderId))
    const updateTask = useOpshubStore(s => s.updateTask)
    const updateWorkOrder = useOpshubStore(s => s.updateWorkOrder)
    const setActiveModule = useTfoStore(s => s.setActiveModule)

    if (!workOrder) return null

    const tasks = workOrder.tasks
    const completedCount = tasks.filter(t => t.status === 'completed').length

    const handleStart = (taskId: string) => {
        updateTask(workOrderId, taskId, { status: 'in-progress' })
        if (workOrder.status === 'open') {
            updateWorkOrder(workOrderId, { status: 'in-progress' })
        }
    }

    const handleCreateWorkflow = () => {
        setActiveModule('workflows')
    }

    const handleComplete = (taskId: string) => {
        // Complete current task
        updateTask(workOrderId, taskId, { status: 'completed' })

        // Check if ALL tasks are now completed (including this one)
        const allCompleted = tasks.every(t =>
            t.id === taskId || t.status === 'completed'
        )

        if (allCompleted) {
            updateWorkOrder(workOrderId, { status: 'resolved' })
        }

        // Check for dependents to unblock
        const currentTask = tasks.find(t => t.id === taskId)
        if (currentTask) {
            tasks.forEach(t => {
                if (t.dependsOn?.includes(String(currentTask.number))) {
                    const remainingDeps = t.dependsOn.filter(d => d !== String(currentTask.number))
                    // If no more deps, unblock it (set to pending if it was blocked)
                    if (t.isBlocked && remainingDeps.length === 0) {
                        updateTask(workOrderId, t.id, { isBlocked: false, status: 'pending' })
                    }
                }
            })
        }
    }

    return (
        <div className={s.tabContainer}>
            {/* Progress */}
            <div className={s.tabSection}>
                <div className={s.sectionTitle}>Progress</div>
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                            style={{ width: tasks.length > 0 ? `${(completedCount / tasks.length) * 100}%` : '0%' }}
                        />
                    </div>
                    <span className="text-xs text-zinc-400 font-medium">
                        {completedCount}/{tasks.length}
                    </span>
                </div>
            </div>

            {/* Task list with dependency lines */}
            <div className={s.tabSection}>
                <div className={s.sectionTitle}>Task List</div>
                <div className={s.sectionCard}>
                    {tasks.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500 text-sm">
                            No tasks assigned.
                        </div>
                    ) : (
                        tasks.map((task, i) => (
                            <div key={task.id} className={`${i !== tasks.length - 1 ? 'border-b border-zinc-800/50' : ''}`}>
                                <WorkOrderTaskCard
                                    taskNumber={task.number}
                                    type={task.type}
                                    title={task.title}
                                    assigneeName={task.assignee.name}
                                    assigneeInitials={task.assignee.avatarInitials}
                                    assigneeColor={task.assignee.avatarColor}
                                    status={task.status}
                                    blockedBy={task.dependsOn}
                                    onStart={() => handleStart(task.id)}
                                    onComplete={() => handleComplete(task.id)}
                                    onCreateWorkflow={handleCreateWorkflow}
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
