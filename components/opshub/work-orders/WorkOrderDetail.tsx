'use client'

import {
    ArrowLeft,
    FileText,
    History,
    LayoutList,
    MessageSquare,
    Workflow
} from 'lucide-react'
import { useState } from 'react'
import { WorkOrderActivity } from './WorkOrderActivity'
import { WorkOrderDiscussion } from './WorkOrderDiscussion'
import { WorkOrderOverview } from './WorkOrderOverview'
import { WorkOrderTasks } from '../tasks/WorkOrderTasks'
import { WorkOrderTeamSidebar, type TeamMember } from './WorkOrderTeamSidebar'
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

// Mock data for the detail view
const MOCK_TEAM: TeamMember[] = [
    { id: 'u1', name: 'Klaus Muller', initials: 'KM', color: '#3b82f6', role: 'Lead Technician', status: 'in-field' },
    { id: 'u2', name: 'Anna Schmidt', initials: 'AS', color: '#8b5cf6', role: 'Reliability Engineer', status: 'available' },
    { id: 'u3', name: 'Hans Weber', initials: 'HW', color: '#f59e0b', role: 'Shift Supervisor', status: 'busy' },
    { id: 'ai', name: 'AI Agent', initials: 'AI', color: '#7c3aed', role: 'AI Agent', status: 'available', isAI: true },
]

const MOCK_WO_OVERVIEW = {
    status: 'in-progress',
    priority: 'critical',
    createdAt: '2026-02-09T14:30:00Z',
    equipmentName: 'Motor A7 — Conveyor Drive Line 3',
    equipmentId: 'eq-motor-a7',
    location: 'Line 3, Hall B, Ground Floor',
    factoryName: 'Munich Plant',
    rootCause: 'Inner race bearing defect detected via vibration analysis (1.2kHz peak). Degradation pattern consistent with fatigue failure after ~18,000 operating hours.',
    spareParts: [
        { name: 'Deep Groove Ball Bearing', partNumber: 'SKF-6205', quantity: 1, inStock: true },
        { name: 'Bearing Seal Kit', partNumber: 'SKF-CR-47697', quantity: 1, inStock: true },
        { name: 'Lubricant — High Temp', partNumber: 'SKF-LGMT-2/1', quantity: 1, inStock: false },
    ],
    costSummary: { labor: 450, parts: 280, downtime: 1200, total: 1930 },
}

interface WorkOrderDetailProps {
    workOrderId: string
    onBack: () => void
}

export function WorkOrderDetail({ workOrderId, onBack }: WorkOrderDetailProps) {
    const [innerTab, setInnerTab] = useState<WorkOrderInnerTab>('overview')

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-950">
                <button onClick={onBack} className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition">
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex flex-col gap-0.5">
                    <h1 className="text-sm font-semibold text-zinc-100">Motor A7 Bearing Replacement — Line 3</h1>
                    <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="text-zinc-500">WO-4821</span>
                        <span className="text-zinc-600">-</span>
                        <span className="text-cyan-400 font-medium">in_progress</span>
                        <span className="text-zinc-600">-</span>
                        <span className="text-red-400 font-medium">critical</span>
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
                    {innerTab === 'overview' && <WorkOrderOverview workOrder={MOCK_WO_OVERVIEW} />}
                    {innerTab === 'tasks' && <WorkOrderTasks />}
                    {innerTab === 'workflows' && <WorkOrderWorkflows />}
                    {innerTab === 'discussion' && <WorkOrderDiscussion />}
                    {innerTab === 'activity' && <WorkOrderActivity />}
                </div>

                {/* Right: team sidebar */}
                <WorkOrderTeamSidebar
                    team={MOCK_TEAM}
                    riskAmount={8500}
                    tags={['motors', 'predictive', 'bearing', 'line-3']}
                    aiStatus="Generated recommendation. Awaiting resolution."
                />
            </div>
        </div>
    )
}
