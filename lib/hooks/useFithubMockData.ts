import { useFithubStore } from '@/lib/store/fithub-store'
import type {
    ChangelogEntry,
    DetectedAnomaly,
    Factory,
    FithubPost,
    WorkflowRepo,
} from '@/lib/types/fithub'
import { useEffect, useMemo } from 'react'

// ─── Mock Factories ──────────────────────────────────────────────
const MOCK_FACTORIES: Factory[] = [
    {
        id: 'factory-munich',
        name: 'munich',
        displayName: 'Munich Plant',
        location: 'Germany',
        avatar: '🏭',
        metrics: { efficiency: 94.2, uptime: 99.1, activeWorkflows: 23, resolvedAnomalies: 156 },
    },
    {
        id: 'factory-shanghai',
        name: 'shanghai',
        displayName: 'Shanghai Facility',
        location: 'China',
        avatar: '🏗️',
        metrics: { efficiency: 91.8, uptime: 98.5, activeWorkflows: 31, resolvedAnomalies: 203 },
    },
    {
        id: 'factory-detroit',
        name: 'detroit',
        displayName: 'Detroit Assembly',
        location: 'USA',
        avatar: '🔧',
        metrics: { efficiency: 89.5, uptime: 97.2, activeWorkflows: 18, resolvedAnomalies: 89 },
    },
    {
        id: 'factory-tokyo',
        name: 'tokyo',
        displayName: 'Tokyo Innovation Lab',
        location: 'Japan',
        avatar: '⚡',
        metrics: { efficiency: 96.1, uptime: 99.7, activeWorkflows: 42, resolvedAnomalies: 312 },
    },
    {
        id: 'factory-saopaulo',
        name: 'saopaulo',
        displayName: 'São Paulo Hub',
        location: 'Brazil',
        avatar: '🌿',
        metrics: { efficiency: 88.3, uptime: 96.8, activeWorkflows: 15, resolvedAnomalies: 67 },
    },
]

// ─── Mock Workflow Repos (Industrial Procedure Names) ────────────
// Stars = facilities that adopted this workflow
// Forks = facilities that adapted to their context
const MOCK_REPOS: WorkflowRepo[] = [
    // Munich repos - Procedure-style names
    { id: 'repo-1', factoryId: 'factory-munich', name: 'Motor Vibration Protocol', description: 'Standard procedure for motor vibration monitoring and predictive maintenance triggering', stars: 4, forks: 2, isPublic: true, tags: ['motors', 'predictive', 'SOP-M-012'], language: 'Motors', lastUpdated: '2026-02-08T10:30:00Z', createdAt: '2025-11-15T08:00:00Z' },
    { id: 'repo-2', factoryId: 'factory-munich', name: 'HVAC Energy Savings Routine', description: 'AI-driven HVAC scheduling that reduced energy consumption 30% in Q4 2025', stars: 5, forks: 3, isPublic: true, tags: ['hvac', 'energy', 'SOP-E-007'], language: 'HVAC', lastUpdated: '2026-02-07T14:20:00Z', createdAt: '2025-09-22T09:00:00Z' },
    { id: 'repo-3', factoryId: 'factory-munich', name: 'Bearing Failure Early Warning', description: 'ML-based bearing degradation detection with 72h advance notice and automatic work order creation', stars: 5, forks: 4, isPublic: true, tags: ['bearings', 'predictive', 'SOP-M-047'], language: 'Motors', lastUpdated: '2026-02-05T16:45:00Z', createdAt: '2025-06-10T11:00:00Z' },
    // Shanghai repos
    { id: 'repo-4', factoryId: 'factory-shanghai', name: 'Assembly Line Balancing', description: 'Real-time workload distribution across stations to minimize bottlenecks', stars: 3, forks: 1, isPublic: true, tags: ['assembly', 'automation', 'SOP-A-003'], language: 'Assembly', lastUpdated: '2026-02-09T08:15:00Z', createdAt: '2025-08-01T07:00:00Z' },
    { id: 'repo-5', factoryId: 'factory-shanghai', name: 'Visual Quality Inspection', description: 'Computer vision defect detection integrated with MES for automatic rejection logging', stars: 5, forks: 4, isPublic: true, tags: ['quality', 'vision', 'SOP-Q-015'], language: 'Quality', lastUpdated: '2026-02-08T11:30:00Z', createdAt: '2025-04-15T10:00:00Z' },
    { id: 'repo-6', factoryId: 'factory-shanghai', name: 'Robot Arm Calibration Check', description: 'Automated calibration verification for KUKA robot arms with drift compensation', stars: 3, forks: 1, isPublic: true, tags: ['robotics', 'kuka', 'SOP-R-022'], language: 'Robotics', lastUpdated: '2026-02-06T09:00:00Z', createdAt: '2025-10-20T14:00:00Z' },
    // Detroit repos
    { id: 'repo-7', factoryId: 'factory-detroit', name: 'Paint Booth Temperature Control', description: 'Automated temperature regulation for optimal coating adhesion and drying', stars: 2, forks: 0, isPublic: true, tags: ['paint', 'temperature', 'SOP-P-008'], language: 'Paint', lastUpdated: '2026-02-04T13:00:00Z', createdAt: '2025-12-01T08:00:00Z' },
    { id: 'repo-8', factoryId: 'factory-detroit', name: 'Weld Quality Monitoring', description: 'Real-time weld quality analysis with acoustic sensors and automatic parameter adjustment', stars: 4, forks: 2, isPublic: true, tags: ['welding', 'quality', 'SOP-W-011'], language: 'Welding', lastUpdated: '2026-02-07T15:30:00Z', createdAt: '2025-07-18T12:00:00Z' },
    // Tokyo repos
    { id: 'repo-9', factoryId: 'factory-tokyo', name: 'Energy Demand Forecasting', description: 'AI forecasting for factory energy demand, enabling optimal purchasing and load scheduling', stars: 5, forks: 4, isPublic: true, tags: ['energy', 'forecast', 'SOP-E-001'], language: 'Energy', lastUpdated: '2026-02-09T06:00:00Z', createdAt: '2025-03-10T09:00:00Z' },
    { id: 'repo-10', factoryId: 'factory-tokyo', name: 'Predictive Maintenance Suite', description: 'Comprehensive condition monitoring across all equipment types with unified alerting', stars: 5, forks: 5, isPublic: true, tags: ['predictive', 'maintenance', 'SOP-M-001'], language: 'General', lastUpdated: '2026-02-08T22:00:00Z', createdAt: '2024-11-05T08:00:00Z' },
    { id: 'repo-11', factoryId: 'factory-tokyo', name: 'OEE Real-Time Dashboard', description: 'Live OEE calculation with automatic root cause analysis for availability losses', stars: 4, forks: 3, isPublic: true, tags: ['oee', 'metrics', 'SOP-K-002'], language: 'Analytics', lastUpdated: '2026-02-06T18:00:00Z', createdAt: '2025-01-20T10:00:00Z' },
    // São Paulo repos
    { id: 'repo-12', factoryId: 'factory-saopaulo', name: 'Humidity Control Procedure', description: 'Automated humidity regulation for moisture-sensitive manufacturing areas', stars: 2, forks: 0, isPublic: true, tags: ['humidity', 'environment', 'SOP-E-012'], language: 'Environment', lastUpdated: '2026-02-03T11:00:00Z', createdAt: '2025-11-28T14:00:00Z' },
]

// ─── Mock Feed Posts (Industrial Language) ───────────────────────
const MOCK_FEED: FithubPost[] = [
    // EXAMPLE A: Automated workflow execution (the game changer)
    {
        id: 'post-1',
        type: 'insight',
        authorType: 'ai_agent',
        authorId: 'factory-munich',
        authorName: 'Munich AI Monitor',
        authorAvatar: '🤖',
        title: '🔧 Workflow Triggered: Bearing Replacement Protocol — Motor A7',
        content: `Vibration RMS crossed 4.2 mm/s threshold (limit: 4.5). AI confidence: 91%.
**Estimated remaining useful life: 72 hours.**

**Auto-actions executed:**
✅ Work Order WO-4821 created → assigned to Technician Müller
✅ Spare part SKF-6205 reserved from warehouse (2 in stock)
✅ SOP-M-047 attached (bearing replacement procedure)
✅ Production planning notified — Line 3 downtime window requested for Thursday 06:00-08:00

**Estimated savings:** €8,500 in avoided unplanned downtime`,
        workflowRepoRef: 'repo-3',
        tags: ['predictive', 'motors', 'line-3', 'automated', 'work-order'],
        upvotes: 67,
        comments: 8,
        createdAt: '2026-02-09T14:30:00Z',
        status: 'resolved',
    },
    // EXAMPLE B: Cross-facility learning (the differentiator)
    {
        id: 'post-2',
        type: 'anomaly_alert',
        authorType: 'ai_agent',
        authorId: 'factory-shanghai',
        authorName: 'Cross-Facility AI',
        authorAvatar: '🏭',
        title: '🏭 Cross-Facility Alert: Pattern Match Detected',
        content: `**Motor B12 (Shanghai)** shows vibration signature **87% similar** to Motor A7 failure pattern (Munich, resolved Jan 15).

The Munich team replaced the bearing proactively and avoided 14 hours of unplanned downtime.

**Suggested action:** Apply Munich's Bearing Replacement Protocol proactively.
**If approved, estimated savings:** $12,000 in unplanned downtime avoided.

This pattern has been detected in 3 facilities this quarter. Facilities that applied the Munich protocol saved an average of €9,200 per incident.`,
        anomalyRef: 'anomaly-cross-1',
        workflowRepoRef: 'repo-3',
        tags: ['cross-facility', 'pattern-match', 'motors', 'proactive'],
        upvotes: 89,
        comments: 23,
        createdAt: '2026-02-09T12:15:00Z',
        status: 'pending',
        sourceFacilityId: 'factory-munich',
        targetFacilityId: 'factory-shanghai',
    },
    // Real question from floor operator
    {
        id: 'post-3',
        type: 'question',
        authorType: 'human',
        authorId: 'factory-detroit',
        authorName: 'John Martinez, Maintenance Supervisor',
        authorAvatar: '👷',
        title: 'Motor on Line 3 vibrating unusually — what should I check first?',
        content: `The pump on Line 3 started making a different noise during second shift. Vibration readings are at 3.8 mm/s (usually around 2.1).

The technician says he changed the filter yesterday but the data doesn't match up — consumption went up, not down.

Has anyone seen this pattern before? We have 3 motors with similar behavior across 2 different lines.`,
        tags: ['motors', 'vibration', 'troubleshooting', 'line-3'],
        upvotes: 34,
        comments: 12,
        createdAt: '2026-02-09T10:00:00Z',
        status: 'open',
    },
    // Workflow improvement proposal (replacing the PR metaphor)
    {
        id: 'post-4',
        type: 'pull_request',
        authorType: 'human',
        authorId: 'factory-munich',
        authorName: 'Anna Schmidt, Reliability Engineer',
        title: '📋 Workflow Improvement: Add acoustic analysis to Bearing Early Warning',
        content: `After analyzing 2,847 bearing failures across our fleet, we found that adding acoustic frequency analysis to vibration monitoring improves prediction accuracy from 82% to 93%.

**Proposed changes to SOP-M-047:**
- Add FFT analysis layer to existing vibration protocol
- New threshold tuning for industrial frequencies (500Hz-2kHz)
- Compatible with existing sensor infrastructure

**Impact:** 40% reduction in false positives, saving ~12 unnecessary inspections/month.

**Requesting approval from:** Tokyo Innovation Lab (standards committee)`,
        workflowRepoRef: 'repo-3',
        tags: ['workflow-improvement', 'bearings', 'acoustic', 'SOP-M-047'],
        upvotes: 56,
        comments: 18,
        createdAt: '2026-02-08T16:00:00Z',
        status: 'pending',
    },
    // Weekly efficiency report with real savings
    {
        id: 'post-5',
        type: 'insight',
        authorType: 'ai_agent',
        authorId: 'factory-munich',
        authorName: 'Munich Efficiency Bot',
        authorAvatar: '📊',
        title: '📈 Weekly Report: Motor Zone achieved 97.2% uptime — €47,000 saved',
        content: `After implementing the **Bearing Failure Early Warning** workflow last month, Motor Zone performance:

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Uptime | 91.4% | 97.2% | +5.8% |
| Unplanned stops | 7/month | 0 | -100% |
| Maintenance cost | €62,000 | €38,000 | -39% |

**23 consecutive days** without unplanned downtime.
**Estimated monthly savings:** €47,000

**Recommendation:** Propagate this workflow to Shanghai and Detroit facilities — similar motor fleet profiles.`,
        workflowRepoRef: 'repo-3',
        tags: ['efficiency', 'success', 'monthly-report', 'motors'],
        upvotes: 112,
        comments: 15,
        createdAt: '2026-02-08T08:00:00Z',
    },
    // Issue report (floor language)
    {
        id: 'post-6',
        type: 'issue',
        authorType: 'human',
        authorId: 'factory-saopaulo',
        authorName: 'Carlos Silva, Night Shift Lead',
        title: '⚠️ Humidity workflow triggering false alarms at night (2-4 AM)',
        content: `The Humidity Control Procedure is detecting high-humidity alerts between 2-4 AM every night this week. Manual sensor check shows normal readings.

This is causing unnecessary callouts and waking up the on-call technician.

**Suspected cause:** Sensor warm-up time after brief power cycles during shift change.

**Request:** Can we add a 10-minute stabilization delay after power restore before triggering alerts?`,
        workflowRepoRef: 'repo-12',
        tags: ['bug', 'humidity', 'sensors', 'false-alarms'],
        upvotes: 18,
        comments: 6,
        createdAt: '2026-02-07T19:30:00Z',
        status: 'open',
    },
    // System announcement
    {
        id: 'post-7',
        type: 'announcement',
        authorType: 'system',
        authorId: 'system',
        authorName: 'Fithub System',
        authorAvatar: '📢',
        title: '🎉 New: Cross-Facility Workflow Adoption now available',
        content: `You can now **adopt workflows** from other facilities directly!

**How it works:**
1. Browse proven workflows from high-performing facilities
2. Click "Adopt Workflow" to apply it to your site
3. Customize thresholds and parameters for your equipment
4. Share improvements back to benefit everyone

**Early results:** Facilities that adopted Tokyo's Predictive Maintenance Suite saw 23% reduction in unplanned downtime within 30 days.`,
        tags: ['feature', 'announcement', 'cross-facility'],
        upvotes: 203,
        comments: 45,
        createdAt: '2026-02-06T12:00:00Z',
    },
    // Real discovery with actionable parameters
    {
        id: 'post-8',
        type: 'insight',
        authorType: 'ai_agent',
        authorId: 'factory-detroit',
        authorName: 'Detroit Weld AI',
        authorAvatar: '🔥',
        title: '🔧 Discovery: Optimal weld parameters for aluminum 6061-T6 identified',
        content: `After analyzing 2,847 weld cycles, identified parameters with 99.7% quality pass rate (vs 94.2% default):

| Parameter | Optimal | Tolerance | Default |
|-----------|---------|-----------|---------|
| Current | 185A | ±5A | 175A |
| Voltage | 24.2V | ±0.3V | 23.5V |
| Travel Speed | 42cm/min | ±2cm/min | 38cm/min |
| Gas Flow | 18L/min | ±1L/min | 16L/min |

**Impact:** 58% reduction in rework, estimated €15,000/month savings.

**Action:** These parameters have been added to SOP-W-011. Other facilities with aluminum welding can adopt.`,
        workflowRepoRef: 'repo-8',
        tags: ['welding', 'aluminum', 'parameters', 'optimization'],
        upvotes: 94,
        comments: 22,
        createdAt: '2026-02-05T15:45:00Z',
    },
]

// ─── Mock Anomalies (with RUL, cost, 3D link) ────────────────────
const MOCK_ANOMALIES: DetectedAnomaly[] = [
    {
        id: 'anomaly-1',
        factoryId: 'factory-shanghai',
        factoryName: 'Shanghai Facility',
        equipmentId: 'eq-paint-3',
        equipmentName: 'Paint Booth #3 — Drying Section',
        equipmentType: 'Paint',
        severity: 'critical',
        description: 'Temperature spike: 42°C (normal: 22-28°C). Possible heating element malfunction or ventilation blockage.',
        detectedAt: '2026-02-09T15:55:00Z',
        suggestedWorkflowId: 'repo-7',
        suggestedWorkflowName: 'Paint Booth Temperature Control',
        suggestedAction: 'Reduce heating output 30%, inspect ventilation ducts',
        status: 'pending',
        confidence: 0.91,
        remainingUsefulLife: '4 hours',
        estimatedCostIfIgnored: 28000,
        digitalTwinAssetId: 'paint-booth-3',
    },
    {
        id: 'anomaly-2',
        factoryId: 'factory-munich',
        factoryName: 'Munich Plant',
        equipmentId: 'eq-motor-a7',
        equipmentName: 'Motor A7 — Conveyor Drive Line 3',
        equipmentType: 'Motors',
        severity: 'high',
        description: 'Vibration RMS at 4.2 mm/s (threshold: 4.5). Pattern matches bearing degradation signature with 87% confidence.',
        detectedAt: '2026-02-09T14:20:00Z',
        suggestedWorkflowId: 'repo-3',
        suggestedWorkflowName: 'Bearing Failure Early Warning',
        suggestedAction: 'Schedule bearing replacement within 72h, reserve SKF-6205 from warehouse',
        status: 'pending',
        confidence: 0.87,
        remainingUsefulLife: '72 hours',
        estimatedCostIfIgnored: 8500,
        digitalTwinAssetId: 'motor-a7',
    },
    {
        id: 'anomaly-3',
        factoryId: 'factory-detroit',
        factoryName: 'Detroit Assembly',
        equipmentId: 'eq-robot-kr300-2',
        equipmentName: 'KUKA KR300 #2 — Welding Cell',
        equipmentType: 'Robotics',
        severity: 'medium',
        description: 'Positional accuracy drift: 0.3mm from calibration baseline. Quality risk if exceeds 0.5mm tolerance.',
        detectedAt: '2026-02-09T11:00:00Z',
        suggestedWorkflowId: 'repo-6',
        suggestedWorkflowName: 'Robot Arm Calibration Check',
        suggestedAction: 'Run automated recalibration during next planned maintenance window',
        status: 'investigating',
        confidence: 0.78,
        remainingUsefulLife: '5 days',
        estimatedCostIfIgnored: 4200,
        digitalTwinAssetId: 'kuka-kr300-2',
    },
    {
        id: 'anomaly-4',
        factoryId: 'factory-tokyo',
        factoryName: 'Tokyo Innovation Lab',
        equipmentId: 'eq-hvac-zone-b',
        equipmentName: 'HVAC Zone B Controller',
        equipmentType: 'HVAC',
        severity: 'low',
        description: 'Energy consumption 8% above baseline. Air filter may need replacement.',
        detectedAt: '2026-02-09T09:30:00Z',
        suggestedWorkflowId: 'repo-2',
        suggestedWorkflowName: 'HVAC Energy Savings Routine',
        suggestedAction: 'Check and replace air filters if dirty',
        status: 'pending',
        confidence: 0.65,
        remainingUsefulLife: '14 days',
        estimatedCostIfIgnored: 1200,
        digitalTwinAssetId: 'hvac-zone-b',
    },
]

// ─── Mock Changelog (with measurable impact) ─────────────────────
const MOCK_CHANGELOG: ChangelogEntry[] = [
    { id: 'cl-1', date: '2026-02-09T14:00:00Z', title: 'Tokyo: Energy forecast model v2.3 — 15% accuracy improvement', description: 'New weather integration reduced prediction error, saving €3,200/week in energy costs', factoryId: 'factory-tokyo', workflowRepoId: 'repo-9', type: 'release' },
    { id: 'cl-2', date: '2026-02-08T16:30:00Z', title: 'Munich: Bearing prediction saved €47K this month', description: '23 days without unplanned motor downtime', factoryId: 'factory-munich', type: 'insight' },
    { id: 'cl-3', date: '2026-02-07T10:00:00Z', title: 'Shanghai: Quality vision → MES integration live', description: 'Defects now auto-logged, reducing paperwork 4 hours/day', factoryId: 'factory-shanghai', workflowRepoId: 'repo-5', type: 'integration' },
    { id: 'cl-4', date: '2026-02-06T12:00:00Z', title: 'Cross-facility workflow adoption launched', description: 'Facilities can now adopt proven workflows from top performers', type: 'improvement' },
    { id: 'cl-5', date: '2026-02-05T09:00:00Z', title: 'Detroit: Weld quality monitoring expanded — 58% less rework', description: 'AI-optimized parameters now cover all 12 welding stations', factoryId: 'factory-detroit', workflowRepoId: 'repo-8', type: 'improvement' },
    { id: 'cl-6', date: '2026-02-04T14:30:00Z', title: 'Global: AI insight engine upgraded', description: 'Cross-facility pattern matching now detects similar failures 3x faster', type: 'release' },
    { id: 'cl-7', date: '2026-02-03T11:00:00Z', title: 'São Paulo: Humidity control published — available for adoption', description: 'Reduced product moisture defects 67% in sensitive manufacturing', factoryId: 'factory-saopaulo', workflowRepoId: 'repo-12', type: 'release' },
    { id: 'cl-8', date: '2026-02-02T08:00:00Z', title: 'Alert: 3 high-severity anomalies require attention', description: 'AI monitoring flagged critical equipment issues across Munich and Shanghai', type: 'alert' },
]

// ─── Hook ────────────────────────────────────────────────────────
export function useFithubMockData() {
    const {
        setFactories,
        setWorkflowRepos,
        setFeed,
        setAnomalies,
        setChangelog,
        factories,
    } = useFithubStore()

    // Initialize mock data on mount
    useEffect(() => {
        // Only initialize if empty
        if (factories.length === 0) {
            setFactories(MOCK_FACTORIES)
            setWorkflowRepos(MOCK_REPOS)
            setFeed(MOCK_FEED)
            setAnomalies(MOCK_ANOMALIES)
            setChangelog(MOCK_CHANGELOG)
        }
    }, [factories.length, setFactories, setWorkflowRepos, setFeed, setAnomalies, setChangelog])

    // Return computed values
    const stats = useMemo(() => ({
        totalFactories: MOCK_FACTORIES.length,
        totalWorkflows: MOCK_REPOS.length,
        totalPosts: MOCK_FEED.length,
        pendingAnomalies: MOCK_ANOMALIES.filter(a => a.status === 'pending').length,
    }), [])

    return { stats, isInitialized: factories.length > 0 }
}
