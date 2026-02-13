'use client'

import type { NodeMeta, WorkflowNode } from '@/lib/types/workflow'
import s from '@/styles/workflow/workflow.module.css'
import * as LucideIcons from 'lucide-react'
import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'

interface OpsFlowNodeData extends WorkflowNode {
    meta: NodeMeta
}

function getIcon(name: string, size = 16) {
    const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[name]
    return Icon ? <Icon size={size} /> : null
}

function OpsFlowNodeComponent({ data, selected }: NodeProps<OpsFlowNodeData>) {
    const { meta, label, type } = data
    const isDecision = type === 'decision'
    const isTrigger = meta.category === 'trigger'

    return (
        <div
            className={s.graphNode}
            data-category={meta.category}
            data-selected={selected}
        >
            {/* Input Handle (not for triggers) */}
            {!isTrigger && (
                <Handle
                    type="target"
                    position={Position.Top}
                    className={s.handle}
                />
            )}

            {/* Node Header */}
            <div className={s.nodeHeader}>
                <span className={s.nodeHeaderIcon}>
                    {getIcon(meta.icon, 14)}
                </span>
                <span className={s.nodeHeaderLabel}>
                    {meta.label}
                </span>
            </div>

            {/* Node Body */}
            <div className={s.nodeBody}>
                <p className={s.nodeText}>
                    {label}
                </p>
            </div>

            {/* Output Handle(s) */}
            {isDecision ? (
                <>
                    {/* True branch (left) */}
                    <Handle
                        type="source"
                        position={Position.Bottom}
                        id="true"
                        className={`${s.handle} ${s.handleTrue}`}
                        style={{ left: '30%' }}
                    />
                    {/* False branch (right) */}
                    <Handle
                        type="source"
                        position={Position.Bottom}
                        id="false"
                        className={`${s.handle} ${s.handleFalse}`}
                        style={{ left: '70%' }}
                    />
                    {/* Labels */}
                    <div className="flex justify-between px-3 pb-1 text-[9px]">
                        <span className="text-emerald-500">Yes</span>
                        <span className="text-rose-500">No</span>
                    </div>
                </>
            ) : (
                <Handle
                    type="source"
                    position={Position.Bottom}
                    className={s.handle}
                />
            )}
        </div>
    )
}

export const OpsFlowNode = memo(OpsFlowNodeComponent)
