// /components/features/workflow-builder/WorkflowBuilder.tsx
'use client'

import { useEffect, useCallback } from 'react'
import { useWorkflowStore } from '@/lib/store/workflow-store'
import { useMediaQuery } from '@/lib/hooks/useMediaQuery'
import { WorkflowCanvas } from './WorkflowCanvas'
import { WorkflowCardView } from './WorkflowCardView'
import { WorkflowToolbar } from './WorkflowToolbar'
import { NodePalette } from './NodePalette'
import { NodeConfigPanel } from './NodeConfigPanel'
import { VoiceInput } from './VoiceInput'
import { ConfirmationCardOverlay } from './ConfirmationCardOverlay'
import type { Workflow } from '@/lib/types/workflow'

interface WorkflowBuilderProps {
  initialWorkflow?: Workflow
  className?: string
}

export function WorkflowBuilder({ initialWorkflow, className = '' }: WorkflowBuilderProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const {
    workflow,
    mode,
    setMode,
    createWorkflow,
    loadWorkflow,
    selectedNodeId,
    isPanelOpen,
    confirmationCard,
  } = useWorkflowStore()

  // Initialize workflow
  useEffect(() => {
    if (initialWorkflow) {
      loadWorkflow(initialWorkflow)
    } else if (!workflow) {
      createWorkflow('New Workflow', 'Created from scratch')
    }
  }, [initialWorkflow, loadWorkflow, createWorkflow, workflow])

  // Auto-switch mode based on screen size
  useEffect(() => {
    setMode(isMobile ? 'cards' : 'canvas')
  }, [isMobile, setMode])

  const handleModeToggle = useCallback(() => {
    setMode(mode === 'canvas' ? 'cards' : 'canvas')
  }, [mode, setMode])

  if (!workflow) return null

  return (
    <div className={`relative flex h-full w-full flex-col overflow-hidden bg-zinc-950 ${className}`}>
      {/* ── Top Toolbar ─────────────────────────── */}
      <WorkflowToolbar
        workflow={workflow}
        mode={mode}
        onModeToggle={handleModeToggle}
        isMobile={isMobile}
      />

      {/* ── Main Content Area ─────────────────────── */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Desktop: Palette sidebar */}
        {!isMobile && mode === 'canvas' && isPanelOpen && (
          <NodePalette />
        )}

        {/* Canvas or Cards View */}
        <div className="relative flex-1">
          {mode === 'canvas' ? (
            <WorkflowCanvas workflow={workflow} />
          ) : (
            <WorkflowCardView workflow={workflow} />
          )}

          {/* Voice Input — always visible */}
          <VoiceInput className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2" />
        </div>

        {/* Desktop: Config panel for selected node */}
        {!isMobile && selectedNodeId && (
          <NodeConfigPanel />
        )}
      </div>

      {/* ── Confirmation Card Overlay (from voice) ─── */}
      {confirmationCard && (
        <ConfirmationCardOverlay />
      )}
    </div>
  )
}
