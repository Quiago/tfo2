# ADDENDUM v3: AI Agent Replaces Automation Technician

## This document REPLACES Addendum v2 (Work Order as Repo).
## The core architecture (Work Order = Repo) remains. The change is:
## Marco Silva (Automation Technician) is REMOVED.
## An AI Agent reads the Work Order data and auto-generates the workflow.
## Sarah approves and distributes. Fahad receives the complete package.

---

# PART A: WHY THIS CHANGE

## A.1 The Problem

"Automation Technician" or "Automation Engineer" is not a standard role on a factory floor. The people there are:
- Plant Managers (decision makers)
- Reliability/Maintenance Engineers (investigators + planners)
- Maintenance Technicians / Leads (hands-on execution)
- Operators (run the machines)

Nobody's job is "build automated workflows in a visual canvas." That's what AI should do. The platform's intelligence should READ everything that happened in a Work Order — the anomaly data, the investigation findings, the execution steps, the technician's notes and photos, the sensor verification — and GENERATE a preventive workflow automatically.

## A.2 The New Flow

```
OLD: AI detects → Sarah assigns → Omar investigates → Marco builds workflow → Ahmed executes → AI verifies → Sarah distributes
                                                        ^^^^^^^^^^^^^^^^^^^^
                                                        THIS WAS ARTIFICIAL

NEW: AI detects → Sarah assigns → Omar investigates → Ahmed executes → AI verifies → AI GENERATES WORKFLOW → Sarah reviews & approves → Sarah distributes to facilities → Fahad receives & adapts
                                                                                      ^^^^^^^^^^^^^^^^^^^^^^^^
                                                                                      THIS IS THE MAGIC MOMENT
```

## A.3 What the AI Agent Does

After the Work Order reaches "Resolved" status (all tasks complete, maintenance verified), the AI Agent:

1. **Reads** the entire Work Order: anomaly data, root cause findings, sensor correlations, execution checklist steps, technician notes, photos, before/after sensor readings
2. **Identifies** the pattern: "Bearing degradation → vibration > 4.0 mm/s → energy > +15% → temperature rise"
3. **Generates** a preventive workflow: trigger conditions, decision nodes, actions (create work order, alert team)
4. **Generates** an updated SOP: based on Ahmed's actual execution steps + notes (not a theoretical procedure)
5. **Presents** both to Sarah as an "AI Recommendation" for review
6. **Sarah reviews**, edits if needed, approves
7. **Sarah distributes** to other facilities with one click
8. **Fahad receives** the complete package: workflow + SOP + full Work Order context

---

# PART B: MODIFIED TYPES AND INTERFACES

## B.1 Remove Marco Silva from Mock Data

```typescript
// /lib/hooks/useOpshubMockData.ts — UPDATED

const MOCK_TEAM: TeamMember[] = [
  { id: 'sarah-chen', name: 'Sarah Chen', role: 'Plant Manager', facility: 'Munich Plant', avatarInitials: 'SC', avatarColor: '#3B82F6', status: 'available' },
  { id: 'omar-khalid', name: 'Omar Khalid', role: 'Reliability Engineer', facility: 'Munich Plant', avatarInitials: 'OK', avatarColor: '#10B981', status: 'available' },
  { id: 'ahmed-nasser', name: 'Ahmed Nasser', role: 'Maintenance Lead', facility: 'Munich Plant', avatarInitials: 'AN', avatarColor: '#EF4444', status: 'available' },
  { id: 'lisa-park', name: 'Lisa Park', role: 'Reliability Engineer', facility: 'Munich Plant', avatarInitials: 'LP', avatarColor: '#EC4899', status: 'in-field' },
  { id: 'fahad-alrashid', name: 'Fahad Al-Rashid', role: 'Plant Manager', facility: 'Riyadh Manufacturing', avatarInitials: 'FA', avatarColor: '#8B5CF6', status: 'available' },
];
```

## B.2 Work Order Tasks — Updated (No Workflow Build Task)

```typescript
// The 4 tasks for WO-2026-0847 are now:

const MOCK_TASKS: WorkOrderTask[] = [
  {
    id: 'task-1',
    number: 1,
    workOrderId: 'wo-0847',
    type: 'investigation',
    title: 'Investigate root cause',
    description: 'Analyze sensor data, identify pattern, determine root cause of temperature anomaly.',
    assignee: MOCK_TEAM[1], // Omar
    assignedBy: MOCK_TEAM[0], // Sarah
    priority: 'critical',
    status: 'in-progress',
    note: 'Check ventilation correlation with energy spike',
    dependsOn: [],
    isBlocked: false,
    updates: [],
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-2',
    number: 2,
    workOrderId: 'wo-0847',
    type: 'execution',
    title: 'Replace heating element — Paint Booth #3',
    description: 'Execute repair procedure. Replace heating element, clear ventilation duct, verify temperature normalization.',
    assignee: MOCK_TEAM[2], // Ahmed
    assignedBy: MOCK_TEAM[0], // Sarah
    priority: 'critical',
    status: 'pending',
    dueDate: new Date().toISOString(),
    note: 'Parts staged in Warehouse B. Wait for investigation to confirm diagnosis.',
    dependsOn: ['task-1'],
    isBlocked: true,
    checklist: MOCK_EXECUTION_CHECKLIST.steps,
    updates: [],
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-3',
    number: 3,
    workOrderId: 'wo-0847',
    type: 'verification',
    title: 'Verify maintenance integrity',
    description: 'Compare pre/post sensor readings to confirm repair was effective.',
    assignee: MOCK_TEAM[1], // Omar
    assignedBy: MOCK_TEAM[0], // Sarah (auto-assigned by system)
    priority: 'high',
    status: 'pending',
    dependsOn: ['task-2'],
    isBlocked: true,
    updates: [],
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-4',
    number: 4,
    workOrderId: 'wo-0847',
    type: 'approval',
    title: 'Review AI-generated workflow & SOP',
    description: 'Review the preventive workflow and updated SOP auto-generated by the AI Agent from this work order data. Approve for publication to other facilities.',
    assignee: MOCK_TEAM[0], // Sarah
    assignedBy: { id: 'ai-agent', name: 'AI Agent', role: 'System', facility: 'Munich Plant', avatarInitials: '🤖', avatarColor: '#A855F7', status: 'available' },
    priority: 'high',
    status: 'pending',
    dependsOn: ['task-3'],
    isBlocked: true,
    updates: [],
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
];
```

## B.3 AI Agent Recommendation Interface

```typescript
// /lib/types/opshub.ts — ADD

interface AIAgentRecommendation {
  id: string;
  workOrderId: string;
  generatedAt: string;
  status: 'pending-review' | 'approved' | 'rejected' | 'modified';
  reviewedBy?: TeamMember;
  reviewedAt?: string;

  // What the AI generated
  workflow: AIGeneratedWorkflow;
  sop: AIGeneratedSOP;
  summary: AIRecommendationSummary;
}

interface AIRecommendationSummary {
  patternDetected: string;         // "Bearing degradation → vibration → energy → temperature"
  dataSourcesUsed: string[];       // ["Sensor data (3 days)", "Omar's investigation", "Ahmed's execution notes", "Post-repair verification"]
  confidenceScore: number;         // 0-1
  estimatedPreventionValue: number; // €28,000 (same incident cost)
  estimatedEarlyDetection: string; // "48-72 hours earlier"
  applicableFacilities: string[];  // ["Munich", "Riyadh", "Detroit"] — based on similar equipment
}

interface AIGeneratedWorkflow {
  id: string;
  name: string;                    // "Paint Booth Bearing Degradation Early Warning"
  description: string;
  version: string;                 // "v1 — AI Generated"
  trigger: WorkflowTriggerSpec;
  conditions: WorkflowConditionSpec[];
  actions: WorkflowActionSpec[];
  nodes: any[];                    // React Flow nodes for visual display
  edges: any[];                    // React Flow edges
  generatedFrom: {
    anomalyPattern: string;
    sensorThresholds: { metric: string; operator: string; value: number; unit: string }[];
    correlations: string[];        // ["vibration ↔ energy consumption", "energy ↔ temperature"]
  };
}

interface WorkflowTriggerSpec {
  type: 'sensor-threshold' | 'scheduled' | 'manual';
  description: string;             // "When vibration > 4.0 mm/s on paint booth motors"
  config: Record<string, any>;
}

interface WorkflowConditionSpec {
  type: 'and' | 'or' | 'threshold';
  description: string;             // "AND energy consumption > +15% above baseline"
  config: Record<string, any>;
}

interface WorkflowActionSpec {
  type: 'create-work-order' | 'send-alert' | 'log-entry' | 'schedule-inspection';
  description: string;             // "Create high-priority Work Order for bearing inspection"
  config: Record<string, any>;
}

interface AIGeneratedSOP {
  id: string;
  title: string;                   // "Paint Booth Heating Element Replacement — SOP-PB3-HE-001"
  version: string;                 // "v1 — AI Generated from WO-2026-0847"
  description: string;
  basedOn: string;                 // "Ahmed Nasser's execution of Task #2"
  steps: SOPStep[];
  safetyNotes: string[];
  partsRequired: { partName: string; partNumber: string; quantity: number }[];
  estimatedDuration: string;       // "1h 30m (based on actual execution)"
  toolsRequired: string[];
}

interface SOPStep {
  order: number;
  title: string;
  instructions: string;
  caution?: string;
  requiresPhoto: boolean;
  requiresSignoff: boolean;
  estimatedTime: string;           // "15 min" (from actual execution data)
  sourceNote?: string;             // "Based on Ahmed Nasser's execution note: ..."
}
```

## B.4 AI Agent Recommendation Card in Workflows Tab

When the AI Agent generates a recommendation, it appears as a special card in the Work Order's Workflows tab:

```
┌──────────────────────────────────────────────────────────────────────┐
│ ⚡ Workflows (1)                                                     │
│                                                                      │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ 🤖 AI RECOMMENDATION — Pending Review                           │ │
│ │ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ │ │
│ │                                                                  │ │
│ │ The AI Agent analyzed this entire Work Order and generated:      │ │
│ │                                                                  │ │
│ │ 📊 Pattern Detected:                                             │ │
│ │ Bearing degradation → vibration increase (>4.0 mm/s)            │ │
│ │ → energy draw increase (+17%) → temperature spike                │ │
│ │                                                                  │ │
│ │ 📁 Data Sources Used:                                            │ │
│ │ • Sensor data — 3-day vibration/energy/temperature trend        │ │
│ │ • Omar Khalid's investigation finding + Timeline annotations    │ │
│ │ • Ahmed Nasser's execution notes ("terminal B overheating")     │ │
│ │ • Post-repair sensor verification (before/after comparison)     │ │
│ │                                                                  │ │
│ │ 🎯 Confidence: 94%                                               │ │
│ │ 💰 Estimated Prevention Value: €28,000 per incident             │ │
│ │ ⏱ Early Detection: 48-72 hours before failure                   │ │
│ │ 🏭 Applicable: Munich, Riyadh, Detroit (similar equipment)      │ │
│ │                                                                  │ │
│ │ ┌──────────────────────────────────────────────────────────┐     │ │
│ │ │ ⚡ GENERATED WORKFLOW                                     │     │ │
│ │ │                                                          │     │ │
│ │ │ "Paint Booth Bearing Degradation Early Warning"          │     │ │
│ │ │ v1 — AI Generated from WO-2026-0847                     │     │ │
│ │ │                                                          │     │ │
│ │ │ TRIGGER: Vibration > 4.0 mm/s on paint booth motors     │     │ │
│ │ │ AND: Energy consumption > +15% above 7-day baseline     │     │ │
│ │ │ THEN:                                                    │     │ │
│ │ │   → Create Work Order (priority: high,                   │     │ │
│ │ │     type: bearing inspection,                            │     │ │
│ │ │     attach SOP-PB3-HE-001)                               │     │ │
│ │ │   → Alert: Plant Manager + Reliability Engineer          │     │ │
│ │ │   → Schedule: Inspection within 24 hours                 │     │ │
│ │ │                                                          │     │ │
│ │ │ [Open in Workflow Builder →]                             │     │ │
│ │ └──────────────────────────────────────────────────────────┘     │ │
│ │                                                                  │ │
│ │ ┌──────────────────────────────────────────────────────────┐     │ │
│ │ │ 📋 GENERATED SOP                                         │     │ │
│ │ │                                                          │     │ │
│ │ │ "Paint Booth Heating Element Replacement"                │     │ │
│ │ │ SOP-PB3-HE-001 · Based on Ahmed Nasser's execution      │     │ │
│ │ │                                                          │     │ │
│ │ │ 5 steps · Est. 1h 30m · 3 safety gates                  │     │ │
│ │ │ Parts: Bearing SKF 6205-2RS, HE-2500-PB3,              │     │ │
│ │ │        Ventilation Fan Motor VFM-400-CE                  │     │ │
│ │ │                                                          │     │ │
│ │ │ ⚠ AI Note: "Ahmed noted terminal B showed overheating   │     │ │
│ │ │ from a loose connection. Step 4 updated to include       │     │ │
│ │ │ terminal torque verification (25Nm) — a check NOT in     │     │ │
│ │ │ the original procedure."                                 │     │ │
│ │ │                                                          │     │ │
│ │ │ [View Full SOP →]                                        │     │ │
│ │ └──────────────────────────────────────────────────────────┘     │ │
│ │                                                                  │ │
│ │ ┌──────────────────────────────────────────────────────┐         │ │
│ │ │ ✅ Approve & Publish    ✏️ Edit First    ❌ Reject   │         │ │
│ │ └──────────────────────────────────────────────────────┘         │ │
│ │                                                                  │ │
│ │ Approve: Publishes workflow + SOP to OpsHub, notifies            │ │
│ │ applicable facilities (Munich, Riyadh, Detroit).                 │ │
│ │                                                                  │ │
│ └──────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### B.4.1 "Edit First" Flow

If Sarah clicks "Edit First":
1. The workflow opens in the Workflow Builder with all AI-generated nodes pre-loaded
2. She can modify thresholds, add/remove actions, change recipients
3. A banner at top: "Editing AI-generated workflow — Original: WO-2026-0847"
4. When done editing: "Save & Return to Review" button takes her back to the approval card
5. The card now shows "Modified by Sarah Chen" and a diff: "Changed: threshold 4.0 → 3.8 mm/s"

### B.4.2 "Approve & Publish" Flow

When Sarah clicks "Approve & Publish":

1. A confirmation modal appears:

```
┌────────────────────────────────────────────────────┐
│ Publish to Facilities                               │
│                                                    │
│ This will share the workflow and SOP with:         │
│                                                    │
│ ☑ Munich Plant (this facility — auto-activate)     │
│ ☑ Riyadh Manufacturing (similar equipment found)   │
│ ☑ Detroit Assembly (similar equipment found)       │
│ ☐ Shanghai Production (no matching equipment)      │
│ ☐ Tokyo Electronics (no matching equipment)        │
│ ☐ São Paulo Assembly (no matching equipment)       │
│                                                    │
│ Each facility manager will receive the workflow    │
│ + SOP + full Work Order context for review.        │
│                                                    │
│ [Cancel]         [✅ Approve & Publish]             │
└────────────────────────────────────────────────────┘
```

2. Facilities with similar equipment are pre-checked (AI determined this)
3. Facilities without matching equipment are unchecked but selectable
4. On confirm:
   - Workflow status changes to "Published ✅"
   - SOP status changes to "Published ✅"
   - Activity entry: "Sarah Chen approved and published AI-generated workflow + SOP to 3 facilities"
   - Each selected facility manager receives it in their My Tasks tab

---

## B.5 What Fahad Receives — The Complete Package

When Fahad opens his My Tasks tab in Riyadh, he sees:

```
┌──────────────────────────────────────────────────────────────┐
│ 📦 New: AI-Generated Solution from Munich                    │
│ "Paint Booth Bearing Degradation Early Warning"              │
│ From WO-2026-0847 · Approved by Sarah Chen · 1h ago         │
│                                                              │
│ Includes:                                                    │
│ ⚡ Preventive workflow (trigger + conditions + actions)       │
│ 📋 SOP: Heating Element Replacement (5 steps)               │
│ 📊 Full Work Order context (investigation + execution)       │
│                                                              │
│ 🎯 AI Confidence: 94%                                        │
│ 🏭 Equipment match: 87% similar to your Paint Booth #2       │
│ 💰 Prevention value: SAR 105,000 per incident               │
│                                                              │
│ [View Full Package] [Adapt for Riyadh] [Dismiss]            │
└──────────────────────────────────────────────────────────────┘
```

When Fahad clicks "View Full Package," he sees:

### Package Detail View

```
┌──────────────────────────────────────────────────────────────┐
│ ← Back to My Tasks                                           │
│                                                              │
│ 🤖 AI Solution Package                                       │
│ From: WO-2026-0847 · Munich Plant                            │
│ Approved by: Sarah Chen · Feb 10, 2026                       │
│                                                              │
│ [📋 Summary] [⚡ Workflow] [📋 SOP] [📊 Source Work Order]   │
│                                                              │
│ ── SUMMARY ──────────────────────────────────────────────── │
│                                                              │
│ Pattern: Bearing degradation on paint booth ventilation      │
│ motors causes progressive vibration increase, leading to     │
│ energy overconsumption and eventual temperature failure.     │
│                                                              │
│ Root Cause: Bearing wear → increased vibration → motor       │
│ compensates with higher energy → reduced airflow →           │
│ temperature rise in drying section.                          │
│                                                              │
│ Detection Window: 48-72 hours before failure                 │
│ Original Incident Cost: €28,000 (SAR 105,000)               │
│ Resolution Time: 4h 31m (detection to verified repair)       │
│                                                              │
│ Key Learning from Execution:                                 │
│ "Ahmed Nasser found that terminal B had a loose              │
│  connection contributing to overheating. This was NOT in     │
│  the original diagnosis. The SOP now includes terminal       │
│  torque verification as an added step."                      │
│                                                              │
│ ── WORKFLOW PREVIEW ─────────────────────────────────────── │
│                                                              │
│ [Sensor Trigger] → [AND Condition] → [Create Work Order]    │
│  Vibration>4.0      Energy>+15%       + [Send Alert]        │
│                                        + [Schedule Inspect]  │
│                                                              │
│ ── SOP PREVIEW ──────────────────────────────────────────── │
│                                                              │
│ 5 steps · Est. 1h 30m                                       │
│ 1. Isolate Power (LOTO) — 15 min                            │
│ 2. Remove old element — 20 min                              │
│ 3. Install new element + CHECK TERMINAL TORQUE — 25 min    │
│ 4. Reconnect and functional test — 15 min                   │
│ 5. Final verification and cleanup — 15 min                  │
│                                                              │
│ ── SOURCE WORK ORDER ────────────────────────────────────── │
│                                                              │
│ [Open WO-2026-0847 →] (read-only access to full Munich WO)  │
│ Team: Sarah Chen, Omar Khalid, Ahmed Nasser                  │
│ Duration: 4h 31m · Status: Resolved ✅                       │
│ Activity: 16 entries (full audit trail available)             │
│                                                              │
│ ──────────────────────────────────────────────────────────── │
│                                                              │
│ [Adapt for Riyadh]                                           │
└──────────────────────────────────────────────────────────────┘
```

### Fahad's "Adapt for Riyadh" Flow

When Fahad clicks "Adapt for Riyadh":

```
┌──────────────────────────────────────────────────────────────┐
│ Adapt for Riyadh Manufacturing                               │
│                                                              │
│ ── WORKFLOW ADJUSTMENTS ─────────────────────────────────── │
│                                                              │
│ Vibration threshold:                                         │
│ Munich: 4.0 mm/s → Riyadh: [4.5] mm/s                      │
│ ℹ️ AI suggests 4.5 for Riyadh ambient temperature (45°C)     │
│                                                              │
│ Energy baseline comparison period:                           │
│ Munich: 7 days → Riyadh: [7] days                           │
│                                                              │
│ Energy threshold:                                            │
│ Munich: +15% → Riyadh: [+18%]                               │
│ ℹ️ AI suggests +18% — Riyadh cooling loads cause higher      │
│    baseline energy variance                                  │
│                                                              │
│ Alert recipients:                                            │
│ Munich: Sarah Chen, Omar Khalid                              │
│ Riyadh: [Fahad Al-Rashid ✕] [+ Add recipient]               │
│                                                              │
│ Currency:                                                    │
│ Munich: EUR → Riyadh: SAR (auto-converted)                   │
│                                                              │
│ ── SOP ADJUSTMENTS ──────────────────────────────────────── │
│                                                              │
│ ☑ Use Riyadh part numbers (auto-mapped where available)      │
│ ☑ Adjust safety notes for Riyadh HSE requirements            │
│ ☐ Add additional steps (manual)                              │
│                                                              │
│ ℹ️ AI mapped 2/3 parts to Riyadh inventory:                  │
│ ✅ Bearing SKF 6205-2RS → Same (in stock: 3 units)          │
│ ✅ Heating Element 2.5kW → HE-2500-RY (in stock: 2 units)  │
│ ⚠️ Ventilation Fan Motor → No Riyadh equivalent found        │
│    [Search Riyadh Inventory] [Keep Munich Part Number]       │
│                                                              │
│ [Cancel]     [✅ Activate for Riyadh]                        │
└──────────────────────────────────────────────────────────────┘
```

Key detail: **AI suggests threshold adjustments** based on Riyadh's environmental conditions. Fahad isn't blindly copying — the AI helps him contextualize.

---

## B.6 Updated Work Order Team Sidebar

Since there's no Marco, the Work Order team for WO-2026-0847 is:

```
👥 Team

SC Sarah Chen
   Owner · Plant Manager
   
OK Omar Khalid
   Investigator · Reliability Engineer
   ● In Progress

AN Ahmed Nasser
   Maintenance Lead
   ○ Pending (blocked by #1)

🤖 AI Agent
   Workflow Generation
   ○ Waiting (triggers after resolution)

[+ Assign]
```

The AI Agent appears in the team sidebar as a special entry — it's not a human but it IS a contributor. It has a purple robot avatar and its status shows "Waiting (triggers after resolution)" until the work order is resolved, then changes to "Generated recommendation — pending review."

---

## B.7 Updated Activity Tab for WO-2026-0847

The full timeline now flows:

```
⬤── 7:15 AM
│ 🤖 AI System detected anomaly
│    Temperature 42°C on Paint Booth #3 (91% confidence)
│    Work Order WO-2026-0847 auto-created

⬤── 7:18 AM
│ SC Sarah Chen assigned Task #1 to Omar Khalid
│    Type: Investigation · Priority: Critical

⬤── 7:19 AM
│ SC Sarah Chen assigned Task #2 to Ahmed Nasser
│    Type: Execution · Due: Today 4:00 PM
│    ⏳ Blocked: Depends on Task #1

⬤── 7:22 AM
│ OK Omar Khalid accepted Task #1
│    Status: Pending → In Progress

⬤── 7:30 AM
│ OK Omar Khalid added Timeline annotation
│    "Bearing degradation onset — root cause"

⬤── 7:35 AM
│ OK Omar Khalid shared investigation finding
│    Root cause: bearing → vibration → energy → temperature
│    Linked: Timeline range Feb 7-10, 3D Paint Booth #3

⬤── 7:40 AM
│ OK Omar Khalid completed Task #1
│    Finding: Bearing degradation confirmed
│    Task #2 dependency resolved → Ahmed Nasser unblocked

⬤── 7:41 AM
│ OK Omar Khalid posted in Discussion
│    "@Ahmed Nasser — confirmed it's the heating element.
│     Bearing on ventilation motor is degraded. Also check
│     terminal connections — energy data suggests possible
│     loose contact. Parts in Warehouse B."

⬤── 8:00 AM
│ AN Ahmed Nasser accepted Task #2
│    Status: Pending → Accepted

⬤── 10:00 AM
│ AN Ahmed Nasser started Task #2
│    Execution checklist opened (5 steps)

⬤── 10:15 AM
│ AN Ahmed Nasser completed step 1/5
│    "Isolated power supply (LOTO)" ✅ · Photo attached

⬤── 10:35 AM
│ AN Ahmed Nasser completed step 2/5
│    "Removed old heating element" ✅ · Photo attached
│    📝 Note: "Old element showed signs of overheating on
│     terminal B — loose connection was contributing factor"

⬤── 11:00 AM
│ AN Ahmed Nasser completed step 3/5
│    "Installed new element, verified terminal torque" ✅

⬤── 11:15 AM
│ AN Ahmed Nasser completed step 4/5
│    "Reconnected, functional test passed. Temp: 25.1°C" ✅

⬤── 11:30 AM
│ AN Ahmed Nasser completed Task #2 (5/5 steps)
│    Duration: 1h 30m · 3 photos · 2 notes attached

⬤── 11:35 AM
│ 🤖 AI System — Maintenance Integrity Verification
│    Post-repair sensor readings:
│    Temperature: 42°C → 24.1°C ✅
│    Vibration: 4.2 mm/s → 1.8 mm/s ✅
│    Energy: 17.8 kW → 15.0 kW ✅
│    Verdict: Maintenance effective ✅

⬤── 11:40 AM
│ OK Omar Khalid completed Task #3 (Verification)
│    "Sensor readings confirm successful repair."

⬤── 11:41 AM
│ 🤖 System — Work Order status: Open → Resolved
│    Total duration: 4h 26m · Cost saved: €28,000

⬤── 11:45 AM  ← THIS IS THE NEW MAGIC MOMENT
│ 🤖 AI Agent — Generated Recommendation
│    Analyzed: 16 activity entries, 3 sensor streams,
│    1 investigation finding, 5 execution steps, 2 tech notes
│    
│    Generated:
│    ⚡ Workflow: "Paint Booth Bearing Degradation Early Warning"
│       Trigger: vibration > 4.0 mm/s AND energy > +15%
│       Actions: Create WO + Alert team + Schedule inspection
│    📋 SOP: "Paint Booth Heating Element Replacement"
│       5 steps · 1h 30m · Includes terminal torque check
│       (added from Ahmed's discovery)
│    
│    Task #4 created → Assigned to Sarah Chen for review
│    🎯 Confidence: 94%
│    🏭 Applicable: Munich, Riyadh, Detroit

⬤── 12:00 PM
│ SC Sarah Chen reviewed AI recommendation
│    Workflow: Approved ✅ (no modifications)
│    SOP: Approved ✅ (no modifications)
│    "Excellent — the AI caught Ahmed's terminal B finding
│     and added it to the SOP. This wasn't in our original
│     maintenance procedure."

⬤── 12:01 PM
│ SC Sarah Chen published to 3 facilities
│    Munich (auto-activated) · Riyadh · Detroit

⬤── 2:30 PM
│ FA Fahad Al-Rashid (Riyadh) adapted package
│    Workflow: threshold 4.0 → 4.5 mm/s, energy +15% → +18%
│    SOP: 2/3 parts mapped to Riyadh inventory
│    Activated for Riyadh Manufacturing
```

---

# PART C: REVISED DEMO SCRIPT — "The Munich Incident" (v3)

## 4 Acts + AI Moment + Network Effect. 14 minutes. 3 humans + 1 AI Agent.

### Characters

| Character | Role | Tier |
|-----------|------|------|
| **Sarah Chen** | Plant Manager, Munich | Decision maker, assigns, approves |
| **Omar Khalid** | Reliability Engineer, Munich | Investigates root cause |
| **Ahmed Nasser** | Maintenance Lead, Munich | Executes physical repair |
| **🤖 AI Agent** | System | Generates workflow + SOP from Work Order data |
| **Fahad Al-Rashid** | Plant Manager, Riyadh | Receives and adapts solution |

---

### ACT 1: "THE ALERT" (3 min) — Sarah Chen

**Open on:** OpsHub Home, Executive view.

> "It's 7:15 AM in Munich. Sarah Chen opens OpsHub — her operational hub."

**Action:** Show Risk Summary Card: €36,500 total exposure.

> "€36,500 in risk. This one is critical."

**Action:** Point to Paint Booth #3 anomaly. 91% confidence, €28K, RUL 4 hours.

> "Paint Booth #3, 42°C — 14 degrees above normal. 4 hours before failure. €28,000 at risk."

**Action:** Click "Approve & Create Work Order." Work Order WO-2026-0847 created. Show the Work Order Detail view.

> "She creates a Work Order. In Tripolar, a Work Order is like a GitHub repository — it's the single container where everything about this incident will live. The investigation, the execution, the discussion, the automated workflows, the full audit trail."

**Action:** Click "+ Assign" in Team sidebar. Assign Omar → Investigation, Critical. Add note: "Check ventilation correlation with energy spike."

> "She assigns Omar Khalid, her Reliability Engineer, to investigate."

**Action:** Assign Ahmed → Execution, Critical, Due 4:00 PM, Depends on Task #1.

> "And Ahmed Nasser, her Maintenance Lead, to execute the repair — but his task is blocked until Omar confirms the diagnosis. Just like a pull request that can't merge until CI passes."

**Action:** Show Tasks tab: Task #1 (Omar, In Progress), Task #2 (Ahmed, Blocked). Show Team sidebar: SC, OK, AN, 🤖 AI Agent (Waiting).

> "Notice the AI Agent in the team sidebar. It's watching. When this Work Order resolves, it will read everything that happened and generate a preventive solution. But first — the humans need to do their work."

**Action:** Open Discussion tab. Type: "@Omar Khalid — anomaly on Paint Booth #3. Check if ventilation system is correlated with the energy spike. @Ahmed Nasser — parts being staged in Warehouse B. You'll start once Omar confirms."

> "One message. Two people notified. Full context. No WhatsApp."

---

### ACT 2: "THE INVESTIGATION" (3 min) — Omar Khalid

**Switch to:** Omar's view. OpsHub → My Tasks.

> "Omar opens OpsHub. His task is right here."

**Action:** Show My Tasks with Task #1 at the top. Click "▶ Start" → Timeline opens.

> "He clicks Start and the platform takes him to the Timeline with the relevant data pre-loaded."

**Action:** Show Timeline: vibration climbing 3 days, cross-layer correlation, annotation.

> "Vibration climbing for 3 days. Energy spiking in correlation. He marks the root cause and shares his finding."

**Action:** Navigate to Digital Twin. Auto-fly. Heatmap mode.

> "Spatial confirmation. 38% health on the digital twin. Heatmap shows the full picture."

**Action:** Back to WO-2026-0847 → Discussion: "@Ahmed Nasser — confirmed: heating element failure from bearing degradation. Also check terminal connections — energy data suggests possible loose contact."

> "He posts findings in the Discussion. Tags Ahmed with the specific insight about terminal connections. This note will be critical later."

**Action:** Task #1 marked complete. Task #2 changes from "Blocked" to "Pending."

> "Investigation done. Ahmed's task automatically unblocks."

---

### ACT 3: "THE EXECUTION" (3 min) — Ahmed Nasser

**Switch to:** Ahmed's view. OpsHub → My Tasks.

> "Ahmed Nasser. Maintenance Lead. His task just unblocked."

**Action:** Show My Tasks with Task #2 now "Pending" (was "Blocked"). Click "▶ Start."

> "Execution checklist opens. 5 steps. Large buttons for gloved hands."

**Action:** Show full-screen checklist. Step 1: LOTO. Photo attached. ✅

> "Step 1: Power isolation with LOTO. Photo as proof."

**Action:** Step 2: Remove old element. Ahmed types note: "Old element showed overheating on terminal B — loose connection was contributing factor." Photo attached. ✅

> "Step 2: He removes the old element and notices something. Terminal B has a loose connection. He documents this finding. This wasn't in Omar's investigation — it's new intelligence from the person touching the equipment."

**Action:** Steps 3-5 fast-forward. Progress: 100%.

> "Steps 3 through 5. Install, test, verify. Each step documented."

**Action:** Completion screen: 5/5, 1h 30m, 3 photos.

> "All done. 1 hour 30 minutes. Every step traced."

**Action:** Show Activity tab: AI Maintenance Integrity Verification appears.

```
🤖 Temperature: 42°C → 24.1°C ✅
🤖 Vibration: 4.2 → 1.8 mm/s ✅
🤖 Energy: 17.8 → 15.0 kW ✅
🤖 Maintenance effective ✅
```

> "The AI verifies the repair by comparing sensor readings. Temperature dropped 18 degrees. Vibration normalized. Energy back to baseline. Verified by physics — not by paperwork."

**Action:** Work Order status → Resolved. Duration: 4h 26m. Cost saved: €28,000.

> "Work Order resolved. €28,000 in risk eliminated."

---

### ACT 4: "THE AI MOMENT" (2.5 min) — AI Agent + Sarah

**Stay on:** WO-2026-0847 Activity tab. A new entry animates in.

> "Now watch. The Work Order is resolved. The AI Agent activates."

**Action:** Show the AI Agent activity entry appearing with a subtle animation (purple glow):

```
🤖 AI Agent — Generated Recommendation
Analyzed: 16 activity entries, 3 sensor streams,
1 investigation finding, 5 execution steps, 2 tech notes

Generated:
⚡ Workflow: "Paint Booth Bearing Degradation Early Warning"
📋 SOP: "Paint Booth Heating Element Replacement"

Task #4 assigned to Sarah Chen for review
```

> "The AI Agent just read this entire Work Order. Every finding Omar made. Every step Ahmed executed. Every note, every photo, every sensor reading. And it generated two things."

**Action:** Navigate to Workflows tab. Show the AI Recommendation card.

> "First: a preventive workflow. Trigger: vibration above 4.0 millimeters per second AND energy consumption above 15% above baseline. Actions: create a work order, alert the team, schedule an inspection. This will catch the same pattern 48 to 72 hours before failure."

> "Second: an updated Standard Operating Procedure. Based on what Ahmed actually did — not a theoretical procedure. Five steps. Estimated time: 1 hour 30 minutes — because that's how long it actually took."

**Action:** Point to the AI Note in the SOP section:

> "And look at this. The AI caught Ahmed's note about the loose terminal connection and added a torque verification step to the SOP. This was NOT in the original maintenance procedure. Ahmed discovered it hands-on. The AI learned it. The next technician will check for it."

*[Pause for audience reaction]*

> "This is the difference. The knowledge doesn't die in a WhatsApp message or a paper form. It flows into the system. It becomes institutional intelligence."

**Action:** Switch to Sarah's view. Show My Tasks with Task #4: "Review AI-generated workflow & SOP."

> "Sarah receives the recommendation in her My Tasks. She reviews the workflow, reviews the SOP."

**Action:** Sarah clicks "✅ Approve & Publish." Show the facility selection modal: Munich ✅, Riyadh ✅, Detroit ✅.

> "She approves. No modifications needed — the AI got it right. She publishes to Munich, Riyadh, and Detroit — every facility with similar equipment."

---

### ACT 5: "THE NETWORK EFFECT" (1.5 min) — Fahad Al-Rashid

**Switch to:** Fahad's view. OpsHub → My Tasks. Facility: Riyadh.

> "Fahad Al-Rashid. Riyadh Manufacturing. 5,000 kilometers away."

**Action:** Show My Tasks:
```
📦 AI Solution Package from Munich
Workflow + SOP · Approved by Sarah Chen · 1h ago
🏭 Equipment match: 87% similar to your Paint Booth #2
[View Full Package] [Adapt for Riyadh]
```

> "He receives the full package. Not just a workflow — the complete context. He can read the entire Munich Work Order."

**Action:** Click "View Full Package." Show the summary, workflow preview, SOP preview, link to source Work Order.

> "He sees the pattern. The detection thresholds. The execution procedure. Ahmed's terminal B discovery. Everything Munich learned."

**Action:** Click "Adapt for Riyadh." Show the adaptation screen with AI-suggested threshold adjustments.

> "He adapts it. The AI suggests higher thresholds because Riyadh runs hotter. Two minutes of configuration."

**Action:** Click "Activate for Riyadh." Show activation confirmation.

> "Activated. Munich spent 4 hours and €28,000 learning this lesson. Riyadh deployed the prevention in 2 minutes and zero cost."

---

### CLOSING (30 seconds)

**Action:** Show WO-2026-0847 with the full Activity timeline scrolled to show all entries.

> "One incident. One Work Order. Three people. One AI Agent.

> Sarah saw the risk and assembled her team.
> Omar investigated and shared findings.
> Ahmed executed the repair and discovered something the investigation missed.
> The AI read everything — every note, every sensor, every photo — and generated a solution that includes knowledge from ALL of them.
> Sarah approved. Three facilities received it. Fahad deployed it.

> This is not a tool. This is how industrial operations should work.

> This is Tripolar.

> Thank you."

---

# PART D: UPDATED SPRINT PLAN

### Sprint 1 (Days 1-3): Foundation
1. Fithub → OpsHub rename (files, stores, types, routes)
2. OpsHub 3-tab navigation (Home / My Tasks / Work Orders)
3. Core types: WorkOrderCard, WorkOrderTask, TeamMember, AIAgentRecommendation, AIGeneratedWorkflow, AIGeneratedSOP, ExecutionChecklist
4. Mock data: MOCK_TEAM (no Marco), MOCK_WORK_ORDER_0847, MOCK_TASKS (4 tasks), MOCK_EXECUTION_CHECKLIST
5. UserAvatar + AvatarStack components

### Sprint 2 (Days 4-8): Work Order System
6. Work Orders list tab with cards
7. Work Order Detail view (3-column, 5 inner tabs)
8. Overview tab (summary, equipment, root cause, parts)
9. Tasks tab (task cards with status, dependencies, blocking)
10. Discussion tab (threaded comments with @mentions)
11. Activity tab (full audit timeline)
12. Team sidebar (roles, status, AI Agent entry)

### Sprint 3 (Days 9-12): Collaboration + Execution
13. AssignmentPopover component
14. MentionInput component with @autocomplete
15. My Tasks tab (personal filtered view)
16. Notification badge on OpsHub nav tab
17. Execution Checklist (full-screen, step-by-step)
18. Photo capture mock + voice note mock
19. Task dependency unlocking logic
20. Connect anomaly cards → Work Order creation + assignment

### Sprint 4 (Days 13-16): AI Agent + Workflows
21. AI Recommendation card in Workflows tab
22. AI-generated workflow preview (node graph display, read-only)
23. AI-generated SOP preview
24. "Edit First" flow (opens Workflow Builder with AI nodes pre-loaded)
25. "Approve & Publish" flow (facility selection + distribution)
26. AI maintenance integrity verification (before/after sensor comparison)
27. Auto-resolve Work Order when all tasks + verification complete
28. AI Agent triggers after resolution → generates recommendation → creates Task #4

### Sprint 5 (Days 17-20): Cross-Facility + Timeline + Digital Twin
29. Package Detail View (what Fahad sees)
30. "Adapt for [Facility]" configuration screen with AI-suggested adjustments
31. All Timeline enhancements (Export CSV, Annotations, Cross-layer correlation)
32. All Digital Twin enhancements (Auto-fly, Heatmap, Pulse effect)
33. Workflow Template Gallery (used by "Edit First" flow as a starting point)

### Sprint 6 (Days 21-23): Demo Polish
34. Saudi/Gulf localization (currency toggle, Riyadh facility, Arabic names)
35. Demo Mode panel (user switching: Sarah → Omar → Ahmed → AI → Sarah → Fahad)
36. Pre-populate ALL mock data for complete Munich Incident story
37. Full 14-minute demo rehearsal run
38. Projector/contrast testing + fallback preparations

---

# PART E: UPDATED COMPONENT TREE

```
/components/
  shared/
    UserAvatar.tsx                — Circle avatar with initials + status
    AvatarStack.tsx               — Overlapping avatars for compact display
    MentionInput.tsx              — Text input with @mention autocomplete
    AssignmentPopover.tsx         — Team member picker for task assignment
    FollowButton.tsx              — Follow/Unfollow toggle
    BookmarkButton.tsx            — Bookmark toggle

  features/
    opshub/
      OpshubLayout.tsx            — Tab container (Home / My Tasks / Work Orders)
      OpshubHome.tsx              — Existing Home (anomalies + feed)
      MyTasks.tsx                 — Personal task queue
      MyTaskCard.tsx              — Individual task card
      WorkOrderList.tsx           — Browse all work orders
      WorkOrderListCard.tsx       — Work order card in list view
      WorkOrderDetail.tsx         — Full work order view (3-column)
      WorkOrderOverview.tsx       — Overview tab (README equivalent)
      WorkOrderTasks.tsx          — Tasks tab (Issues equivalent)
      WorkOrderTaskCard.tsx       — Individual task card with updates
      WorkOrderWorkflows.tsx      — Workflows tab (Code equivalent)
      WorkOrderDiscussion.tsx     — Discussion tab (threaded comments)
      WorkOrderActivity.tsx       — Activity tab (audit timeline)
      WorkOrderTeamSidebar.tsx    — Right sidebar (team + risk + tags)
      ExecutionChecklist.tsx      — Full-screen step-by-step (mobile-first)
      ChecklistStep.tsx           — Individual step card
      AIRecommendationCard.tsx    — AI-generated workflow + SOP review card
      AIRecommendationDetail.tsx  — Expanded view with edit/approve options
      SOPPreview.tsx              — Read-only SOP display
      PublishModal.tsx            — Facility selection for distribution
      PackageDetailView.tsx       — What receiving facility sees
      AdaptWorkOrder.tsx          — Adaptation config with AI suggestions

  layout/
    DemoModePanel.tsx             — Hidden panel for user switching

/lib/
  types/
    opshub.ts                     — WorkOrder, Task, Activity, Checklist, AIRecommendation
    team.ts                       — TeamMember
  store/
    opshub-store.ts               — Tabs, work orders, my tasks, AI state
  hooks/
    useOpshubMockData.ts          — All mock data
    useWorkOrderDetail.ts         — Work order detail logic
    useMyTasks.ts                 — Personal task filtering
    useActivityTimeline.ts        — Activity entry generation
    useAIRecommendation.ts        — AI recommendation generation mock
    useDemoMode.ts                — Demo user switching
```

---

# END OF ADDENDUM v3

## What changed from v2:

1. **Marco Silva removed entirely** — no Automation Technician role
2. **AI Agent added as a "team member"** — appears in Team sidebar, generates recommendation after Work Order resolves
3. **New "AI Moment" in demo (Act 4)** — the AI reads the entire Work Order and generates both a preventive workflow AND an updated SOP based on actual execution data
4. **Ahmed's discovery flows into the SOP** — the terminal B loose connection finding that wasn't in Omar's investigation gets captured by the AI and added to the procedure
5. **Sarah approves and distributes** — she's the gatekeeper, not the AI. Human judgment remains in the loop
6. **Fahad receives a complete package** — not just a workflow, but workflow + SOP + full Work Order context + AI-suggested adaptations for his environment
7. **Demo is now 4 acts + AI moment + network effect** — cleaner narrative arc with a clear "wow moment" when the AI activates

**The killer demo moment:** When the AI reads Ahmed's note about the loose terminal and adds a torque verification step that wasn't in the original procedure. The audience realizes: the AI doesn't just copy what happened — it LEARNS from what the humans discovered and improves the procedure. That's the "Industrial GitHub + AI" value proposition.
