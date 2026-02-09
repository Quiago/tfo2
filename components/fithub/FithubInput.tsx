'use client'

import { useFithubStore } from '@/lib/store/fithub-store'
import type { InputActionType, PostType } from '@/lib/types/fithub'
import {
    AlertCircle,
    GitPullRequest,
    Send,
    Sparkles,
    TicketPlus,
    X
} from 'lucide-react'
import { useState } from 'react'

/**
 * FithubInput: Input bar with action buttons (Ask AI, Create Ticket, Issue, PR)
 * Inspired by GitHub's header input area
 */
export function FithubInput() {
    const {
        activeInputAction,
        setActiveInputAction,
        createPost,
        factories,
        selectedFactoryId,
    } = useFithubStore()

    const [inputValue, setInputValue] = useState('')
    const [title, setTitle] = useState('')

    // Action buttons config
    const actions: { type: InputActionType; label: string; icon: React.ReactNode; postType: PostType }[] = [
        { type: 'ask_ai', label: 'Ask AI', icon: <Sparkles className="w-4 h-4" />, postType: 'question' },
        { type: 'create_ticket', label: 'Ticket', icon: <TicketPlus className="w-4 h-4" />, postType: 'question' },
        { type: 'create_issue', label: 'Issue', icon: <AlertCircle className="w-4 h-4" />, postType: 'issue' },
        { type: 'pull_request', label: 'PR', icon: <GitPullRequest className="w-4 h-4" />, postType: 'pull_request' },
    ]

    const activeAction = actions.find(a => a.type === activeInputAction)

    const handleSubmit = () => {
        if (!inputValue.trim()) return

        const factory = factories.find(f => f.id === selectedFactoryId) || factories[0]

        createPost({
            type: activeAction?.postType || 'question',
            authorType: 'human',
            authorId: factory?.id || 'user',
            authorName: factory?.displayName || 'You',
            title: title || inputValue.slice(0, 60) + (inputValue.length > 60 ? '...' : ''),
            content: inputValue,
            tags: [],
            status: 'open',
        })

        setInputValue('')
        setTitle('')
        setActiveInputAction(null)
    }

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
            {/* Collapsed state - simple input */}
            {!activeInputAction && (
                <div className="p-3">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Ask anything..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onFocus={() => setActiveInputAction('ask_ai')}
                            className="flex-1 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                        />
                    </div>

                    {/* Action buttons row */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        {actions.map(action => (
                            <button
                                key={action.type}
                                onClick={() => setActiveInputAction(action.type)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition"
                            >
                                {action.icon}
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Expanded state - full form */}
            {activeInputAction && (
                <div className="p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                            {activeAction?.icon}
                            <span>
                                {activeAction?.type === 'ask_ai' && 'Ask the AI Assistant'}
                                {activeAction?.type === 'create_ticket' && 'Create Support Ticket'}
                                {activeAction?.type === 'create_issue' && 'Report an Issue'}
                                {activeAction?.type === 'pull_request' && 'Propose Improvement'}
                            </span>
                        </div>
                        <button
                            onClick={() => {
                                setActiveInputAction(null)
                                setInputValue('')
                                setTitle('')
                            }}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Title input */}
                    <input
                        type="text"
                        placeholder="Title (optional)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 mb-2"
                    />

                    {/* Content textarea */}
                    <textarea
                        placeholder={
                            activeAction?.type === 'ask_ai'
                                ? 'Ask a question about workflows, anomalies, or best practices...'
                                : activeAction?.type === 'create_issue'
                                    ? 'Describe the issue in detail...'
                                    : 'Describe your request...'
                        }
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 resize-none"
                    />

                    {/* Submit row */}
                    <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1">
                            {actions.map(action => (
                                <button
                                    key={action.type}
                                    onClick={() => setActiveInputAction(action.type)}
                                    className={`p-2 rounded-md transition ${activeInputAction === action.type
                                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                            : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    {action.icon}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={!inputValue.trim()}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-md transition"
                        >
                            <Send className="w-4 h-4" />
                            {activeAction?.type === 'ask_ai' ? 'Ask' : 'Submit'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
