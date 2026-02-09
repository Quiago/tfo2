// /lib/types/fithub.ts
// Types for Fithub: Cross-Facility Learning & Anomaly Detection Hub
// GitHub-inspired industrial knowledge sharing platform

import type { Workflow } from './workflow'

// ─── Factory (like GitHub User/Organization) ─────────────────────
export interface Factory {
    id: string
    name: string              // "factory-1", "factory-2"
    displayName: string       // "Munich Plant", "Shanghai Facility"
    avatar?: string           // Optional factory icon
    location?: string         // "Germany", "China"
    metrics: {
        efficiency: number      // 0-100%
        uptime: number          // 0-100%
        activeWorkflows: number
        resolvedAnomalies: number
    }
}

// ─── Workflow Repository (Factory owns Workflows) ────────────────
export interface WorkflowRepo {
    id: string
    factoryId: string         // Owner factory
    name: string              // "motor-vibration-fix", "hvac-optimization"
    description: string
    workflowId?: string       // Reference to actual Workflow (if exists)
    workflow?: Workflow       // Embedded workflow for display
    stars: number
    forks: number
    isPublic: boolean
    tags: string[]
    language?: string         // Primary equipment type: "Motors", "HVAC", "Pumps"
    lastUpdated: string       // ISO 8601
    createdAt: string
}

// ─── Feed Post Types ─────────────────────────────────────────────
export type PostType =
    | 'insight'        // AI-discovered pattern or recommendation
    | 'question'       // Human asks for help (StackOverflow style)
    | 'issue'          // Problem reported for a workflow
    | 'pull_request'   // Proposed improvement to a workflow
    | 'announcement'   // System or admin announcement
    | 'anomaly_alert'  // AI-detected anomaly notification

export type PostAuthorType = 'human' | 'ai_agent' | 'system'

export interface FithubPost {
    id: string
    type: PostType
    authorType: PostAuthorType
    authorId: string          // Factory ID or user ID
    authorName: string        // Display name
    authorAvatar?: string
    title: string
    content: string           // Markdown-supported content
    workflowRepoRef?: string  // Related workflow repo ID
    anomalyRef?: string       // Related anomaly ID
    tags: string[]
    upvotes: number
    downvotes?: number
    comments: number
    createdAt: string
    updatedAt?: string
    status?: 'open' | 'resolved' | 'merged' | 'rejected' | 'pending'
    // For pull requests
    sourceFacilityId?: string
    targetFacilityId?: string
}

// ─── Detected Anomaly ────────────────────────────────────────────
export type AnomalySeverity = 'low' | 'medium' | 'high' | 'critical'
export type AnomalyStatus = 'pending' | 'approved' | 'rejected' | 'resolved' | 'investigating'

export interface DetectedAnomaly {
    id: string
    factoryId: string
    factoryName: string
    equipmentId: string
    equipmentName: string
    equipmentType: string     // "Motor", "Pump", "HVAC"
    severity: AnomalySeverity
    description: string
    detectedAt: string
    suggestedWorkflowId?: string
    suggestedWorkflowName?: string
    suggestedAction?: string  // Brief action description
    status: AnomalyStatus
    resolvedAt?: string
    resolvedBy?: string
    confidence: number        // AI confidence 0-1
    // Industrial context fields
    remainingUsefulLife?: string  // "72 hours", "5 days"
    estimatedCostIfIgnored?: number  // € cost of unplanned downtime
    digitalTwinAssetId?: string  // Link to 3D asset in digital twin
}

// ─── Changelog Entry ─────────────────────────────────────────────
export interface ChangelogEntry {
    id: string
    date: string              // ISO 8601
    title: string
    description: string
    factoryId?: string
    factoryName?: string
    workflowRepoId?: string
    type: 'release' | 'insight' | 'integration' | 'improvement' | 'alert'
}

// ─── Filter Types ────────────────────────────────────────────────
export type FeedFilter = PostType | 'all'

export interface FithubFilters {
    feedFilter: FeedFilter
    selectedFactoryId: string | null
    searchQuery: string
    showOnlyAnomalies: boolean
}

// ─── UI State Types ──────────────────────────────────────────────
export type InputActionType = 'ask_ai' | 'work_order' | 'report_issue' | 'propose_workflow'

export interface FithubUIState {
    isInputExpanded: boolean
    activeInputAction: InputActionType | null
    isCreatingPost: boolean
    selectedPostId: string | null
    selectedAnomalyId: string | null
}
