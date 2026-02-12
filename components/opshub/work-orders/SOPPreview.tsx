'use client'

import { AlertTriangle, Clock, FileText, Wrench } from 'lucide-react'

// TODO: import from opshub types when available
interface SOPStep {
    title: string
    estimatedMinutes: number
    safetyNote?: string
}

interface SOPPreviewProps {
    title: string
    version: string
    description: string
    steps: SOPStep[]
    requiredParts?: string[]
    requiredTools?: string[]
    totalDuration?: string
}

export function SOPPreview({ title, version, description, steps, requiredParts, requiredTools, totalDuration }: SOPPreviewProps) {
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-zinc-800">
                <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-zinc-100">{title}</h3>
                    <span className="px-1.5 py-0.5 text-[10px] bg-zinc-800 text-zinc-400 rounded font-mono">{version}</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">{description}</p>
                {totalDuration && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-zinc-500">
                        <Clock className="w-3 h-3" />
                        Estimated duration: {totalDuration}
                    </div>
                )}
            </div>

            {/* Steps */}
            <div className="p-4 space-y-3">
                {steps.map((step, i) => (
                    <div key={i} className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold text-zinc-400">{i + 1}</span>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-zinc-200">{step.title}</span>
                                <span className="text-[10px] text-zinc-600">{step.estimatedMinutes}min</span>
                            </div>
                            {step.safetyNote && (
                                <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-400">
                                    <AlertTriangle className="w-2.5 h-2.5" />
                                    {step.safetyNote}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Required Parts/Tools */}
            {(requiredParts?.length || requiredTools?.length) && (
                <div className="p-4 border-t border-zinc-800 flex gap-6">
                    {requiredParts && requiredParts.length > 0 && (
                        <div>
                            <h4 className="text-[10px] font-semibold text-zinc-500 uppercase mb-1 flex items-center gap-1">
                                <Wrench className="w-3 h-3" /> Parts
                            </h4>
                            <ul className="text-xs text-zinc-400 space-y-0.5">
                                {requiredParts.map(p => <li key={p}>{p}</li>)}
                            </ul>
                        </div>
                    )}
                    {requiredTools && requiredTools.length > 0 && (
                        <div>
                            <h4 className="text-[10px] font-semibold text-zinc-500 uppercase mb-1">Tools</h4>
                            <ul className="text-xs text-zinc-400 space-y-0.5">
                                {requiredTools.map(t => <li key={t}>{t}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
