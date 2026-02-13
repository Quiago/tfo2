'use client'

import { useOpshubStore } from '@/lib/store/opshub-store';
import { AlertTriangle, Calendar, CheckCircle2, Play } from 'lucide-react';
import { useMemo } from 'react';

// Ultra Compact SVG Gauge
const Gauge = ({ value }: { value: number }) => {
    const r = 20; // Reduced from 24
    const c = 2 * Math.PI * r;
    const offset = c - (value / 100) * c;

    return (
        <div className="relative flex items-center justify-center w-12 h-12">
            <svg className="w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r={r} stroke="#E5E7EB" strokeWidth="5" fill="transparent" />
                <circle cx="24" cy="24" r={r} stroke="#10B981" strokeWidth="5" fill="transparent" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-xs font-bold text-[var(--tp-text-heading)]">{value}%</span>
            </div>
        </div>
    )
}

// Compact Sparkline
const Sparkline = ({ data, color }: { data: number[], color: string }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - ((d - min) / range) * 100}`).join(' ');

    return (
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-5 overflow-visible">
            <polyline points={points} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

const ProgressBar = ({ value, color, label }: { value: number, color: string, label: string }) => (
    <div className="flex flex-col gap-0.5 w-full">
        <div className="flex justify-between items-end">
            <span className="text-xs font-bold text-[var(--tp-text-heading)]">{value}%</span>
        </div>
        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
        </div>
        <div className="flex justify-between">
            <span className="text-[9px] text-[var(--tp-text-muted)] uppercase tracking-wider font-semibold">{label}</span>
        </div>
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
        return myTasks.length > 0 ? myTasks[0] : null
    }, [allWorkOrders, currentUser])

    return (
        <div className="flex flex-col gap-1 w-full h-full overflow-hidden">
            {/* Top Row: Stats Grid - flex-1 to take space, min-h-0 to allow shrinking */}
            <div className="grid grid-cols-4 gap-2 flex-1 min-h-0">
                {/* 1. Health */}
                <div className="flex flex-col items-center justify-center p-1 bg-white rounded-[var(--tp-radius-md)] border border-[var(--tp-stroke-subtle)]">
                    <Gauge value={92} />
                    <span className="mt-0.5 text-[9px] font-semibold text-[var(--tp-text-muted)] uppercase">Health</span>
                </div>

                {/* 2. Last Maintenance */}
                <div className="flex flex-col items-center justify-center p-1 bg-white rounded-[var(--tp-radius-md)] border border-[var(--tp-stroke-subtle)]">
                    <div className="p-1 bg-blue-50 rounded-md mb-0.5">
                        <Calendar size={16} className="text-blue-600" />
                    </div>
                    <span className="text-xs font-bold text-[var(--tp-text-heading)]">3 days ago</span>
                    <span className="text-[9px] font-semibold text-[var(--tp-text-muted)] uppercase">Last Maint.</span>
                </div>

                {/* 3. Metrics (Stacked) */}
                <div className="flex flex-col gap-1 p-1.5 bg-white rounded-[var(--tp-radius-md)] border border-[var(--tp-stroke-subtle)] justify-center">
                    <ProgressBar value={95.8} color="#10B981" label="Uptime" />
                    <div className="h-px bg-gray-100 w-full" />
                    <ProgressBar value={96.9} color="#3B82F6" label="Efficiency" />
                </div>

                {/* 4. Sparklines (Stacked) */}
                <div className="flex flex-col gap-1 p-1.5 bg-white rounded-[var(--tp-radius-md)] border border-[var(--tp-stroke-subtle)] justify-center">
                    <div className="flex flex-col w-full">
                        <div className="flex justify-between items-center">
                            <span className="text-[9px] font-semibold text-[var(--tp-text-muted)] uppercase">Energ</span>
                            <span className="text-[10px] font-bold text-[var(--tp-text-heading)]">114kW</span>
                        </div>
                        <Sparkline data={[40, 60, 45, 70, 65, 80, 75, 50]} color="#10B981" />
                    </div>
                    <div className="h-px bg-gray-100 w-full" />
                    <div className="flex flex-col w-full">
                        <div className="flex justify-between items-center">
                            <span className="text-[9px] font-semibold text-[var(--tp-text-muted)] uppercase">Cycl</span>
                            <span className="text-[10px] font-bold text-[var(--tp-text-heading)]">1.2k</span>
                        </div>
                        <Sparkline data={[20, 30, 25, 40, 35, 50, 45, 60]} color="#F59E0B" />
                    </div>
                </div>
            </div>

            {/* Bottom Row: Latest Task Card - Fixed Height (Very Small) */}
            {latestTask ? (
                <div className="flex items-center justify-between w-full bg-white rounded-[var(--tp-radius-md)] border border-[var(--tp-stroke-subtle)] p-1.5 shadow-sm h-[38px] flex-shrink-0">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex-shrink-0">
                            <AlertTriangle size={10} />
                        </div>
                        <div className="flex flex-col overflow-hidden leading-tight">
                            <div className="flex items-center gap-1">
                                <span className="text-[9px] font-bold text-orange-600 uppercase">Priority</span>
                            </div>
                            <span className="text-[11px] font-semibold text-[var(--tp-text-heading)] truncate w-[180px]">{latestTask.title}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button className="flex items-center gap-1.5 px-3 py-1 bg-[var(--tp-text-heading)] text-white rounded text-[10px] font-semibold hover:opacity-90 transition-opacity">
                            <Play size={10} fill="currentColor" />
                            <span>Start</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center w-full bg-white rounded-[var(--tp-radius-md)] border border-[var(--tp-stroke-subtle)] p-1 h-[38px] text-zinc-400 text-[10px] flex-shrink-0">
                    <CheckCircle2 size={12} className="mr-1.5" />
                    No pending tasks
                </div>
            )}
        </div>
    )
}
