import type {
    ChangelogEntry,
    DetectedAnomaly,
    Factory,
    FeedFilter,
    FithubPost,
    InputActionType,
    WorkflowRepo
} from '@/lib/types/fithub'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

// ─── Store Shape ─────────────────────────────────────────────────
interface FithubState {
    // Data
    factories: Factory[]
    workflowRepos: WorkflowRepo[]
    feed: FithubPost[]
    anomalies: DetectedAnomaly[]
    changelog: ChangelogEntry[]

    // Filters
    selectedFactoryId: string | null
    feedFilter: FeedFilter
    searchQuery: string
    showOnlyAnomalies: boolean

    // UI State
    isInputExpanded: boolean
    activeInputAction: InputActionType | null
    isCreatingPost: boolean
    selectedPostId: string | null
    selectedAnomalyId: string | null

    // Data Actions
    setFactories: (factories: Factory[]) => void
    setWorkflowRepos: (repos: WorkflowRepo[]) => void
    setFeed: (posts: FithubPost[]) => void
    setAnomalies: (anomalies: DetectedAnomaly[]) => void
    setChangelog: (entries: ChangelogEntry[]) => void

    // Anomaly Actions
    approveAnomaly: (id: string) => void
    rejectAnomaly: (id: string) => void
    investigateAnomaly: (id: string) => void

    // Post Actions
    createPost: (post: Omit<FithubPost, 'id' | 'createdAt' | 'upvotes' | 'comments'>) => void
    upvotePost: (id: string) => void

    // Workflow Actions
    starWorkflow: (repoId: string) => void
    forkWorkflow: (repoId: string, targetFactoryId: string) => void

    // Filter Actions
    setSelectedFactory: (factoryId: string | null) => void
    setFeedFilter: (filter: FeedFilter) => void
    setSearchQuery: (query: string) => void
    toggleAnomaliesOnly: () => void

    // UI Actions
    setInputExpanded: (expanded: boolean) => void
    setActiveInputAction: (action: InputActionType | null) => void
    setCreatingPost: (creating: boolean) => void
    selectPost: (id: string | null) => void
    selectAnomaly: (id: string | null) => void

    // Computed selectors
    getFilteredFeed: () => FithubPost[]
    getFilteredRepos: () => WorkflowRepo[]
    getPendingAnomalies: () => DetectedAnomaly[]
}

// ─── ID Generator ────────────────────────────────────────────────
let counter = 0
const generateId = (prefix: string) => `${prefix}_${Date.now()}_${++counter}`

// ─── Store ───────────────────────────────────────────────────────
export const useFithubStore = create<FithubState>()(
    immer((set, get) => ({
        // Initial state
        factories: [],
        workflowRepos: [],
        feed: [],
        anomalies: [],
        changelog: [],
        selectedFactoryId: null,
        feedFilter: 'all',
        searchQuery: '',
        showOnlyAnomalies: false,
        isInputExpanded: false,
        activeInputAction: null,
        isCreatingPost: false,
        selectedPostId: null,
        selectedAnomalyId: null,

        // ── Data Setters ─────────────────────────────
        setFactories: (factories) => set((state) => { state.factories = factories }),
        setWorkflowRepos: (repos) => set((state) => { state.workflowRepos = repos }),
        setFeed: (posts) => set((state) => { state.feed = posts }),
        setAnomalies: (anomalies) => set((state) => { state.anomalies = anomalies }),
        setChangelog: (entries) => set((state) => { state.changelog = entries }),

        // ── Anomaly Actions ──────────────────────────
        approveAnomaly: (id) => set((state) => {
            const anomaly = state.anomalies.find(a => a.id === id)
            if (!anomaly) return

            // Update anomaly status
            anomaly.status = 'resolved'
            anomaly.resolvedAt = new Date().toISOString()

            // Create a feed post about the resolution
            const newPost: FithubPost = {
                id: generateId('post'),
                type: 'insight',
                authorType: 'system',
                authorId: anomaly.factoryId,
                authorName: anomaly.factoryName,
                title: `✅ Anomaly resolved: ${anomaly.equipmentName}`,
                content: `The ${anomaly.severity} severity anomaly on **${anomaly.equipmentName}** has been approved and resolved.\n\n**Original issue:** ${anomaly.description}\n\n**Applied workflow:** ${anomaly.suggestedWorkflowName || 'Manual resolution'}`,
                anomalyRef: anomaly.id,
                workflowRepoRef: anomaly.suggestedWorkflowId,
                tags: [anomaly.equipmentType, 'resolved', anomaly.severity],
                upvotes: 0,
                comments: 0,
                createdAt: new Date().toISOString(),
                status: 'resolved',
            }
            state.feed.unshift(newPost)
        }),

        rejectAnomaly: (id) => set((state) => {
            const anomaly = state.anomalies.find(a => a.id === id)
            if (anomaly) {
                anomaly.status = 'rejected'
            }
        }),

        investigateAnomaly: (id) => set((state) => {
            const anomaly = state.anomalies.find(a => a.id === id)
            if (anomaly) {
                anomaly.status = 'investigating'
            }
        }),

        // ── Post Actions ─────────────────────────────
        createPost: (postData) => set((state) => {
            const newPost: FithubPost = {
                ...postData,
                id: generateId('post'),
                createdAt: new Date().toISOString(),
                upvotes: 0,
                comments: 0,
            }
            state.feed.unshift(newPost)
            state.isCreatingPost = false
            state.activeInputAction = null
        }),

        upvotePost: (id) => set((state) => {
            const post = state.feed.find(p => p.id === id)
            if (post) {
                post.upvotes++
            }
        }),

        // ── Workflow Actions ─────────────────────────
        starWorkflow: (repoId) => set((state) => {
            const repo = state.workflowRepos.find(r => r.id === repoId)
            if (repo) {
                repo.stars++
            }
        }),

        forkWorkflow: (repoId, targetFactoryId) => set((state) => {
            const sourceRepo = state.workflowRepos.find(r => r.id === repoId)
            const targetFactory = state.factories.find(f => f.id === targetFactoryId)
            if (!sourceRepo || !targetFactory) return

            // Increment fork count
            sourceRepo.forks++

            // Create forked repo
            const forkedRepo: WorkflowRepo = {
                ...sourceRepo,
                id: generateId('repo'),
                factoryId: targetFactoryId,
                name: `${sourceRepo.name}-fork`,
                forks: 0,
                stars: 0,
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
            }
            state.workflowRepos.push(forkedRepo)

            // Create feed post about the fork
            const sourceFactory = state.factories.find(f => f.id === sourceRepo.factoryId)
            const newPost: FithubPost = {
                id: generateId('post'),
                type: 'pull_request',
                authorType: 'human',
                authorId: targetFactoryId,
                authorName: targetFactory.displayName,
                title: `🔀 Forked: ${sourceRepo.name}`,
                content: `**${targetFactory.displayName}** forked workflow **${sourceRepo.name}** from **${sourceFactory?.displayName || 'unknown'}** for cross-facility learning.`,
                workflowRepoRef: forkedRepo.id,
                tags: sourceRepo.tags,
                upvotes: 0,
                comments: 0,
                createdAt: new Date().toISOString(),
                status: 'merged',
                sourceFacilityId: sourceRepo.factoryId,
                targetFacilityId: targetFactoryId,
            }
            state.feed.unshift(newPost)
        }),

        // ── Filter Actions ───────────────────────────
        setSelectedFactory: (factoryId) => set((state) => {
            state.selectedFactoryId = factoryId
        }),
        setFeedFilter: (filter) => set((state) => { state.feedFilter = filter }),
        setSearchQuery: (query) => set((state) => { state.searchQuery = query }),
        toggleAnomaliesOnly: () => set((state) => {
            state.showOnlyAnomalies = !state.showOnlyAnomalies
        }),

        // ── UI Actions ───────────────────────────────
        setInputExpanded: (expanded) => set((state) => { state.isInputExpanded = expanded }),
        setActiveInputAction: (action) => set((state) => {
            state.activeInputAction = action
            state.isInputExpanded = action !== null
        }),
        setCreatingPost: (creating) => set((state) => { state.isCreatingPost = creating }),
        selectPost: (id) => set((state) => { state.selectedPostId = id }),
        selectAnomaly: (id) => set((state) => { state.selectedAnomalyId = id }),

        // ── Computed Selectors ───────────────────────
        getFilteredFeed: () => {
            const { feed, feedFilter, selectedFactoryId, searchQuery, showOnlyAnomalies } = get()
            let filtered = [...feed]

            // Filter by factory
            if (selectedFactoryId) {
                filtered = filtered.filter(p => p.authorId === selectedFactoryId)
            }

            // Filter by type
            if (feedFilter !== 'all') {
                filtered = filtered.filter(p => p.type === feedFilter)
            }

            // Filter anomalies only
            if (showOnlyAnomalies) {
                filtered = filtered.filter(p => p.type === 'anomaly_alert' || p.anomalyRef)
            }

            // Filter by search
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase()
                filtered = filtered.filter(p =>
                    p.title.toLowerCase().includes(q) ||
                    p.content.toLowerCase().includes(q) ||
                    p.tags.some(t => t.toLowerCase().includes(q))
                )
            }

            return filtered
        },

        getFilteredRepos: () => {
            const { workflowRepos, selectedFactoryId, searchQuery } = get()
            let filtered = [...workflowRepos]

            // Filter by factory
            if (selectedFactoryId) {
                filtered = filtered.filter(r => r.factoryId === selectedFactoryId)
            }

            // Filter by search
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase()
                filtered = filtered.filter(r =>
                    r.name.toLowerCase().includes(q) ||
                    r.description.toLowerCase().includes(q) ||
                    r.tags.some(t => t.toLowerCase().includes(q))
                )
            }

            return filtered
        },

        getPendingAnomalies: () => {
            const { anomalies, selectedFactoryId } = get()
            let pending = anomalies.filter(a => a.status === 'pending' || a.status === 'investigating')

            if (selectedFactoryId) {
                pending = pending.filter(a => a.factoryId === selectedFactoryId)
            }

            return pending.sort((a, b) => {
                const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
                return severityOrder[a.severity] - severityOrder[b.severity]
            })
        },
    }))
)
