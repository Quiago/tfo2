'use client'

import { useOpshubMockData } from '@/lib/hooks/useOpshubMockData'
import { useOpshubStore } from '@/lib/store/opshub-store'
import { ClipboardList, Home, ListTodo } from 'lucide-react'
import { MyTasks } from './MyTasks'
import { OpshubHome } from './OpshubHome'
import { WorkOrderDetail } from './WorkOrderDetail'
import { WorkOrderList } from './WorkOrderList'

// TODO: import from opshub types when available
export type OpshubTab = 'home' | 'my-tasks' | 'work-orders'

const TABS: { id: OpshubTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'my-tasks', label: 'My Tasks', icon: <ListTodo className="w-4 h-4" /> },
    { id: 'work-orders', label: 'Work Orders', icon: <ClipboardList className="w-4 h-4" /> },
]

export function OpshubLayout() {
    useOpshubMockData()

    const activeTab = useOpshubStore(s => s.activeTab)
    const setActiveTab = useOpshubStore(s => s.setActiveTab)
    const selectedWorkOrderId = useOpshubStore(s => s.selectedWorkOrderId)
    const setSelectedWorkOrderId = useOpshubStore(s => s.setSelectedWorkOrderId)
    const anomalies = useOpshubStore(s => s.anomalies)

    const pendingCount = anomalies.filter(a => a.status === 'pending' || a.status === 'investigating').length

    // If a work order is selected, show detail view
    if (selectedWorkOrderId) {
        return (
            <div className="flex flex-col h-full w-full bg-zinc-950">
                <WorkOrderDetail
                    workOrderId={selectedWorkOrderId}
                    onBack={() => setSelectedWorkOrderId(null)}
                />
            </div>
        )
    }

    // Home tab has no tab bar (GitHub feed style)
    if (activeTab === 'home') {
        return (
            <div className="flex flex-col h-full w-full bg-zinc-950">
                <OpshubHome />
            </div>
        )
    }

    // Other tabs (My Tasks, Work Orders) have the tab bar
    return (
        <div className="flex flex-col h-full w-full bg-zinc-950">
            {/* Tab Bar */}
            <div className="flex items-center gap-1 px-4 pt-3 pb-0 border-b border-zinc-800 bg-zinc-950">
                {TABS.map(tab => {
                    const isActive = activeTab === tab.id
                    const badge = tab.id === 'home' && pendingCount > 0 ? pendingCount : null
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors relative ${isActive
                                ? 'text-cyan-400 bg-zinc-900 border-b-2 border-cyan-500'
                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                            {badge !== null && (
                                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded-full min-w-[18px] text-center">
                                    {badge}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'my-tasks' && <MyTasks />}
                {activeTab === 'work-orders' && (
                    <WorkOrderList onSelectWorkOrder={setSelectedWorkOrderId} />
                )}
            </div>
        </div>
    )
}
