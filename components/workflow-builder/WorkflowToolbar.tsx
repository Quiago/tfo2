'use client'

import { useWorkflowStore, type BuilderMode } from '@/lib/store/workflow-store'
import { LayoutGrid, Workflow, Play, Download, PanelLeftOpen, PanelLeftClose } from 'lucide-react'
import type { Workflow as WorkflowType } from '@/lib/types/workflow'

interface WorkflowToolbarProps {
  workflow: WorkflowType
  mode: BuilderMode
  onModeToggle: () => void
  isMobile: boolean
}

export function WorkflowToolbar({ workflow, mode, onModeToggle, isMobile }: WorkflowToolbarProps) {
  const { isPanelOpen, togglePanel, exportToJSON, isExecuting, setExecuting, addExecutionLog, clearExecutionLog } = useWorkflowStore()

  const handleExport = () => {
    const json = exportToJSON()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${workflow.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleRun = () => {
    if (isExecuting) return
    clearExecutionLog()
    setExecuting(true)

    // Simulate execution of each node
    const nodes = workflow.nodes
    let i = 0
    const interval = setInterval(() => {
      if (i >= nodes.length) {
        clearInterval(interval)
        setExecuting(false)
        return
      }
      addExecutionLog(nodes[i].id, 'success', `Executed: ${nodes[i].label}`)
      i++
    }, 800)
  }

  return (
    <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/80 px-3 py-2">
      {/* Panel toggle (desktop only) */}
      {!isMobile && mode === 'canvas' && (
        <button
          onClick={togglePanel}
          className="flex h-7 w-7 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
          title={isPanelOpen ? 'Hide palette' : 'Show palette'}
        >
          {isPanelOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
        </button>
      )}

      {/* Workflow title */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-200">{workflow.title}</p>
        <p className="truncate text-[10px] text-zinc-600">
          {workflow.nodes.length} nodes &middot; {workflow.edges.length} connections &middot; v{workflow.version}
        </p>
      </div>

      {/* Mode toggle */}
      {!isMobile && (
        <button
          onClick={onModeToggle}
          className="flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-[10px] font-medium text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200"
        >
          {mode === 'canvas' ? (
            <>
              <LayoutGrid size={12} />
              Cards
            </>
          ) : (
            <>
              <Workflow size={12} />
              Canvas
            </>
          )}
        </button>
      )}

      {/* Run button */}
      <button
        onClick={handleRun}
        disabled={isExecuting || workflow.nodes.length === 0}
        className="flex items-center gap-1.5 rounded-md bg-emerald-600/80 px-2.5 py-1 text-[10px] font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-40"
      >
        <Play size={10} fill="currentColor" />
        {isExecuting ? 'Running...' : 'Run'}
      </button>

      {/* Export button */}
      <button
        onClick={handleExport}
        className="flex h-7 w-7 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
        title="Export JSON"
      >
        <Download size={14} />
      </button>
    </div>
  )
}
