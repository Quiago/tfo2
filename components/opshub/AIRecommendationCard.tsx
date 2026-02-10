'use client'

import { Bot, Check, ChevronDown, ChevronUp, Edit, X } from 'lucide-react'
import { useState } from 'react'

interface AIRecommendationCardProps {
    onApprove?: () => void
    onEdit?: () => void
    onReject?: () => void
}

export function AIRecommendationCard({ onApprove, onEdit, onReject }: AIRecommendationCardProps) {
    const [expanded, setExpanded] = useState(false)

    return (
        <div className="bg-violet-950/20 border border-violet-900/40 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bot className="w-5 h-5 text-violet-400" />
                        <span className="text-sm font-bold text-violet-300">AI RECOMMENDATION</span>
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-900/40 text-amber-400 rounded">Pending Review</span>
                    </div>
                    <button onClick={() => setExpanded(!expanded)} className="p-1 text-violet-400 hover:text-violet-300">
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>

                {/* Pattern detected */}
                <div className="mt-3 space-y-2">
                    <div>
                        <p className="text-[10px] text-violet-400/60 uppercase font-semibold">Pattern Detected</p>
                        <p className="text-sm text-violet-200">Bearing inner race degradation — vibration signature matches 3 previous failures across Munich and Shanghai</p>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs">
                        <div>
                            <span className="text-violet-400/60">Confidence:</span>
                            <span className="ml-1 text-violet-200 font-semibold">87%</span>
                        </div>
                        <div>
                            <span className="text-violet-400/60">Prevention Value:</span>
                            <span className="ml-1 text-emerald-400 font-semibold">EUR 8,500</span>
                        </div>
                        <div>
                            <span className="text-violet-400/60">Early Detection:</span>
                            <span className="ml-1 text-cyan-400 font-semibold">72h before failure</span>
                        </div>
                    </div>
                    <div>
                        <span className="text-[10px] text-violet-400/60">Data Sources:</span>
                        <span className="ml-1 text-xs text-violet-300">Vibration sensor, acoustic analysis, oil analysis, temperature probe, cross-facility DB</span>
                    </div>
                    <div>
                        <span className="text-[10px] text-violet-400/60">Applicable Facilities:</span>
                        <span className="ml-1 text-xs text-violet-300">Munich, Shanghai, Detroit (similar motor fleet)</span>
                    </div>
                </div>
            </div>

            {/* Expanded: Workflow + SOP preview */}
            {expanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-violet-900/30 pt-3">
                    {/* Workflow Preview */}
                    <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3">
                        <h4 className="text-xs font-semibold text-cyan-400 mb-2">Generated Workflow</h4>
                        <div className="space-y-1.5 text-xs text-zinc-400">
                            <p><span className="text-zinc-500">TRIGGER:</span> Vibration RMS &gt; 4.0 mm/s for &gt; 30min</p>
                            <p><span className="text-zinc-500">CONDITION:</span> Equipment type = Motor AND bearing_age &gt; 15000h</p>
                            <p><span className="text-zinc-500">ACTION 1:</span> Create Work Order (priority: critical)</p>
                            <p><span className="text-zinc-500">ACTION 2:</span> Reserve spare bearing from inventory</p>
                            <p><span className="text-zinc-500">ACTION 3:</span> Notify shift supervisor + schedule downtime</p>
                            <p><span className="text-zinc-500">ACTION 4:</span> Attach SOP-M-047 to work order</p>
                        </div>
                    </div>

                    {/* SOP Preview */}
                    <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3">
                        <h4 className="text-xs font-semibold text-emerald-400 mb-2">Generated SOP: Bearing Replacement</h4>
                        <div className="flex gap-4 text-xs text-zinc-400 mb-2">
                            <span>5 steps</span>
                            <span>Est. 2h</span>
                            <span>1 spare part required</span>
                        </div>
                        <ol className="space-y-1 text-xs text-zinc-500 list-decimal list-inside">
                            <li>LOTO: Lock out / tag out motor (15min)</li>
                            <li>Remove coupling guard and end cap (20min)</li>
                            <li>Extract old bearing with puller tool (20min)</li>
                            <li>Install new SKF-6205, apply lubricant (30min)</li>
                            <li>Reassemble, verify vibration &lt; 2.5 mm/s (35min)</li>
                        </ol>
                    </div>

                    {/* AI Note */}
                    <div className="bg-violet-950/30 border border-violet-900/30 rounded-lg p-3">
                        <p className="text-xs text-violet-300/70 italic">
                            Note: Ahmed (Terminal B, Riyadh) reported similar vibration pattern last week. His investigation confirmed bearing degradation on a matching SKF-6205 motor. Applying this protocol proactively could prevent the same failure at multiple facilities.
                        </p>
                    </div>
                </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2 px-4 py-3 border-t border-violet-900/30 bg-violet-950/10">
                <button
                    onClick={onApprove}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded transition"
                >
                    <Check className="w-3.5 h-3.5" /> Approve & Publish
                </button>
                <button
                    onClick={onEdit}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 border border-zinc-700 hover:bg-zinc-800 rounded transition"
                >
                    <Edit className="w-3.5 h-3.5" /> Edit First
                </button>
                <button
                    onClick={onReject}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-950/30 rounded transition"
                >
                    <X className="w-3.5 h-3.5" /> Reject
                </button>
            </div>
        </div>
    )
}
