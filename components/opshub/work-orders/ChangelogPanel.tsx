'use client'

import { useOpshubStore } from '@/lib/store/opshub-store'
import {
    AlertTriangle,
    ExternalLink,
    Lightbulb,
    Link2,
    Rocket,
    Wrench
} from 'lucide-react'

function formatDate(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function ChangelogPanel() {
    const { changelog } = useOpshubStore()

    const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
        release: { icon: <Rocket className="w-3 h-3" />, color: 'bg-emerald-500' },
        insight: { icon: <Lightbulb className="w-3 h-3" />, color: 'bg-amber-500' },
        integration: { icon: <Link2 className="w-3 h-3" />, color: 'bg-blue-500' },
        improvement: { icon: <Wrench className="w-3 h-3" />, color: 'bg-purple-500' },
        alert: { icon: <AlertTriangle className="w-3 h-3" />, color: 'bg-red-500' },
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-zinc-800">
                <h2 className="text-sm font-semibold text-zinc-200">
                    Latest from our changelog
                </h2>
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-1.5 top-2 bottom-0 w-px bg-zinc-800" />

                    {/* Entries */}
                    <ul className="space-y-4">
                        {changelog.map((entry) => {
                            const config = typeConfig[entry.type] || typeConfig.improvement
                            return (
                                <li key={entry.id} className="relative pl-6">
                                    {/* Timeline dot */}
                                    <div className={`absolute left-0 top-1.5 w-3 h-3 rounded-full ${config.color} ring-2 ring-zinc-950`} />

                                    {/* Content */}
                                    <div className="group">
                                        <p className="text-[10px] text-zinc-500">
                                            {formatDate(entry.date)}
                                        </p>
                                        <p className="mt-0.5 text-sm text-zinc-300 font-medium line-clamp-2 group-hover:text-cyan-400 cursor-pointer transition">
                                            {entry.title}
                                        </p>
                                        {entry.factoryName && (
                                            <p className="mt-0.5 text-[10px] text-zinc-500">
                                                {entry.factoryName}
                                            </p>
                                        )}
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-800">
                <a
                    href="#"
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition"
                >
                    View activity log
                    <ExternalLink className="w-3 h-3" />
                </a>
            </div>
        </div>
    )
}
