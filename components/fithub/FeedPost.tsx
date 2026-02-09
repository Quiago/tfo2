'use client'

import { useFithubStore } from '@/lib/store/fithub-store'
import type { FithubPost } from '@/lib/types/fithub'
import {
    AlertCircle,
    AlertTriangle,
    ArrowUp,
    Bot,
    CheckCircle,
    GitMerge,
    GitPullRequest,
    HelpCircle,
    Lightbulb,
    Megaphone,
    MessageSquare,
    User,
    XCircle
} from 'lucide-react'

// Time ago formatter
function timeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
}

interface FeedPostProps {
    post: FithubPost
}

/**
 * FeedPost: Individual post card component
 * Displays post with type icon, author, content, and interactions
 */
export function FeedPost({ post }: FeedPostProps) {
    const { upvotePost } = useFithubStore()

    // Type icons and colors
    const typeConfig: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
        insight: {
            icon: <Lightbulb className="w-4 h-4" />,
            color: 'text-amber-600 dark:text-amber-400',
            bgColor: 'bg-amber-100 dark:bg-amber-900/30'
        },
        question: {
            icon: <HelpCircle className="w-4 h-4" />,
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-100 dark:bg-blue-900/30'
        },
        issue: {
            icon: <AlertCircle className="w-4 h-4" />,
            color: 'text-red-600 dark:text-red-400',
            bgColor: 'bg-red-100 dark:bg-red-900/30'
        },
        pull_request: {
            icon: <GitPullRequest className="w-4 h-4" />,
            color: 'text-purple-600 dark:text-purple-400',
            bgColor: 'bg-purple-100 dark:bg-purple-900/30'
        },
        announcement: {
            icon: <Megaphone className="w-4 h-4" />,
            color: 'text-emerald-600 dark:text-emerald-400',
            bgColor: 'bg-emerald-100 dark:bg-emerald-900/30'
        },
        anomaly_alert: {
            icon: <AlertTriangle className="w-4 h-4" />,
            color: 'text-orange-600 dark:text-orange-400',
            bgColor: 'bg-orange-100 dark:bg-orange-900/30'
        },
    }

    // Status badges
    const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
        open: { icon: <AlertCircle className="w-3 h-3" />, color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30', label: 'Open' },
        resolved: { icon: <CheckCircle className="w-3 h-3" />, color: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30', label: 'Resolved' },
        merged: { icon: <GitMerge className="w-3 h-3" />, color: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30', label: 'Merged' },
        rejected: { icon: <XCircle className="w-3 h-3" />, color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30', label: 'Rejected' },
        pending: { icon: <AlertTriangle className="w-3 h-3" />, color: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30', label: 'Pending' },
    }

    const config = typeConfig[post.type] || typeConfig.insight
    const status = post.status ? statusConfig[post.status] : null

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden hover:border-slate-300 dark:hover:border-slate-600 transition">
            <div className="p-4">
                {/* Header row */}
                <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${post.authorType === 'ai_agent'
                                ? 'bg-gradient-to-br from-violet-500 to-purple-600'
                                : post.authorType === 'system'
                                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                                    : 'bg-gradient-to-br from-slate-400 to-slate-500'
                            }`}>
                            {post.authorAvatar || (post.authorType === 'ai_agent' ? '🤖' : post.authorType === 'system' ? '📢' : '👤')}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {/* Author and meta row */}
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                                {post.authorName}
                            </span>
                            {post.authorType === 'ai_agent' && (
                                <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 rounded">
                                    <Bot className="w-3 h-3" />
                                    AI
                                </span>
                            )}
                            {post.authorType === 'human' && (
                                <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded">
                                    <User className="w-3 h-3" />
                                </span>
                            )}
                            <span className="text-slate-400 dark:text-slate-500">·</span>
                            <span className="text-slate-500 dark:text-slate-400">{timeAgo(post.createdAt)}</span>

                            {/* Type badge */}
                            <span className={`flex items-center gap-1 px-1.5 py-0.5 text-xs rounded ${config.bgColor} ${config.color}`}>
                                {config.icon}
                            </span>

                            {/* Status badge */}
                            {status && (
                                <span className={`flex items-center gap-1 px-1.5 py-0.5 text-xs rounded ${status.color}`}>
                                    {status.icon}
                                    {status.label}
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
                            {post.title}
                        </h3>

                        {/* Content preview */}
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-3 whitespace-pre-wrap">
                            {post.content.replace(/\*\*/g, '').replace(/\n\n/g, '\n')}
                        </p>

                        {/* Tags */}
                        {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                                {post.tags.slice(0, 4).map(tag => (
                                    <span
                                        key={tag}
                                        className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-full"
                                    >
                                        {tag}
                                    </span>
                                ))}
                                {post.tags.length > 4 && (
                                    <span className="px-2 py-0.5 text-xs text-slate-400">
                                        +{post.tags.length - 4}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Actions row */}
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={() => upvotePost(post.id)}
                                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition"
                            >
                                <ArrowUp className="w-4 h-4" />
                                <span>{post.upvotes}</span>
                            </button>
                            <button className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition">
                                <MessageSquare className="w-4 h-4" />
                                <span>{post.comments}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
