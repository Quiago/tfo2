'use client'

import { UserAvatar } from '@/components/shared/UserAvatar'
import { DollarSign, Plus, Tag } from 'lucide-react'

// TODO: import from opshub types when available
export interface TeamMember {
    id: string
    name: string
    initials: string
    color: string
    role: string
    status: 'available' | 'busy' | 'in-field' | 'offline'
    isAI?: boolean
}

interface WorkOrderTeamSidebarProps {
    team: TeamMember[]
    riskAmount?: number
    tags: string[]
    aiStatus?: string
}

const roleColor: Record<string, string> = {
    'Lead Technician': 'text-cyan-400',
    'Reliability Engineer': 'text-purple-400',
    'Shift Supervisor': 'text-amber-400',
    'Maintenance Tech': 'text-emerald-400',
    'AI Agent': 'text-violet-400',
}

export function WorkOrderTeamSidebar({ team, riskAmount, tags, aiStatus }: WorkOrderTeamSidebarProps) {
    return (
        <div className="w-64 flex-shrink-0 border-l border-zinc-800 bg-zinc-950 p-4 space-y-6 overflow-y-auto">
            {/* Team Section */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Team</h3>
                    <button className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 transition">
                        <Plus className="w-3 h-3" /> Assign
                    </button>
                </div>
                <div className="space-y-2.5">
                    {team.map(member => (
                        <div key={member.id} className="flex items-center gap-2.5">
                            <UserAvatar
                                initials={member.initials}
                                color={member.color}
                                size="md"
                                status={member.status}
                                isAI={member.isAI}
                            />
                            <div className="min-w-0">
                                <p className="text-sm text-zinc-200 font-medium truncate">
                                    {member.name}
                                </p>
                                <p className={`text-[10px] ${roleColor[member.role] || 'text-zinc-500'}`}>
                                    {member.role}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI Agent */}
            {aiStatus && (
                <div className="p-3 bg-violet-950/30 border border-violet-900/40 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">🤖</span>
                        <span className="text-xs font-semibold text-violet-400">AI Agent</span>
                    </div>
                    <p className="text-[11px] text-violet-300/70">{aiStatus}</p>
                </div>
            )}

            {/* Risk */}
            {riskAmount !== undefined && riskAmount > 0 && (
                <div>
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Cost at Risk</h3>
                    <div className="flex items-center gap-2 p-2.5 bg-red-950/30 border border-red-900/40 rounded-lg">
                        <DollarSign className="w-4 h-4 text-red-400" />
                        <span className="text-sm font-bold text-red-400">EUR {riskAmount.toLocaleString()}</span>
                    </div>
                </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
                <div>
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-1.5">
                        {tags.map(tag => (
                            <span key={tag} className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] bg-zinc-800 text-zinc-400 rounded">
                                <Tag className="w-2.5 h-2.5" />{tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
