'use client'

import { useOpshubStore } from '@/lib/store/opshub-store'
import { ClipboardList } from 'lucide-react'

export function WorkOrderShortcutList() {
    const getLatestWorkOrders = useOpshubStore(s => s.getLatestWorkOrders)
    const setSelectedWorkOrderId = useOpshubStore(s => s.setSelectedWorkOrderId)
    const setActiveTab = useOpshubStore(s => s.setActiveTab)

    const latestWorkOrders = getLatestWorkOrders()

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical':
                return 'bg-red-500'
            case 'high':
                return 'bg-orange-500'
            case 'medium':
                return 'bg-yellow-500'
            case 'low':
                return 'bg-blue-500'
            default:
                return 'bg-zinc-500'
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open':
                return 'bg-blue-900/30 text-blue-400 border-blue-800'
            case 'in-progress':
                return 'bg-amber-900/30 text-amber-400 border-amber-800'
            case 'resolved':
                return 'bg-green-900/30 text-green-400 border-green-800'
            case 'closed':
                return 'bg-zinc-800 text-zinc-400 border-zinc-700'
            default:
                return 'bg-zinc-800 text-zinc-400 border-zinc-700'
        }
    }

    const handleViewAll = () => {
        setActiveTab('work-orders')
    }

    return (
        <div className="mt-4">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3 px-2">
                <ClipboardList className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-zinc-300">Latest Work Orders</h3>
            </div>

            {/* Work Order List */}
            <div className="space-y-1">
                {latestWorkOrders.length === 0 ? (
                    <div className="px-2 py-4 text-center">
                        <p className="text-xs text-zinc-500">No work orders</p>
                    </div>
                ) : (
                    latestWorkOrders.map(wo => (
                        <button
                            key={wo.id}
                            onClick={() => setSelectedWorkOrderId(wo.id)}
                            className="w-full px-2 py-2.5 text-left hover:bg-zinc-800/50 rounded-md transition-colors group border-b border-zinc-800/30 last:border-0"
                        >
                            {/* WO-ID - status - priority */}
                            <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 mb-1 text-[10px] font-mono leading-tight">
                                <span className="text-zinc-500 whitespace-nowrap">{wo.number}</span>
                                <span className="text-zinc-700 hidden sm:inline">-</span>
                                <span className={`font-medium whitespace-nowrap ${wo.status === 'open' ? 'text-emerald-400' :
                                    wo.status === 'in-progress' ? 'text-cyan-400' :
                                        wo.status === 'resolved' ? 'text-purple-400' :
                                            'text-zinc-500'
                                    }`}>
                                    {wo.status.replace('-', '_')}
                                </span>
                                <span className="text-zinc-700 hidden sm:inline">-</span>
                                <span className={`font-medium whitespace-nowrap ${wo.priority === 'critical' ? 'text-red-400' :
                                    wo.priority === 'high' ? 'text-orange-400' :
                                        wo.priority === 'medium' ? 'text-amber-400' :
                                            'text-blue-400'
                                    }`}>
                                    {wo.priority}
                                </span>
                            </div>

                            {/* Title */}
                            <p className="text-xs text-zinc-300 line-clamp-2 group-hover:text-white transition-colors">
                                {wo.title}
                            </p>
                        </button>
                    ))
                )}
            </div>

            {/* View All Button */}
            {latestWorkOrders.length > 0 && (
                <button
                    onClick={handleViewAll}
                    className="w-full mt-3 px-3 py-2 text-xs font-medium text-cyan-400 hover:text-cyan-300 hover:bg-zinc-800 rounded-md transition-colors"
                >
                    View All Work Orders →
                </button>
            )}
        </div>
    )
}
