'use client'

import { ArrowLeft, Bot, RefreshCw, Zap } from 'lucide-react'
import { useState } from 'react'

interface AdaptWorkOrderProps {
    facilityName?: string
    onBack?: () => void
    onActivate?: () => void
}

interface ThresholdAdjustment {
    parameter: string
    originalValue: string
    suggestedValue: string
    unit: string
    aiSuggestion: string
}

interface PartMapping {
    original: string
    mapped: string
    available: boolean
}

const MOCK_THRESHOLDS: ThresholdAdjustment[] = [
    { parameter: 'Vibration RMS Trigger', originalValue: '4.0', suggestedValue: '3.8', unit: 'mm/s', aiSuggestion: 'Lower threshold recommended — desert conditions cause faster bearing wear' },
    { parameter: 'Bearing Age Threshold', originalValue: '15000', suggestedValue: '12000', unit: 'hours', aiSuggestion: 'Reduced due to higher ambient temperatures at Riyadh facility' },
    { parameter: 'Downtime Window', originalValue: '2', suggestedValue: '3', unit: 'hours', aiSuggestion: 'Longer window recommended — parts may need additional cleaning due to sand exposure' },
]

const MOCK_PARTS: PartMapping[] = [
    { original: 'SKF-6205 Deep Groove Bearing', mapped: 'SKF-6205-2RSH (sealed variant)', available: true },
    { original: 'SKF-CR-47697 Seal Kit', mapped: 'SKF-CR-47697 Seal Kit', available: true },
    { original: 'SKF-LGMT-2/1 Lubricant', mapped: 'SKF-LGHP-2/1 (high-temp variant)', available: false },
]

export function AdaptWorkOrder({ facilityName = 'Riyadh Terminal B', onBack, onActivate }: AdaptWorkOrderProps) {
    const [thresholds, setThresholds] = useState(MOCK_THRESHOLDS)

    const handleThresholdChange = (idx: number, value: string) => {
        setThresholds(prev => prev.map((t, i) => i === idx ? { ...t, suggestedValue: value } : t))
    }

    return (
        <div className="flex flex-col h-full bg-zinc-950">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
                {onBack && (
                    <button onClick={onBack} className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                )}
                <RefreshCw className="w-4 h-4 text-cyan-400" />
                <h1 className="text-sm font-semibold text-zinc-100">Adapt for {facilityName}</h1>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-2xl space-y-6">
                    {/* Workflow Adjustments */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                        <h3 className="text-sm font-bold text-zinc-100 mb-3 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-cyan-400" />
                            Workflow Threshold Adjustments
                        </h3>
                        <div className="space-y-4">
                            {thresholds.map((t, i) => (
                                <div key={t.parameter} className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-zinc-200">{t.parameter}</span>
                                        <span className="text-xs text-zinc-600">
                                            Original: {t.originalValue} {t.unit}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={t.suggestedValue}
                                            onChange={e => handleThresholdChange(i, e.target.value)}
                                            className="w-24 px-2 py-1 text-sm bg-zinc-800 border border-zinc-700 rounded text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        />
                                        <span className="text-xs text-zinc-500">{t.unit}</span>
                                    </div>
                                    <div className="flex items-start gap-1.5 text-[10px] text-violet-300/70">
                                        <Bot className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                        <span>{t.aiSuggestion}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SOP Part Mapping */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                        <h3 className="text-sm font-bold text-zinc-100 mb-3">SOP Parts Mapping</h3>
                        <div className="space-y-2">
                            {MOCK_PARTS.map(p => (
                                <div key={p.original} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded">
                                    <div className="min-w-0">
                                        <p className="text-xs text-zinc-500 line-through">{p.original}</p>
                                        <p className="text-sm text-zinc-200">{p.mapped}</p>
                                    </div>
                                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${p.available ? 'bg-emerald-900/40 text-emerald-400' : 'bg-red-900/40 text-red-400'}`}>
                                        {p.available ? 'Available' : 'Order Required'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Currency Conversion */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                        <h3 className="text-sm font-bold text-zinc-100 mb-2">Cost Conversion</h3>
                        <div className="flex items-center gap-4 text-sm">
                            <div>
                                <p className="text-[10px] text-zinc-500">Original (EUR)</p>
                                <p className="text-zinc-400">EUR 1,930</p>
                            </div>
                            <span className="text-zinc-600">=</span>
                            <div>
                                <p className="text-[10px] text-zinc-500">Local (SAR)</p>
                                <p className="text-lg font-bold text-zinc-100">SAR 7,720</p>
                            </div>
                        </div>
                    </div>

                    {/* Activate */}
                    <button
                        onClick={onActivate}
                        className="w-full py-3 text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition active:scale-[0.98]"
                    >
                        Activate for {facilityName}
                    </button>
                </div>
            </div>
        </div>
    )
}
