'use client'

import { useOpshubStore } from '@/lib/store/opshub-store'
import {
    ArrowLeft,
    FileText,
    History,
    LayoutList,
    MessageSquare,
    Workflow
} from 'lucide-react'
import { useState } from 'react'
import { WorkOrderTasks } from '../tasks/WorkOrderTasks'
import { WorkOrderActivity } from './WorkOrderActivity'
import { WorkOrderDiscussion } from './WorkOrderDiscussion'
import { WorkOrderOverview } from './WorkOrderOverview'
import { WorkOrderTeamSidebar } from './WorkOrderTeamSidebar'
import { WorkOrderWorkflows } from './WorkOrderWorkflows'

// TODO: import from opshub types when available
type WorkOrderInnerTab = 'overview' | 'tasks' | 'workflows' | 'discussion' | 'activity'

const INNER_TABS: { id: WorkOrderInnerTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <FileText className="w-4 h-4" /> },
    { id: 'tasks', label: 'Tasks', icon: <LayoutList className="w-4 h-4" /> },
    { id: 'workflows', label: 'Workflows', icon: <Workflow className="w-4 h-4" /> },
    { id: 'discussion', label: 'Discussion', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'activity', label: 'Activity', icon: <History className="w-4 h-4" /> },
]



interface WorkOrderDetailProps {
    workOrderId: string
    onBack: () => void
}

export function WorkOrderDetail({ workOrderId, onBack }: WorkOrderDetailProps) {
    const workOrder = useOpshubStore(s => s.workOrders.find(w => w.id === workOrderId))
    const [innerTab, setInnerTab] = useState<WorkOrderInnerTab>('overview')

    if (!workOrder) {
        return (
            <div className="flex items-center justify-center h-full text-zinc-500">
                Work Order not found
            </div>
        )
    }

    const statusColors: Record<string, string> = {
        open: 'text-emerald-400',
        'in-progress': 'text-cyan-400',
        resolved: 'text-purple-400',
        closed: 'text-zinc-500',
    }

    const priorityColors: Record<string, string> = {
        critical: 'text-red-400',
        high: 'text-orange-400',
        medium: 'text-amber-400',
        low: 'text-blue-400',
    }

    // Adapt store data for WorkOrderOverview
    // We might need to make some props in WorkOrderOverview optional or map them
    const overviewData = {
        status: workOrder.status,
        priority: workOrder.priority,
        createdAt: workOrder.createdAt,
        resolvedAt: workOrder.resolvedAt,
        equipmentName: workOrder.equipmentName,
        equipmentId: workOrder.equipmentId,
        location: 'Factory Floor', // Mock default for now or add to store
        factoryName: workOrder.facility || 'Unknown Facility',
        rootCause: undefined, // Add to store if needed
        spareParts: [], // Add to store if needed
        costSummary: undefined, // Add to store if needed
    }


    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-950">
                <button onClick={onBack} className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition">
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex flex-col gap-0.5">
                    <h1 className="text-sm font-semibold text-zinc-100">{workOrder.title}</h1>
                    <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="text-zinc-500">{workOrder.number}</span>
                        <span className="text-zinc-600">-</span>
                        <span className={`font-medium ${statusColors[workOrder.status]}`}>{workOrder.status}</span>
                        <span className="text-zinc-600">-</span>
                        <span className={`font-medium ${priorityColors[workOrder.priority]}`}>{workOrder.priority}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left: inner tab navigation */}
                <div className="w-44 flex-shrink-0 border-r border-zinc-800 bg-zinc-950 py-2">
                    {INNER_TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setInnerTab(tab.id)}
                            className={`flex items-center gap-2 w-full px-4 py-2 text-sm transition ${innerTab === tab.id
                                ? 'text-cyan-400 bg-cyan-950/30 border-r-2 border-cyan-500'
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Center: tab content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {innerTab === 'overview' && <WorkOrderOverview workOrder={overviewData} />}
                    {innerTab === 'tasks' && <WorkOrderTasks workOrderId={workOrderId} />}
                    {innerTab === 'workflows' && <WorkOrderWorkflows />}
                    {innerTab === 'discussion' && <WorkOrderDiscussion />}
                    {innerTab === 'activity' && <WorkOrderActivity />}
                </div>

                {/* Right: team sidebar */}
                <WorkOrderTeamSidebar
                    team={workOrder.team}
                    riskAmount={0} // Default 0 for new WOs
                    tags={workOrder.tags}
                    aiStatus={undefined}
                />
            </div>
        </div>
    )
}
