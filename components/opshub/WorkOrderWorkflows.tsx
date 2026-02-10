'use client'

import { Bot, GitFork, Star, Workflow } from 'lucide-react'
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
        <div className="space-y-4">
            {/* AI Recommendation */}
            {hasAIRecommendation && <AIRecommendationCard />}

            {/* Linked Workflow Repos */}
            <div>
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Linked Workflows</h3>
                <div className="space-y-2">
                    {linkedWorkflows.map(wf => (
                        <div key={wf.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 hover:border-zinc-700 transition">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <Workflow className="w-4 h-4 text-cyan-400" />
                                    <span className="text-sm font-semibold text-cyan-400">{wf.name}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-zinc-500">
                                    <span className="flex items-center gap-1"><Star className="w-3 h-3" />{wf.stars}</span>
                                    <span className="flex items-center gap-1"><GitFork className="w-3 h-3" />{wf.forks}</span>
                                </div>
                            </div>
                            <p className="mt-1 text-xs text-zinc-500">{wf.description}</p>
                            <div className="flex gap-1.5 mt-2">
                                {wf.tags.map(t => (
                                    <span key={t} className="px-1.5 py-0.5 text-[10px] bg-zinc-800 text-zinc-400 rounded">{t}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
