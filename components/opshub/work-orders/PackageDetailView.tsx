'use client'

import { ArrowLeft, BookOpen, ClipboardList, FileText, GitFork, Workflow } from 'lucide-react'
import { useState } from 'react'
import { SOPPreview } from './SOPPreview'

type PackageTab = 'summary' | 'workflow' | 'sop' | 'source'

const TABS: { id: PackageTab; label: string; icon: React.ReactNode }[] = [
    { id: 'summary', label: 'Summary', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'workflow', label: 'Workflow', icon: <Workflow className="w-4 h-4" /> },
    { id: 'sop', label: 'SOP', icon: <FileText className="w-4 h-4" /> },
    { id: 'source', label: 'Source WO', icon: <ClipboardList className="w-4 h-4" /> },
]

interface PackageDetailViewProps {
    onBack?: () => void
    onAdapt?: () => void
}

export function PackageDetailView({ onBack, onAdapt }: PackageDetailViewProps) {
    const [activeTab, setActiveTab] = useState<PackageTab>('summary')

    return (
        <div className="flex flex-col h-full bg-zinc-950">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
                {onBack && (
                    <button onClick={onBack} className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                )}
                <GitFork className="w-4 h-4 text-violet-400" />
                <div>
                    <h1 className="text-sm font-semibold text-zinc-100">Cross-Facility Package: Bearing Failure Protocol</h1>
                    <p className="text-xs text-zinc-500">From Munich Plant — Published Feb 9, 2026</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 px-4 pt-2 border-b border-zinc-800">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-t-lg transition ${
                            activeTab === tab.id
                                ? 'text-cyan-400 bg-zinc-900 border-b-2 border-cyan-500'
                                : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'summary' && (
                    <div className="max-w-2xl space-y-4">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                            <h3 className="text-sm font-bold text-zinc-100 mb-2">Package Summary</h3>
                            <div className="space-y-2 text-sm text-zinc-400">
                                <p>Proactive bearing replacement protocol developed by Munich Plant after Motor A7 failure. This package includes the complete workflow, SOP, and learnings from the original work order.</p>
                                <div className="grid grid-cols-2 gap-3 mt-3">
                                    <div className="bg-zinc-800/50 rounded p-2">
                                        <p className="text-[10px] text-zinc-500">Prevention Value</p>
                                        <p className="text-lg font-bold text-emerald-400">EUR 8,500</p>
                                    </div>
                                    <div className="bg-zinc-800/50 rounded p-2">
                                        <p className="text-[10px] text-zinc-500">Early Detection</p>
                                        <p className="text-lg font-bold text-cyan-400">72h</p>
                                    </div>
                                    <div className="bg-zinc-800/50 rounded p-2">
                                        <p className="text-[10px] text-zinc-500">Adopted By</p>
                                        <p className="text-lg font-bold text-violet-400">3 facilities</p>
                                    </div>
                                    <div className="bg-zinc-800/50 rounded p-2">
                                        <p className="text-[10px] text-zinc-500">Success Rate</p>
                                        <p className="text-lg font-bold text-emerald-400">100%</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {onAdapt && (
                            <button
                                onClick={onAdapt}
                                className="w-full py-3 text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition"
                            >
                                Adapt for Your Facility
                            </button>
                        )}
                    </div>
                )}

                {activeTab === 'workflow' && (
                    <div className="max-w-2xl bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                        <h3 className="text-sm font-bold text-cyan-400 mb-3">Workflow: Bearing Failure Early Warning</h3>
                        <div className="space-y-2 text-xs text-zinc-400">
                            <p><span className="text-zinc-500">TRIGGER:</span> Vibration RMS &gt; 4.0 mm/s sustained for &gt; 30min</p>
                            <p><span className="text-zinc-500">CONDITION:</span> Equipment = Motor, bearing_age &gt; 15000h</p>
                            <p><span className="text-zinc-500">ACTION 1:</span> Create Work Order (priority: critical, assign: shift lead)</p>
                            <p><span className="text-zinc-500">ACTION 2:</span> Reserve spare bearing from inventory (SKF-6205)</p>
                            <p><span className="text-zinc-500">ACTION 3:</span> Notify shift supervisor via push notification</p>
                            <p><span className="text-zinc-500">ACTION 4:</span> Schedule 2h downtime window in production planner</p>
                            <p><span className="text-zinc-500">ACTION 5:</span> Attach SOP-M-047 to work order</p>
                        </div>
                    </div>
                )}

                {activeTab === 'sop' && (
                    <div className="max-w-2xl">
                        <SOPPreview
                            title="SOP-M-047: Bearing Replacement Procedure"
                            version="v2.1"
                            description="Standard operating procedure for deep groove ball bearing replacement on conveyor drive motors."
                            totalDuration="~2 hours"
                            steps={[
                                { title: 'Lock out / Tag out motor', estimatedMinutes: 15, safetyNote: 'Confirm zero energy before proceeding' },
                                { title: 'Remove motor coupling guard', estimatedMinutes: 20 },
                                { title: 'Remove bearing end cap and extract old bearing', estimatedMinutes: 20, safetyNote: 'Use correct puller size' },
                                { title: 'Install new bearing SKF-6205', estimatedMinutes: 30, safetyNote: 'Do not exceed 110C temperature' },
                                { title: 'Reassemble and verify vibration < 2.5 mm/s', estimatedMinutes: 35 },
                            ]}
                            requiredParts={['SKF-6205 Bearing', 'SKF-CR-47697 Seal Kit', 'SKF-LGMT-2/1 Lubricant']}
                            requiredTools={['Bearing Puller BP-220', 'Induction Heater', 'Torque Wrench', 'Vibration Meter']}
                        />
                    </div>
                )}

                {activeTab === 'source' && (
                    <div className="max-w-2xl bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                        <h3 className="text-sm font-bold text-zinc-100 mb-3">Source Work Order: WO-4821</h3>
                        <div className="space-y-3 text-sm text-zinc-400">
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase">Facility</p>
                                <p className="text-zinc-200">Munich Plant, Germany</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase">Equipment</p>
                                <p className="text-zinc-200">Motor A7 — Conveyor Drive Line 3</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase">Root Cause</p>
                                <p className="text-zinc-200">Inner race bearing defect (fatigue failure at ~18,000 operating hours)</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase">Resolution</p>
                                <p className="text-zinc-200">Proactive bearing replacement during planned downtime. Zero unplanned downtime.</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase">Savings Achieved</p>
                                <p className="text-emerald-400 font-semibold">EUR 8,500 in avoided unplanned downtime</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
