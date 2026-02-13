'use client'

import { useOpshubStore } from '@/lib/store/opshub-store';
import { AlertTriangle, Calendar, CheckCircle2, Play } from 'lucide-react';
import { useMemo } from 'react';

// Simple SVG Gauge
const Gauge = ({ value }: { value: number }) => {
    const r = 36;
    const c = 2 * Math.PI * r;
    const offset = c - (value / 100) * c;

    return (
        <div className="relative flex items-center justify-center w-24 h-24">
            <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r={r} stroke="#E5E7EB" strokeWidth="8" fill="transparent" />
                <circle cx="48" cy="48" r={r} stroke="#10B981" strokeWidth="8" fill="transparent" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-xl font-bold text-[var(--tp-text-heading)]">{value}%</span>
            </div>
        </div>
    )
}

// Simple Sparkline
const Sparkline = ({ data, color }: { data: number[], color: string }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - ((d - min) / range) * 100}`).join(' ');

    return (
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-8 overflow-visible">
            <polyline points={points} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

const ProgressBar = ({ value, color, label }: { value: number, color: string, label: string }) => (
    <div className="flex flex-col gap-1 w-full">
        <div className="flex justify-between items-end">
            <span className="text-xl font-bold text-[var(--tp-text-heading)]">{value}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
        </div>
        <span className="text-[10px] text-[var(--tp-text-muted)] uppercase tracking-wider font-semibold">{label}</span>
        <span className="text-[9px] text-gray-400">vs target</span>
    </div>
)

export function RichMachineSummary() {
    const allWorkOrders = useOpshubStore(s => s.workOrders)
    const currentUser = useOpshubStore(s => s.currentUser)

    // Get latest pending task for current user
    const latestTask = useMemo(() => {
        if (!currentUser) return null
        const myTasks = allWorkOrders.flatMap(wo =>
            wo.tasks.filter(t => t.assignee.id === currentUser.id && t.status !== 'completed')
        )
        // Sort by creation or priority? Default to newest first
        // Assuming tasks have some order, or we take the first one
        return myTasks.length > 0 ? myTasks[0] : null
    }, [allWorkOrders, currentUser])

    return (
        <div className="flex flex-col gap-3 w-full">
            {/* Top Row: Stats Grid */}
            <div className="grid grid-cols-4 gap-4 w-full">
                {/* 1. Health */}
                <div className="flex flex-col items-center justify-center p-2 bg-white rounded-[var(--tp-radius-md)] border border-[var(--tp-stroke-subtle)]">
                    <Gauge value={92} />
                    <span className="mt-1 text-xs font-semibold text-[var(--tp-text-muted)] uppercase">Health</span>
                    <span className="text-[9px] text-gray-400 text-center">System optimal</span>
                </div>

                {/* 2. Last Maintenance (Reverted) */}
                <div className="flex flex-col items-center justify-center p-2 bg-white rounded-[var(--tp-radius-md)] border border-[var(--tp-stroke-subtle)]">
                    <div className="p-2 bg-blue-50 rounded-xl mb-1">
                        <Calendar size={24} className="text-blue-600" />
                    </div>
                    <span className="text-lg font-bold text-[var(--tp-text-heading)]">3 days ago</span>
                    <span className="text-[10px] font-semibold text-[var(--tp-text-muted)] uppercase mt-1">Last Maintenance</span>
                    <span className="text-[9px] text-gray-400 text-center">Scheduled check</span>
                </div>

                {/* 3. Metrics (Stacked) */}
                <div className="flex flex-col gap-2 p-3 bg-white rounded-[var(--tp-radius-md)] border border-[var(--tp-stroke-subtle)] justify-center">
                    <ProgressBar value={95.8} color="#10B981" label="Uptime" />
                    <div className="h-px bg-gray-100 w-full" />
                    <ProgressBar value={96.9} color="#3B82F6" label="Efficiency" />
                </div>

                {/* 4. Sparklines (Stacked) */}
                <div className="flex flex-col gap-2 p-3 bg-white rounded-[var(--tp-radius-md)] border border-[var(--tp-stroke-subtle)] justify-center">
                    <div className="flex flex-col w-full">
                        <div className="flex justify-between items-center mb-0.5">
                            <span className="text-[9px] font-semibold text-[var(--tp-text-muted)] uppercase">Avg Energy</span>
                            <span className="text-sm font-bold text-[var(--tp-text-heading)]">114.9 kW</span>
                        </div>
                        <Sparkline data={[40, 60, 45, 70, 65, 80, 75, 50]} color="#10B981" />
                    </div>
                    <div className="h-px bg-gray-100 w-full" />
                    <div className="flex flex-col w-full">
                        <div className="flex justify-between items-center mb-0.5">
                            <span className="text-[9px] font-semibold text-[var(--tp-text-muted)] uppercase">Cycle Count</span>
                            <span className="text-sm font-bold text-[var(--tp-text-heading)]">1,204</span>
                        </div>
                        <Sparkline data={[20, 30, 25, 40, 35, 50, 45, 60]} color="#F59E0B" />
                    </div>
                </div>
            </div>

            {/* Bottom Row: Latest Task Card */}
            {latestTask ? (
                <div className="flex items-center justify-between w-full bg-white rounded-[var(--tp-radius-md)] border border-[var(--tp-stroke-subtle)] p-3 shadow-sm h-[60px]">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex-shrink-0">
                            <AlertTriangle size={16} />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">High Priority Task</span>
                                <span className="text-[10px] text-gray-400">• Due Today</span>
                            </div>
                            <span className="text-sm font-semibold text-[var(--tp-text-heading)] truncate">{latestTask.title}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="flex flex-col items-end mr-2 hidden xl:flex">
                            <span className="text-[10px] text-[var(--tp-text-muted)] font-medium">Estimated Time</span>
                            <span className="text-xs font-bold text-[var(--tp-text-heading)]">45m</span>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-1.5 bg-[var(--tp-text-heading)] text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity">
                            <Play size={12} fill="currentColor" />
                            <span>Start Task</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center w-full bg-white rounded-[var(--tp-radius-md)] border border-[var(--tp-stroke-subtle)] p-3 h-[60px] text-zinc-400 text-sm">
                    <CheckCircle2 size={16} className="mr-2" />
                    No pending tasks
                </div>
            )}
        </div>
    )
}
