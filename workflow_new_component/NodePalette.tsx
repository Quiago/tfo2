// /components/features/workflow-builder/NodePalette.tsx
'use client'

import { useState, useCallback, type DragEvent } from 'react'
import { NODE_REGISTRY, type NodeCategory, type WorkflowNodeType } from '@/lib/types/workflow'
import { ChevronDown, ChevronRight, Lock } from 'lucide-react'
import * as LucideIcons from 'lucide-react'

const CATEGORY_ORDER: { key: NodeCategory; label: string; icon: string }[] = [
  { key: 'trigger',   label: 'Triggers',    icon: 'Zap' },
  { key: 'condition',  label: 'Conditions',  icon: 'GitBranch' },
  { key: 'input',      label: 'Inputs',      icon: 'ScanLine' },
  { key: 'action',     label: 'Actions',     icon: 'Cog' },
  { key: 'utility',    label: 'Utility',     icon: 'Wrench' },
]

function getIcon(name: string, size = 14) {
  const Icon = (LucideIcons as Record<string, React.ComponentType<{ size?: number }>>)[name]
  return Icon ? <Icon size={size} /> : null
}

export function NodePalette() {
  const [expandedCategories, setExpandedCategories] = useState<Set<NodeCategory>>(
    new Set(['trigger', 'action', 'condition'])
  )

  const toggleCategory = useCallback((cat: NodeCategory) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }, [])

  const handleDragStart = useCallback((e: DragEvent, nodeType: WorkflowNodeType) => {
    e.dataTransfer.setData('application/opsflow-node-type', nodeType)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const nodesByCategory = CATEGORY_ORDER.map(cat => ({
    ...cat,
    nodes: Object.values(NODE_REGISTRY).filter(n => n.category === cat.key),
  }))

  return (
    <div className="flex w-56 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900/60">
      <div className="px-3 py-2">
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          Node Palette
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-1 pb-4">
        {nodesByCategory.map(({ key, label, icon, nodes }) => (
          <div key={key} className="mb-1">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(key)}
              className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-zinc-200"
            >
              {expandedCategories.has(key)
                ? <ChevronDown size={12} />
                : <ChevronRight size={12} />
              }
              {getIcon(icon, 12)}
              <span className="font-medium">{label}</span>
              <span className="ml-auto text-[10px] text-zinc-600">{nodes.length}</span>
            </button>

            {/* Nodes */}
            {expandedCategories.has(key) && (
              <div className="ml-2 mt-0.5 space-y-0.5">
                {nodes.map(node => {
                  const isLocked = !node.availableIn.includes('free')
                  return (
                    <div
                      key={node.type}
                      draggable={!isLocked}
                      onDragStart={(e) => handleDragStart(e, node.type)}
                      className={`group flex cursor-grab items-center gap-2 rounded-md border px-2 py-1.5 transition-all ${
                        isLocked
                          ? 'cursor-not-allowed border-zinc-800/50 opacity-50'
                          : `border-transparent hover:border-${node.color}-500/20 hover:bg-${node.color}-500/5 active:cursor-grabbing`
                      }`}
                      title={isLocked ? `Available in ${node.availableIn.join(', ')}` : node.description}
                    >
                      <span className={`flex h-6 w-6 items-center justify-center rounded text-${node.color}-400 bg-${node.color}-500/10`}>
                        {getIcon(node.icon, 12)}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[11px] text-zinc-300 group-hover:text-zinc-100">
                        {node.label}
                      </span>
                      {isLocked && <Lock size={10} className="shrink-0 text-zinc-600" />}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
