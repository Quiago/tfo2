'use client'

import {
    Box,
    Calendar,
    CheckCircle,
    Cog,
    DollarSign,
    MapPin,
    Search,
    Wrench,
} from 'lucide-react'

interface WorkOrderOverviewProps {
    workOrder: {
        status: string
        priority: string
        createdAt: string
        resolvedAt?: string
        equipmentName: string
        equipmentId: string
        location: string
        factoryName: string
        rootCause?: string
        spareParts?: { name: string; partNumber: string; quantity: number; inStock: boolean }[]
        costSummary?: { labor: number; parts: number; downtime: number; total: number }
    }
}

const statusBadge: Record<string, string> = {
    open: 'bg-emerald-900/40 text-emerald-400',
    'in-progress': 'bg-cyan-900/40 text-cyan-400',
    resolved: 'bg-purple-900/40 text-purple-400',
    closed: 'bg-zinc-700 text-zinc-400',
}

const priorityBadge: Record<string, string> = {
    critical: 'bg-red-900/40 text-red-400',
    high: 'bg-orange-900/40 text-orange-400',
    medium: 'bg-amber-900/40 text-amber-400',
    low: 'bg-blue-900/40 text-blue-400',
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
}

export function WorkOrderOverview({ workOrder }: WorkOrderOverviewProps) {
    return (
        <div className="space-y-6">
            {/* Status + Priority + Dates */}
            <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded ${statusBadge[workOrder.status] || statusBadge.open}`}>
                    {workOrder.status.replace('-', ' ').toUpperCase()}
                </span>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded uppercase ${priorityBadge[workOrder.priority] || priorityBadge.medium}`}>
                    {workOrder.priority}
                </span>
                <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <Calendar className="w-3 h-3" />
                    Created {formatDate(workOrder.createdAt)}
                </div>
                {workOrder.resolvedAt && (
                    <div className="flex items-center gap-1 text-xs text-emerald-500">
                        <CheckCircle className="w-3 h-3" />
                        Resolved {formatDate(workOrder.resolvedAt)}
                    </div>
                )}
            </div>

            {/* Equipment Info */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Equipment</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                        <Cog className="w-4 h-4 text-zinc-500" />
                        <div>
                            <p className="text-zinc-400 text-xs">Name</p>
                            <p className="text-zinc-100 font-medium">{workOrder.equipmentName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Box className="w-4 h-4 text-zinc-500" />
                        <div>
                            <p className="text-zinc-400 text-xs">ID</p>
                            <p className="text-zinc-100 font-mono text-xs">{workOrder.equipmentId}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-zinc-500" />
                        <div>
                            <p className="text-zinc-400 text-xs">Location</p>
                            <p className="text-zinc-100">{workOrder.location}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-zinc-500" />
                        <div>
                            <p className="text-zinc-400 text-xs">Facility</p>
                            <p className="text-zinc-100">{workOrder.factoryName}</p>
                        </div>
                    </div>
                </div>
                <button className="mt-3 flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition">
                    <Box className="w-3.5 h-3.5" /> View in Digital Twin
                </button>
            </div>

            {/* Root Cause */}
            {workOrder.rootCause && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                    <h3 className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
                        <Search className="w-3.5 h-3.5" /> Root Cause
                    </h3>
                    <p className="text-sm text-zinc-300">{workOrder.rootCause}</p>
                </div>
            )}

            {/* Spare Parts */}
            {workOrder.spareParts && workOrder.spareParts.length > 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                    <h3 className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">
                        <Wrench className="w-3.5 h-3.5" /> Spare Parts
                    </h3>
                    <div className="space-y-2">
                        {workOrder.spareParts.map(part => (
                            <div key={part.partNumber} className="flex items-center justify-between text-sm">
                                <div>
                                    <span className="text-zinc-200">{part.name}</span>
                                    <span className="ml-2 text-xs font-mono text-zinc-500">{part.partNumber}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-zinc-400">x{part.quantity}</span>
                                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${part.inStock ? 'bg-emerald-900/40 text-emerald-400' : 'bg-red-900/40 text-red-400'}`}>
                                        {part.inStock ? 'In Stock' : 'Order'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Cost Summary */}
            {workOrder.costSummary && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                    <h3 className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">
                        <DollarSign className="w-3.5 h-3.5" /> Cost Summary
                    </h3>
                    <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between">
                            <span className="text-zinc-400">Labor</span>
                            <span className="text-zinc-200">EUR {workOrder.costSummary.labor.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-400">Parts</span>
                            <span className="text-zinc-200">EUR {workOrder.costSummary.parts.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-400">Downtime Cost</span>
                            <span className="text-zinc-200">EUR {workOrder.costSummary.downtime.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-1.5 mt-1.5 border-t border-zinc-800 font-semibold">
                            <span className="text-zinc-300">Total</span>
                            <span className="text-zinc-100">EUR {workOrder.costSummary.total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
