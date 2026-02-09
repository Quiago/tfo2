'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import * as LucideIcons from 'lucide-react'
import type { WorkflowNode, NodeMeta } from '@/lib/types/workflow'

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
      className={`relative min-w-[180px] max-w-[240px] rounded-lg border-2 bg-zinc-900 shadow-lg transition-all ${
        selected
          ? `border-${meta.color}-400 shadow-${meta.color}-500/20`
          : 'border-zinc-700/60 hover:border-zinc-600'
      }`}
    >
      {/* Input Handle (not for triggers) */}
      {!isTrigger && (
        <Handle
          type="target"
          position={Position.Top}
          className="!h-2.5 !w-2.5 !border-2 !border-zinc-600 !bg-zinc-400"
        />
      )}

      {/* Node Header */}
      <div className={`flex items-center gap-2 rounded-t-[6px] border-b border-zinc-800 bg-${meta.color}-500/8 px-3 py-2`}>
        <span className={`flex h-6 w-6 items-center justify-center rounded bg-${meta.color}-500/15 text-${meta.color}-400`}>
          {getIcon(meta.icon, 14)}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
          {meta.label}
        </span>
      </div>

      {/* Node Body */}
      <div className="px-3 py-2">
        <p className="text-xs leading-snug text-zinc-200">
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
            className="!-bottom-1 !left-[30%] !h-2.5 !w-2.5 !border-2 !border-emerald-600 !bg-emerald-400"
          />
          {/* False branch (right) */}
          <Handle
            type="source"
            position={Position.Bottom}
            id="false"
            className="!-bottom-1 !left-[70%] !h-2.5 !w-2.5 !border-2 !border-rose-600 !bg-rose-400"
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
          className="!h-2.5 !w-2.5 !border-2 !border-zinc-600 !bg-zinc-400"
        />
      )}
    </div>
  )
}

export const OpsFlowNode = memo(OpsFlowNodeComponent)
