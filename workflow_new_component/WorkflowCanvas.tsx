// /components/features/workflow-builder/WorkflowCanvas.tsx
'use client'

import { useCallback, useMemo, type DragEvent } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge as rfAddEdge,
  type Connection,
  BackgroundVariant,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { useWorkflowStore } from '@/lib/store/workflow-store'
import { NODE_REGISTRY } from '@/lib/types/workflow'
import type { Workflow, WorkflowNodeType } from '@/lib/types/workflow'
import { OpsFlowNode } from './OpsFlowNode'

interface WorkflowCanvasProps {
  workflow: Workflow
}

// Register our custom node type
const nodeTypes = {
  opsflow: OpsFlowNode,
}

export function WorkflowCanvas({ workflow }: WorkflowCanvasProps) {
  const { addNode, addEdge, updateNode, removeNode, removeEdge, selectNode } = useWorkflowStore()

  // Convert our workflow nodes to React Flow nodes
  const rfNodes: Node[] = useMemo(() =>
    workflow.nodes.map(n => ({
      id: n.id,
      type: 'opsflow',
      position: n.position,
      data: {
        ...n,
        meta: NODE_REGISTRY[n.type],
      },
      selected: false,
    })),
    [workflow.nodes]
  )

  // Convert our workflow edges to React Flow edges
  const rfEdges: Edge[] = useMemo(() =>
    workflow.edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
      label: e.label,
      animated: e.animated ?? true,
      style: { stroke: '#525252', strokeWidth: 2 },
      labelStyle: { fill: '#a1a1aa', fontSize: 10, fontWeight: 500 },
      labelBgStyle: { fill: '#18181b', fillOpacity: 0.9 },
      labelBgPadding: [6, 3] as [number, number],
      labelBgBorderRadius: 4,
    })),
    [workflow.edges]
  )

  // Handle node position changes
  const onNodesChange: OnNodesChange = useCallback((changes) => {
    changes.forEach(change => {
      if (change.type === 'position' && change.position && change.id) {
        updateNode(change.id, { position: change.position })
      }
      if (change.type === 'remove' && change.id) {
        removeNode(change.id)
      }
    })
  }, [updateNode, removeNode])

  // Handle edge changes
  const onEdgesChange: OnEdgesChange = useCallback((changes) => {
    changes.forEach(change => {
      if (change.type === 'remove' && change.id) {
        removeEdge(change.id)
      }
    })
  }, [removeEdge])

  // Handle new connections
  const onConnect: OnConnect = useCallback((connection: Connection) => {
    if (connection.source && connection.target) {
      addEdge(connection.source, connection.target, connection.sourceHandle ?? undefined)
    }
  }, [addEdge])

  // Handle node selection
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    selectNode(node.id)
  }, [selectNode])

  const onPaneClick = useCallback(() => {
    selectNode(null)
  }, [selectNode])

  // Handle drag-and-drop from palette
  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    const nodeType = e.dataTransfer.getData('application/opsflow-node-type') as WorkflowNodeType
    if (!nodeType || !NODE_REGISTRY[nodeType]) return

    // Get the canvas bounds to calculate position
    const reactFlowBounds = (e.target as HTMLElement).closest('.react-flow')?.getBoundingClientRect()
    if (!reactFlowBounds) return

    const position = {
      x: e.clientX - reactFlowBounds.left - 100,
      y: e.clientY - reactFlowBounds.top - 30,
    }

    addNode(nodeType, position)
  }, [addNode])

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#525252', strokeWidth: 2 },
        }}
        proOptions={{ hideAttribution: true }}
        className="bg-zinc-950"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#27272a"
        />
        <Controls
          showInteractive={false}
          className="!border-zinc-700 !bg-zinc-900/80 [&>button]:!border-zinc-700 [&>button]:!bg-zinc-800 [&>button]:!text-zinc-400 [&>button:hover]:!bg-zinc-700"
        />
        <MiniMap
          nodeStrokeWidth={3}
          nodeColor="#3f3f46"
          maskColor="rgba(0,0,0,0.7)"
          className="!border-zinc-700 !bg-zinc-900/80"
        />
      </ReactFlow>
    </div>
  )
}
