'use client'

import { useOpshubStore } from '@/lib/store/opshub-store'
import { TrendingDown, TrendingUp } from 'lucide-react'

export function TotalRiskPanel() {
    const anomalies = useOpshubStore(s => s.anomalies)
    const currency = useOpshubStore(s => s.currency)
    const selectedFactoryId = useOpshubStore(s => s.selectedFactoryId)
    const factories = useOpshubStore(s => s.factories)

    // Filter anomalies by selected factory
    let filteredAnomalies = anomalies.filter(a => a.status === 'pending' || a.status === 'investigating')
    if (selectedFactoryId) {
        filteredAnomalies = filteredAnomalies.filter(a => a.factoryId === selectedFactoryId)
    }

    // Calculate total risk
    const totalRisk = filteredAnomalies.reduce((sum, a) => sum + (a.estimatedCostIfIgnored || 0), 0)

    // Count by severity
    const severityCounts = {
        critical: filteredAnomalies.filter(a => a.severity === 'critical').length,
        high: filteredAnomalies.filter(a => a.severity === 'high').length,
        medium: filteredAnomalies.filter(a => a.severity === 'medium').length,
        low: filteredAnomalies.filter(a => a.severity === 'low').length,
    }

    // Top risk items (top 3)
    const topRiskItems = [...filteredAnomalies]
        .sort((a, b) => (b.estimatedCostIfIgnored || 0) - (a.estimatedCostIfIgnored || 0))
        .slice(0, 3)

    // Mock trend (in real app, calculate from historical data)
    const trendPercent = -15
    const isTrendingDown = trendPercent < 0

    return (
        <div className="w-[280px] bg-zinc-900 border border-zinc-800 rounded-lg p-4 sticky top-4">
            {/* Header */}
            <div className="mb-4">
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide mb-1">
                    Total Risk Exposure
                </p>
                <p className="text-3xl font-bold text-red-400">
                    {currency} {totalRisk.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                    {isTrendingDown ? (
                        <TrendingDown className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                        <TrendingUp className="w-3.5 h-3.5 text-red-400" />
                    )}
                    <span className={`text-xs font-medium ${isTrendingDown ? 'text-green-400' : 'text-red-400'}`}>
                        {Math.abs(trendPercent)}% vs last week
                    </span>
                </div>
            </div>

            {/* Severity Breakdown */}
            <div className="mb-4 pb-4 border-b border-zinc-800">
                <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-zinc-400">{filteredAnomalies.length} Pending</span>
                </div>

                {/* Bar chart */}
                <div className="space-y-1.5">
                    {severityCounts.critical > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-red-500 rounded-full"
                                    style={{ width: `${(severityCounts.critical / filteredAnomalies.length) * 100}%` }}
                                />
                            </div>
                            <span className="text-xs text-zinc-400 w-16 text-right">
                                {severityCounts.critical} Critical
                            </span>
                        </div>
                    )}
                    {severityCounts.high > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-orange-500 rounded-full"
                                    style={{ width: `${(severityCounts.high / filteredAnomalies.length) * 100}%` }}
                                />
                            </div>
                            <span className="text-xs text-zinc-400 w-16 text-right">
                                {severityCounts.high} High
                            </span>
                        </div>
                    )}
                    {severityCounts.medium > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-yellow-500 rounded-full"
                                    style={{ width: `${(severityCounts.medium / filteredAnomalies.length) * 100}%` }}
                                />
                            </div>
                            <span className="text-xs text-zinc-400 w-16 text-right">
                                {severityCounts.medium} Medium
                            </span>
                        </div>
                    )}
                    {severityCounts.low > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${(severityCounts.low / filteredAnomalies.length) * 100}%` }}
                                />
                            </div>
                            <span className="text-xs text-zinc-400 w-16 text-right">
                                {severityCounts.low} Low
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Top Risk Items */}
            {topRiskItems.length > 0 && (
                <div className="mb-4">
                    <p className="text-xs text-zinc-400 font-medium mb-2">Top Risk Items:</p>
                    <div className="space-y-2">
                        {topRiskItems.map(anomaly => (
                            <div key={anomaly.id} className="flex items-start justify-between gap-2">
                                <span className="text-xs text-zinc-300 line-clamp-1 flex-1">
                                    {anomaly.equipmentName}
                                </span>
                                <span className="text-xs text-red-400 font-medium whitespace-nowrap">
                                    {currency} {(anomaly.estimatedCostIfIgnored || 0).toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* View All Button */}
            <button
                onClick={() => {
                    // Filter feed to show only anomalies
                    useOpshubStore.getState().toggleAnomaliesOnly()
                }}
                className="w-full px-3 py-2 text-xs font-medium text-cyan-400 hover:text-cyan-300 hover:bg-zinc-800 rounded-md transition-colors"
            >
                View All Anomalies →
            </button>
        </div>
    )
}
