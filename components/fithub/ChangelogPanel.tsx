'use client'

import { useFithubStore } from '@/lib/store/fithub-store'
import {
    AlertTriangle,
    ExternalLink,
    Lightbulb,
    Link2,
    Rocket,
    Wrench
} from 'lucide-react'

// Time ago formatter
function formatDate(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * ChangelogPanel: Right sidebar showing latest updates
 * GitHub-style timeline with dots and entries
 */
export function ChangelogPanel() {
    const { changelog } = useFithubStore()

    // Type icons
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
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Latest from our changelog
                </h2>
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-1.5 top-2 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />

                    {/* Entries */}
                    <ul className="space-y-4">
                        {changelog.map((entry, index) => {
                            const config = typeConfig[entry.type] || typeConfig.improvement
                            return (
                                <li key={entry.id} className="relative pl-6">
                                    {/* Timeline dot */}
                                    <div className={`absolute left-0 top-1.5 w-3 h-3 rounded-full ${config.color} ring-2 ring-white dark:ring-slate-900`} />

                                    {/* Content */}
                                    <div className="group">
                                        <p className="text-xs text-slate-400 dark:text-slate-500">
                                            {formatDate(entry.date)}
                                        </p>
                                        <p className="mt-0.5 text-sm text-slate-700 dark:text-slate-300 font-medium line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 cursor-pointer transition">
                                            {entry.title}
                                        </p>
                                        {entry.factoryName && (
                                            <p className="mt-0.5 text-xs text-slate-400">
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
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <a
                    href="#"
                    className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                    View changelog
                    <ExternalLink className="w-3 h-3" />
                </a>
            </div>
        </div>
    )
}
