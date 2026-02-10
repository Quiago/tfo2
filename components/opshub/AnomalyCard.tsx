'use client'

import { useOpshubStore } from '@/lib/store/opshub-store'
import type { DetectedAnomaly } from '@/lib/types/opshub'
import {
    Box,
    CheckCircle,
    Clock,
    DollarSign,
    Search,
    Workflow,
    XCircle
} from 'lucide-react'

interface AnomalyCardProps {
    anomaly: DetectedAnomaly
}

export function AnomalyCard({ anomaly }: AnomalyCardProps) {
    const { approveAnomaly, rejectAnomaly, investigateAnomaly } = useOpshubStore()

    const severityConfig: Record<string, { color: string; bgColor: string; dotColor: string }> = {
        critical: {
            color: 'text-red-400',
            bgColor: 'bg-zinc-900 border-zinc-800',
            dotColor: 'bg-red-500'
        },
        high: {
            color: 'text-orange-400',
            bgColor: 'bg-zinc-900 border-zinc-800',
            dotColor: 'bg-orange-500'
        },
        medium: {
            color: 'text-amber-400',
            bgColor: 'bg-zinc-900 border-zinc-800',
            dotColor: 'bg-amber-500'
        },
        low: {
            color: 'text-blue-400',
            bgColor: 'bg-zinc-900 border-zinc-800',
            dotColor: 'bg-blue-500'
        },
    }

    const config = severityConfig[anomaly.severity] || severityConfig.medium

    const formatCost = (cost: number) => {
        if (cost >= 10000) return `${(cost / 1000).toFixed(0)}K`
        return cost.toLocaleString()
    }

    return (
        <div className={`border rounded-lg overflow-hidden ${config.bgColor}`}>
            <div className="p-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${config.dotColor} animate-pulse`} />
                        <span className={`text-[10px] font-semibold uppercase ${config.color}`}>
                            {anomaly.severity}
                        </span>
                        <span className="text-zinc-700">&middot;</span>
                        <span className="text-xs text-zinc-500">{anomaly.factoryName}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500">
                        {Math.round(anomaly.confidence * 100)}% conf
                    </span>
                </div>

                {/* Equipment */}
                <h4 className="mt-1 text-sm font-medium text-zinc-200">
                    {anomaly.equipmentName}
                </h4>

                {/* Description */}
                <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
                    {anomaly.description}
                </p>

                {/* Context: RUL, Cost, 3D Link */}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                    {anomaly.remainingUsefulLife && (
                        <div className="flex items-center gap-1 text-amber-400">
                            <Clock className="w-3 h-3" />
                            <span className="font-medium">RUL: {anomaly.remainingUsefulLife}</span>
                        </div>
                    )}

                    {anomaly.estimatedCostIfIgnored && (
                        <div className="flex items-center gap-1 text-red-400">
                            <DollarSign className="w-3 h-3" />
                            <span className="font-medium">Risk: {formatCost(anomaly.estimatedCostIfIgnored)}</span>
                        </div>
                    )}

                    {anomaly.digitalTwinAssetId && (
                        <button className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition">
                            <Box className="w-3 h-3" />
                            <span>View in 3D</span>
                        </button>
                    )}
                </div>

                {/* Suggested workflow */}
                {anomaly.suggestedWorkflowName && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
                        <Workflow className="w-3 h-3" />
                        <span>Suggested:</span>
                        <span className="font-medium text-zinc-300">
                            {anomaly.suggestedWorkflowName}
                        </span>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3">
                    <button
                        onClick={() => approveAnomaly(anomaly.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded transition"
                    >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approve & Create WO
                    </button>
                    <button
                        onClick={() => rejectAnomaly(anomaly.id)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 rounded transition"
                    >
                        <XCircle className="w-3.5 h-3.5" />
                        Dismiss
                    </button>
                    {anomaly.status !== 'investigating' && (
                        <button
                            onClick={() => investigateAnomaly(anomaly.id)}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition"
                        >
                            <Search className="w-3.5 h-3.5" />
                            Investigate
                        </button>
                    )}
                    {anomaly.status === 'investigating' && (
                        <span className="flex items-center gap-1 px-2 py-1 text-xs text-amber-400">
                            <Search className="w-3.5 h-3.5 animate-pulse" />
                            Investigating...
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
