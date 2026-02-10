'use client'

import { GitFork, Star, Workflow } from 'lucide-react'
import { AIRecommendationCard } from './AIRecommendationCard'

interface LinkedWorkflow {
    id: string
    name: string
    description: string
    stars: number
    forks: number
    tags: string[]
}

interface WorkOrderWorkflowsProps {
    hasAIRecommendation?: boolean
    linkedWorkflows?: LinkedWorkflow[]
}

const MOCK_LINKED: LinkedWorkflow[] = [
    {
        id: 'repo-3', name: 'Bearing Failure Early Warning',
        description: 'ML-based bearing degradation detection with 72h advance notice',
        stars: 5, forks: 4, tags: ['bearings', 'predictive', 'SOP-M-047'],
    },
    {
        id: 'repo-1', name: 'Motor Vibration Protocol',
        description: 'Standard procedure for motor vibration monitoring',
        stars: 4, forks: 2, tags: ['motors', 'predictive'],
    },
]

export function WorkOrderWorkflows({ hasAIRecommendation = true, linkedWorkflows = MOCK_LINKED }: WorkOrderWorkflowsProps) {
    return (
        <div className="space-y-6">
            {/* AI Recommendation */}
            {hasAIRecommendation && <AIRecommendationCard />}

            {/* Linked Workflow Repos - Tree View */}
            <div>
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Linked Workflows</h3>
                <div className="border border-zinc-800 rounded-md overflow-hidden bg-zinc-900/50">
                    <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-2 border-b border-zinc-800 bg-zinc-900 text-xs font-medium text-zinc-500">
                        <span className="w-5"></span>
                        <span>Name</span>
                        <span>Description</span>
                        <span className="text-right">Activity</span>
                    </div>
                    {linkedWorkflows.map((wf, i) => (
                        <div
                            key={wf.id}
                            className={`grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-2 text-sm hover:bg-zinc-800/50 transition-colors ${i !== linkedWorkflows.length - 1 ? 'border-b border-zinc-800/50' : ''
                                }`}
                        >
                            <div className="flex items-center justify-center text-zinc-500">
                                <Workflow className="w-4 h-4" />
                            </div>
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="font-semibold text-zinc-200 hover:text-cyan-400 hover:underline cursor-pointer truncate">
                                    {wf.name}
                                </span>
                                {wf.tags.map(t => (
                                    <span key={t} className="px-1.5 py-0.5 text-[10px] text-zinc-500 border border-zinc-800 rounded-full bg-zinc-900">
                                        {t}
                                    </span>
                                ))}
                            </div>
                            <div className="text-zinc-500 text-xs truncate max-w-[300px]">
                                {wf.description}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-zinc-500 justify-end">
                                <div className="flex items-center gap-1">
                                    <Star className="w-3.5 h-3.5" />
                                    <span>{wf.stars}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <GitFork className="w-3.5 h-3.5" />
                                    <span>{wf.forks}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
