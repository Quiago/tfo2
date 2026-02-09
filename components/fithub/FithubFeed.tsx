'use client'

import { useFithubStore } from '@/lib/store/fithub-store'
import type { FeedFilter } from '@/lib/types/fithub'
import {
    AlertCircle,
    AlertTriangle,
    Filter,
    HelpCircle,
    Lightbulb,
    Megaphone,
    Workflow
} from 'lucide-react'
import { AnomalyCard } from './AnomalyCard'
import { FeedPost } from './FeedPost'
import { FithubInput } from './FithubInput'

/**
 * FithubFeed: Main feed area with input bar and posts
 * Reddit/StackOverflow style with filtering
 */
export function FithubFeed() {
    const {
        feedFilter,
        setFeedFilter,
        getFilteredFeed,
        getPendingAnomalies,
        showOnlyAnomalies,
        toggleAnomaliesOnly,
    } = useFithubStore()

    const filteredFeed = getFilteredFeed()
    const pendingAnomalies = getPendingAnomalies()

    // Filter options
    const filterOptions: { value: FeedFilter; label: string; icon: React.ReactNode }[] = [
        { value: 'all', label: 'All', icon: null },
        { value: 'insight', label: 'Insights', icon: <Lightbulb className="w-3.5 h-3.5" /> },
        { value: 'question', label: 'Questions', icon: <HelpCircle className="w-3.5 h-3.5" /> },
        { value: 'issue', label: 'Issues', icon: <AlertCircle className="w-3.5 h-3.5" /> },
        { value: 'pull_request', label: 'Workflows', icon: <Workflow className="w-3.5 h-3.5" /> },
        { value: 'announcement', label: 'News', icon: <Megaphone className="w-3.5 h-3.5" /> },
    ]

    return (
        <div className="max-w-3xl mx-auto py-6 px-4">
            {/* Header */}
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                Home
            </h1>

            {/* Input Box */}
            <FithubInput />

            {/* Pending Anomalies Section */}
            {pendingAnomalies.length > 0 && (
                <div className="mt-6 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Pending Anomalies ({pendingAnomalies.length})
                        </h2>
                        <button
                            onClick={toggleAnomaliesOnly}
                            className={`ml-auto text-xs px-2 py-1 rounded ${showOnlyAnomalies
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            {showOnlyAnomalies ? 'Show all' : 'Focus'}
                        </button>
                    </div>
                    <div className="space-y-2">
                        {pendingAnomalies.slice(0, 3).map(anomaly => (
                            <AnomalyCard key={anomaly.id} anomaly={anomaly} />
                        ))}
                    </div>
                </div>
            )}

            {/* Feed Section */}
            <div className="mt-6">
                {/* Filter Bar */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Feed
                    </span>
                    <div className="flex items-center gap-1">
                        <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
                        {filterOptions.map(option => (
                            <button
                                key={option.value}
                                onClick={() => setFeedFilter(option.value)}
                                className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-full transition ${feedFilter === option.value
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium'
                                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                            >
                                {option.icon}
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Posts */}
                {filteredFeed.length === 0 ? (
                    <div className="py-12 text-center">
                        <p className="text-slate-400 dark:text-slate-500">
                            No posts match your filters
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredFeed.map(post => (
                            <FeedPost key={post.id} post={post} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
