// /lib/store/workflow-store.ts
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  VoiceWorkflowIntent,
  ConfirmationCard,
  CardStatus,
  WorkflowNodeType,
  NodeConfig,
} from '@/lib/types/workflow'

// ─── UI Mode ─────────────────────────────────────────────────────
export type BuilderMode = 'canvas' | 'cards' | 'voice'

// ─── Store Shape ─────────────────────────────────────────────────
interface WorkflowBuilderState {
  // Current workflow being edited
  workflow: Workflow | null
  
  // UI state
  mode: BuilderMode
  selectedNodeId: string | null
  isPanelOpen: boolean
  isVoiceRecording: boolean
  voiceTranscript: string
  
  // Mobile confirmation cards
  confirmationCard: ConfirmationCard | null
  
  // Execution state
  isExecuting: boolean
  executionLog: { nodeId: string; status: string; message: string; timestamp: number }[]
  
  // Actions — Workflow CRUD
  createWorkflow: (title: string, description?: string) => void
  loadWorkflow: (workflow: Workflow) => void
  updateWorkflowMeta: (updates: Partial<Pick<Workflow, 'title' | 'description' | 'tags' | 'targetAsset' | 'safetyCheck' | 'isPublic' | 'status'>>) => void
  
  // Actions — Node CRUD
  addNode: (type: WorkflowNodeType, position: { x: number; y: number }, config?: NodeConfig) => string
  updateNode: (nodeId: string, updates: Partial<Pick<WorkflowNode, 'label' | 'config' | 'position'>>) => void
  removeNode: (nodeId: string) => void
  selectNode: (nodeId: string | null) => void
  
  // Actions — Edge CRUD
  addEdge: (source: string, target: string, sourceHandle?: string, label?: string) => void
  removeEdge: (edgeId: string) => void
  
  // Actions — Voice / AI
  setVoiceRecording: (isRecording: boolean) => void
  setVoiceTranscript: (transcript: string) => void
  setConfirmationCard: (card: ConfirmationCard | null) => void
  confirmWorkflowIntent: () => void
  
  // Actions — Mode
  setMode: (mode: BuilderMode) => void
  togglePanel: () => void
  
  // Actions — Execution
  setExecuting: (isExecuting: boolean) => void
  addExecutionLog: (nodeId: string, status: string, message: string) => void
  clearExecutionLog: () => void
  
  // Export
  exportToJSON: () => string
}

// ─── ID Generator ────────────────────────────────────────────────
let nodeCounter = 0
const generateId = (prefix: string) => `${prefix}_${Date.now()}_${++nodeCounter}`

// ─── Auto-Layout Helper ─────────────────────────────────────────
const autoLayoutPosition = (index: number): { x: number; y: number } => ({
  x: 300,
  y: 80 + index * 140,
})

// ─── Intent → Nodes/Edges Converter ─────────────────────────────
function intentToNodesAndEdges(intent: VoiceWorkflowIntent): { nodes: WorkflowNode[]; edges: WorkflowEdge[] } {
  const nodes: WorkflowNode[] = []
  const edges: WorkflowEdge[] = []
  
  // Create trigger node
  const triggerId = generateId('node')
  nodes.push({
    id: triggerId,
    type: intent.trigger.type,
    label: intent.trigger.keywords?.length
      ? `Trigger: "${intent.trigger.keywords.join(', ')}"`
      : 'Start',
    config: intent.trigger.keywords ? { keywords: intent.trigger.keywords } : {},
    position: autoLayoutPosition(0),
  })
  
  let prevId = triggerId
  
  // Create step nodes
  intent.steps.forEach((step, i) => {
    const nodeId = generateId('node')
    nodes.push({
      id: nodeId,
      type: step.type,
      label: step.label,
      config: step.config,
      position: autoLayoutPosition(i + 1),
    })
    
    // Connect to previous
    edges.push({
      id: generateId('edge'),
      source: prevId,
      target: nodeId,
      animated: true,
    })
    
    prevId = nodeId
  })
  
  return { nodes, edges }
}

// ─── Store ───────────────────────────────────────────────────────
export const useWorkflowStore = create<WorkflowBuilderState>()(
  immer((set, get) => ({
    workflow: null,
    mode: 'canvas',
    selectedNodeId: null,
    isPanelOpen: true,
    isVoiceRecording: false,
    voiceTranscript: '',
    confirmationCard: null,
    isExecuting: false,
    executionLog: [],
    
    // ── Workflow CRUD ─────────────────────────────
    createWorkflow: (title, description = '') => {
      set((state) => {
        state.workflow = {
          id: generateId('wf'),
          title,
          description,
          authorId: 'user_current',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: 1,
          isPublic: false,
          status: 'draft',
          nodes: [],
          edges: [],
          tags: [],
          executionCount: 0,
        }
      })
    },
    
    loadWorkflow: (workflow) => {
      set((state) => {
        state.workflow = workflow
        state.selectedNodeId = null
      })
    },
    
    updateWorkflowMeta: (updates) => {
      set((state) => {
        if (!state.workflow) return
        Object.assign(state.workflow, updates)
        state.workflow.updatedAt = new Date().toISOString()
      })
    },
    
    // ── Node CRUD ─────────────────────────────────
    addNode: (type, position, config = {}) => {
      const id = generateId('node')
      const meta = (
        // Dynamic import would be cleaner but for Zustand sync we inline
        { label: type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }
      )
      set((state) => {
        if (!state.workflow) return
        state.workflow.nodes.push({
          id,
          type,
          label: meta.label,
          config,
          position,
        })
        state.workflow.updatedAt = new Date().toISOString()
      })
      return id
    },
    
    updateNode: (nodeId, updates) => {
      set((state) => {
        if (!state.workflow) return
        const node = state.workflow.nodes.find(n => n.id === nodeId)
        if (node) {
          if (updates.label !== undefined) node.label = updates.label
          if (updates.config !== undefined) node.config = updates.config
          if (updates.position !== undefined) node.position = updates.position
          state.workflow.updatedAt = new Date().toISOString()
        }
      })
    },
    
    removeNode: (nodeId) => {
      set((state) => {
        if (!state.workflow) return
        state.workflow.nodes = state.workflow.nodes.filter(n => n.id !== nodeId)
        state.workflow.edges = state.workflow.edges.filter(
          e => e.source !== nodeId && e.target !== nodeId
        )
        if (state.selectedNodeId === nodeId) state.selectedNodeId = null
        state.workflow.updatedAt = new Date().toISOString()
      })
    },
    
    selectNode: (nodeId) => {
      set((state) => { state.selectedNodeId = nodeId })
    },
    
    // ── Edge CRUD ─────────────────────────────────
    addEdge: (source, target, sourceHandle, label) => {
      set((state) => {
        if (!state.workflow) return
        // Prevent duplicates
        const exists = state.workflow.edges.some(
          e => e.source === source && e.target === target && e.sourceHandle === sourceHandle
        )
        if (exists) return
        state.workflow.edges.push({
          id: generateId('edge'),
          source,
          target,
          sourceHandle,
          label,
          animated: true,
        })
        state.workflow.updatedAt = new Date().toISOString()
      })
    },
    
    removeEdge: (edgeId) => {
      set((state) => {
        if (!state.workflow) return
        state.workflow.edges = state.workflow.edges.filter(e => e.id !== edgeId)
      })
    },
    
    // ── Voice / AI ────────────────────────────────
    setVoiceRecording: (isRecording) => {
      set((state) => { state.isVoiceRecording = isRecording })
    },
    
    setVoiceTranscript: (transcript) => {
      set((state) => { state.voiceTranscript = transcript })
    },
    
    setConfirmationCard: (card) => {
      set((state) => { state.confirmationCard = card })
    },
    
    confirmWorkflowIntent: () => {
      const { confirmationCard, workflow } = get()
      if (!confirmationCard || !workflow) return
      
      const intent = confirmationCard.userEdits
        ? { ...confirmationCard.workflowIntent, ...confirmationCard.userEdits }
        : confirmationCard.workflowIntent
      
      const { nodes, edges } = intentToNodesAndEdges(intent)
      
      set((state) => {
        if (!state.workflow) return
        state.workflow.nodes = nodes
        state.workflow.edges = edges
        state.workflow.title = intent.title
        state.workflow.description = intent.description
        state.workflow.targetAsset = intent.targetAsset
        state.workflow.safetyCheck = intent.safetyCheck
        state.workflow.updatedAt = new Date().toISOString()
        state.confirmationCard = null
        state.voiceTranscript = ''
      })
    },
    
    // ── Mode ──────────────────────────────────────
    setMode: (mode) => {
      set((state) => { state.mode = mode })
    },
    
    togglePanel: () => {
      set((state) => { state.isPanelOpen = !state.isPanelOpen })
    },
    
    // ── Execution ─────────────────────────────────
    setExecuting: (isExecuting) => {
      set((state) => { state.isExecuting = isExecuting })
    },
    
    addExecutionLog: (nodeId, status, message) => {
      set((state) => {
        state.executionLog.push({ nodeId, status, message, timestamp: Date.now() })
      })
    },
    
    clearExecutionLog: () => {
      set((state) => { state.executionLog = [] })
    },
    
    // ── Export ─────────────────────────────────────
    exportToJSON: () => {
      const { workflow } = get()
      if (!workflow) return '{}'
      return JSON.stringify(workflow, null, 2)
    },
  }))
)
