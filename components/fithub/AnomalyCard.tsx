'use client'

import { useFithubStore } from '@/lib/store/fithub-store'
import type { DetectedAnomaly } from '@/lib/types/fithub'
import {
    CheckCircle,
    Search,
    Workflow,
    XCircle
} from 'lucide-react'

interface AnomalyCardProps {
    anomaly: DetectedAnomaly
}

/**
 * AnomalyCard: Compact card for pending anomalies with approve/reject/investigate actions
 */
export function AnomalyCard({ anomaly }: AnomalyCardProps) {
    const { approveAnomaly, rejectAnomaly, investigateAnomaly } = useFithubStore()

    // Severity colors
    const severityConfig: Record<string, { color: string; bgColor: string; dotColor: string }> = {
        critical: {
            color: 'text-red-700 dark:text-red-400',
            bgColor: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
            dotColor: 'bg-red-500'
        },
        high: {
            color: 'text-orange-700 dark:text-orange-400',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
            dotColor: 'bg-orange-500'
        },
        medium: {
            color: 'text-amber-700 dark:text-amber-400',
            bgColor: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
            dotColor: 'bg-amber-500'
        },
        low: {
            color: 'text-blue-700 dark:text-blue-400',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
            dotColor: 'bg-blue-500'
        },
    }

    const config = severityConfig[anomaly.severity] || severityConfig.medium

    return (
        <div className={`border rounded-lg overflow-hidden ${config.bgColor}`}>
            <div className="p-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${config.dotColor} animate-pulse`} />
                        <span className={`text-xs font-medium uppercase ${config.color}`}>
                            {anomaly.severity}
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-500">{anomaly.factoryName}</span>
                    </div>
                    <span className="text-xs text-slate-400">
                        {Math.round(anomaly.confidence * 100)}% conf
                    </span>
                </div>

                {/* Equipment */}
                <h4 className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                    {anomaly.equipmentName}
                </h4>

                {/* Description */}
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {anomaly.description}
                </p>

                {/* Suggested action */}
                {anomaly.suggestedWorkflowName && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                        <Workflow className="w-3 h-3" />
                        <span>Suggested:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                            {anomaly.suggestedWorkflowName}
                        </span>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3">
                    <button
                        onClick={() => approveAnomaly(anomaly.id)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded transition"
                    >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approve
                    </button>
                    <button
                        onClick={() => rejectAnomaly(anomaly.id)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded transition"
                    >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                    </button>
                    {anomaly.status !== 'investigating' && (
                        <button
                            onClick={() => investigateAnomaly(anomaly.id)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
                        >
                            <Search className="w-3.5 h-3.5" />
                            Investigate
                        </button>
                    )}
                    {anomaly.status === 'investigating' && (
                        <span className="flex items-center gap-1 px-2 py-1 text-xs text-amber-600 dark:text-amber-400">
                            <Search className="w-3.5 h-3.5 animate-pulse" />
                            Investigating...
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
