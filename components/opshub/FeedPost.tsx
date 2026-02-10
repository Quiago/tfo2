'use client'

import { useOpshubStore } from '@/lib/store/opshub-store'
import type { OpshubPost } from '@/lib/types/opshub'
import {
    AlertCircle,
    AlertTriangle,
    ArrowUp,
    Bot,
    CheckCircle,
    GitMerge,
    HelpCircle,
    Lightbulb,
    Megaphone,
    MessageSquare,
    Workflow,
    XCircle
} from 'lucide-react'

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
    post: OpshubPost
}

export function FeedPost({ post }: FeedPostProps) {
    const { upvotePost } = useOpshubStore()

    const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
        insight: {
            icon: <Lightbulb className="w-3.5 h-3.5" />,
            color: 'text-amber-400',
        },
        question: {
            icon: <HelpCircle className="w-3.5 h-3.5" />,
            color: 'text-cyan-400',
        },
        issue: {
            icon: <AlertCircle className="w-3.5 h-3.5" />,
            color: 'text-red-400',
        },
        pull_request: {
            icon: <Workflow className="w-3.5 h-3.5" />,
            color: 'text-purple-400',
        },
        announcement: {
            icon: <Megaphone className="w-3.5 h-3.5" />,
            color: 'text-emerald-400',
        },
        anomaly_alert: {
            icon: <AlertTriangle className="w-3.5 h-3.5" />,
            color: 'text-orange-400',
        },
    }

    const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
        open: { icon: <AlertCircle className="w-3 h-3" />, color: 'text-emerald-400', label: 'Open' },
        resolved: { icon: <CheckCircle className="w-3 h-3" />, color: 'text-purple-400', label: 'Resolved' },
        merged: { icon: <GitMerge className="w-3 h-3" />, color: 'text-purple-400', label: 'Merged' },
        rejected: { icon: <XCircle className="w-3 h-3" />, color: 'text-red-400', label: 'Rejected' },
        pending: { icon: <AlertTriangle className="w-3 h-3" />, color: 'text-amber-400', label: 'Pending' },
    }

    const config = typeConfig[post.type] || typeConfig.insight
    const status = post.status ? statusConfig[post.status] : null

    // Generate initials from author name
    const initials = post.authorName
        .split(' ')
        .map(w => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition">
            <div className="p-4">
                <div className="flex items-start gap-3">
                    {/* Avatar — initials, no emojis */}
                    <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            post.authorType === 'ai_agent'
                                ? 'bg-purple-900/50 text-purple-400'
                                : post.authorType === 'system'
                                    ? 'bg-emerald-900/50 text-emerald-400'
                                    : 'bg-zinc-800 text-zinc-400'
                        }`}>
                            {post.authorType === 'ai_agent' ? <Bot className="w-4 h-4" /> : initials}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {/* Author and meta */}
                        <div className="flex items-center gap-2 text-xs">
                            <span className="font-medium text-zinc-200">
                                {post.authorName}
                            </span>
                            {post.authorType === 'ai_agent' && (
                                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-purple-900/30 text-purple-400 rounded">
                                    AI
                                </span>
                            )}
                            <span className="text-zinc-600">&middot;</span>
                            <span className="text-zinc-500">{timeAgo(post.createdAt)}</span>

                            {/* Type icon */}
                            <span className={config.color}>
                                {config.icon}
                            </span>

                            {/* Status */}
                            {status && (
                                <span className={`flex items-center gap-1 text-[10px] ${status.color}`}>
                                    {status.icon}
                                    {status.label}
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h3 className="mt-1 text-sm font-semibold text-zinc-100">
                            {post.title}
                        </h3>

                        {/* Content preview */}
                        <p className="mt-1.5 text-xs text-zinc-400 line-clamp-3 whitespace-pre-wrap">
                            {post.content.replace(/\*\*/g, '').replace(/\n\n/g, '\n')}
                        </p>

                        {/* Tags */}
                        {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2.5">
                                {post.tags.slice(0, 4).map(tag => (
                                    <span
                                        key={tag}
                                        className="px-2 py-0.5 text-[10px] bg-zinc-800 text-zinc-400 rounded"
                                    >
                                        {tag}
                                    </span>
                                ))}
                                {post.tags.length > 4 && (
                                    <span className="px-2 py-0.5 text-[10px] text-zinc-600">
                                        +{post.tags.length - 4}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-zinc-800">
                            <button
                                onClick={() => upvotePost(post.id)}
                                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-cyan-400 transition"
                            >
                                <ArrowUp className="w-3.5 h-3.5" />
                                <span>{post.upvotes}</span>
                            </button>
                            <button className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-cyan-400 transition">
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>{post.comments}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
