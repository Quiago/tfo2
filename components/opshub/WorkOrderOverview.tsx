'use client'

import {
    Box,
    Calendar,
    CheckCircle,
    Cog,
    MapPin,
    Search
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
            {/* Dates & Meta */}
            <div className="flex items-center gap-4 text-xs text-zinc-500 border-b border-zinc-800/50 pb-4">
                <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Created <strong className="text-zinc-300">{formatDate(workOrder.createdAt)}</strong></span>
                </div>
                {workOrder.resolvedAt && (
                    <div className="flex items-center gap-1.5 text-emerald-500">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Resolved <strong>{formatDate(workOrder.resolvedAt)}</strong></span>
                    </div>
                )}
            </div>

            {/* Equipment Info */}
            <div>
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Equipment Context</h3>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-md p-4">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                        <div className="flex items-start gap-3">
                            <Cog className="w-4 h-4 text-zinc-500 mt-0.5" />
                            <div>
                                <p className="text-zinc-500 text-xs mb-0.5">Asset Name</p>
                                <p className="text-zinc-200 font-medium">{workOrder.equipmentName}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Box className="w-4 h-4 text-zinc-500 mt-0.5" />
                            <div>
                                <p className="text-zinc-500 text-xs mb-0.5">Asset ID</p>
                                <p className="text-zinc-200 font-mono text-xs">{workOrder.equipmentId}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-zinc-500 mt-0.5" />
                            <div>
                                <p className="text-zinc-500 text-xs mb-0.5">Location</p>
                                <p className="text-zinc-200">{workOrder.location}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-zinc-500 mt-0.5" />
                            <div>
                                <p className="text-zinc-500 text-xs mb-0.5">Facility</p>
                                <p className="text-zinc-200">{workOrder.factoryName}</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-zinc-800/50">
                        <button className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition hover:underline">
                            <Box className="w-3.5 h-3.5" /> Locate in Digital Twin
                        </button>
                    </div>
                </div>
            </div>

            {/* Root Cause */}
            {workOrder.rootCause && (
                <div>
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Root Cause Analysis</h3>
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-md p-4">
                        <div className="flex gap-3">
                            <Search className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-zinc-300 leading-relaxed">{workOrder.rootCause}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Spare Parts */}
            {workOrder.spareParts && workOrder.spareParts.length > 0 && (
                <div>
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Required Parts</h3>
                    <div className="border border-zinc-800 rounded-md overflow-hidden bg-zinc-900/50">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-900 border-b border-zinc-800 text-xs font-medium text-zinc-500 uppercase">
                                <tr>
                                    <th className="px-4 py-2">Part Name</th>
                                    <th className="px-4 py-2">Part #</th>
                                    <th className="px-4 py-2 text-right">Qty</th>
                                    <th className="px-4 py-2">Availability</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {workOrder.spareParts.map(part => (
                                    <tr key={part.partNumber} className="hover:bg-zinc-800/20">
                                        <td className="px-4 py-2.5 text-zinc-200">{part.name}</td>
                                        <td className="px-4 py-2.5 font-mono text-xs text-zinc-500">{part.partNumber}</td>
                                        <td className="px-4 py-2.5 text-zinc-400 text-right">{part.quantity}</td>
                                        <td className="px-4 py-2.5">
                                            <span className={`text-xs ${part.inStock ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {part.inStock ? 'In Stock' : 'On Order'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
