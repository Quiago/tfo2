# ADDENDUM v2: OpsHub = Industrial GitHub

## This document REPLACES the previous Addendum (Collaboration Layer).
## It also MODIFIES Part 2 (Rebranding) and Part 7 (Demo Script) from the main prompt.
## Where conflicts exist, THIS document wins.

---

# PART A: THE MENTAL MODEL

## A.1 Work Order = Repository

On GitHub, a Repository is the container where everything about a project lives — code, issues, pull requests, discussions, CI/CD actions, contributors, history. Nobody goes to a "separate command center" to find their work. They go to the repo.

In a factory, the equivalent container is the **Work Order**. It's where everything about a maintenance event lives — the problem, the investigation, the people assigned, the procedures, the parts needed, the execution steps, the sign-off, the verification. Today this is split across 5 systems (CMMS, email, WhatsApp, Excel, paper). We unify it.

## A.2 The Complete Mapping

```
GITHUB                              TRIPOLAR OpsHub
────────────────────────────────     ────────────────────────────────
Organization                         Facility (Munich Plant)
Repository                           Work Order
README.md                            Work Order Summary (scope, risk, equipment, context)
Code files                           Workflows (the automated procedures / SOPs)
Issues                               Tasks (assigned to specific people)
Issue Labels                         Priority + Category tags
Issue Assignees                      Task Assignees (with role context)
Pull Requests                        Improvements (proposed changes to workflows)
PR Reviews / Approvals               Approval Gates (manager approves before execution)
Commits                              Actions Log (every step taken, timestamped)
Commit messages                      Action notes ("Replaced bearing, torque 45Nm")
Branches                             Workflow Versions (v1 → v2 after learning)
GitHub Actions (CI/CD)               Automated Triggers (sensor → workflow → action)
Discussions                          Comments thread (with @mentions)
Contributors                         Team (assigned people with roles + status)
Stars                                Bookmarks (save for reference)
Forks                                Adaptations (other facilities copy + customize)
Watch / Notifications                Follow (get updates on changes)
Releases                             Resolutions (closed with verified outcome)
Insights / Activity graph            Activity Timeline (visual history of all actions)
GitHub Profile                       User Dashboard (my tasks across all work orders)
Notification Bell                    My Tasks tab in OpsHub (filtered view of your assignments)
```

## A.3 What This Means for the UI

**OpsHub becomes a THREE-tab interface:**

```
┌──────────────────────────────────────────────────────────┐
│ 📊 OpsHub                                                │
│                                                          │
│ [🏠 Home]  [📋 My Tasks]  [📂 Work Orders]              │
│                                                          │
│ Home = Feed + Anomalies + Activity Log (existing)        │
│ My Tasks = Personal inbox (replaces Command Center)      │
│ Work Orders = Browse/search all work orders (repo list)  │
└──────────────────────────────────────────────────────────┘
```

**Home tab** = existing OpsHub Home (anomalies feed, insights, activity log) — the "GitHub Explore" equivalent
**My Tasks tab** = your personal task queue across ALL work orders — the "GitHub Notifications" equivalent  
**Work Orders tab** = browse all work orders like browsing repos — with filters, search, status

---

# PART B: DETAILED COMPONENT SPECIFICATIONS

## B.1 OpsHub Navigation Update

### Top-level change
Replace the current single-view OpsHub with tabbed navigation:

```typescript
// /lib/types/opshub.ts

type OpshubTab = 'home' | 'my-tasks' | 'work-orders';

// Add to opshub-store.ts
interface OpshubStore {
  // ... existing
  activeTab: OpshubTab;
  setActiveTab: (tab: OpshubTab) => void;
}
```

### Tab bar rendering
Position: Directly below the main "OpsHub" page header, full width.

```
📊 OpsHub
[🏠 Home]  [📋 My Tasks (3)]  [📂 Work Orders (12)]
```

- Each tab shows its item count as a badge
- "My Tasks" badge shows ONLY pending/in-progress items for the current user
- "Work Orders" badge shows total active (not resolved) work orders
- Active tab has a bottom border accent (same brand color as nav highlights)

---

## B.2 MY TASKS Tab — Personal Operations Inbox

### Purpose
Every user sees THEIR assignments across all work orders. This is NOT a separate component — it's a filtered view INTO the work orders system. Same data, personal lens.

### Layout

```
┌──────────────────────────────────────────────────────────────┐
│ 📋 My Tasks                                                  │
│                                                              │
│ [All (5)] [Pending (2)] [In Progress (2)] [Review (1)]      │
│                                                              │
│ ── REQUIRES ACTION ───────────────────────────────────────── │
│                                                              │
│ 🔴 Investigation · WO-2026-0847                              │
│ Paint Booth #3 — Temperature Anomaly                         │
│ Assigned by Sarah Chen · 14 min ago                          │
│ "Check ventilation correlation with energy spike"            │
│ [▶ Start] [Open Work Order]                                  │
│                                                              │
│ 🟠 Execution Task · WO-2026-0839                             │
│ Motor A7 — Bearing Replacement                               │
│ Assigned by Sarah Chen · 2 hours ago                         │
│ Due: Today 4:00 PM · Parts: 3/3 available                   │
│ [Accept] [Open Work Order]                                   │
│                                                              │
│ ── IN PROGRESS ───────────────────────────────────────────── │
│                                                              │
│ 🔵 Workflow Review · WO-2026-0842                            │
│ Marco Silva requests review on workflow v2                   │
│ "Bearing Degradation Early Warning"                          │
│ @you: "Can you validate the 4.0 mm/s threshold?"            │
│ [Review Workflow] [Open Work Order]                          │
│                                                              │
│ ── COMPLETED TODAY ───────────────────────────────────────── │
│                                                              │
│ ✅ Execution Task · WO-2026-0831                             │
│ Cell B Robot Calibration — Completed 2h ago                  │
│ [View Report]                                                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Data structure

```typescript
// /lib/types/opshub.ts

interface MyTask {
  id: string;
  workOrderId: string;          // The "repo" this task belongs to
  workOrderTitle: string;       // "Paint Booth #3 — Temperature Anomaly"
  workOrderNumber: string;      // "WO-2026-0847"
  type: TaskType;
  title: string;
  description: string;
  assignedBy: TeamMember;
  assignedTo: TeamMember;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: TaskStatus;
  dueDate?: string;
  note?: string;                // Assigner's note
  mentionContext?: string;      // If task came from @mention
  createdAt: string;
  updatedAt: string;
}

type TaskType =
  | 'investigation'       // Analyze root cause (Reliability Engineer)
  | 'execution'           // Physical maintenance work (Maintenance Tech)
  | 'workflow-build'      // Create/modify automation (Automation Tech)
  | 'workflow-review'     // Review someone's workflow (peer review)
  | 'approval'            // Approve work order / workflow (Manager)
  | 'verification'        // Verify maintenance was done correctly (Engineer)
  ;

type TaskStatus =
  | 'pending'             // Waiting for you to accept
  | 'accepted'            // You accepted, not started yet
  | 'in-progress'         // Actively working
  | 'blocked'             // Waiting on something (parts, approval, etc.)
  | 'in-review'           // Submitted for review
  | 'completed'           // Done
  ;

interface TeamMember {
  id: string;
  name: string;
  role: string;
  facility: string;
  avatarInitials: string;
  avatarColor: string;
  status: 'available' | 'in-field' | 'off-shift';
}
```

### Task card rendering
Each task card shows:
- **Left border:** Color matches priority (red/orange/yellow/blue)
- **Type badge:** Small pill label (Investigation / Execution / Review / Approval)
- **Work Order reference:** "WO-2026-0847" as a clickable link → opens the full Work Order
- **Title:** Bold, 14px
- **Assigned by line:** Avatar (xs) + name + relative time
- **Note/Mention:** If the assigner left a note or @mentioned you, show it in italics
- **Due date:** If set, show with urgency color (red if overdue, orange if today, gray if future)
- **Action buttons:** 1-2 context-specific actions + always "Open Work Order"

### Quick actions by task type

| Type | Primary Action | What it does |
|------|---------------|-------------|
| `investigation` | "▶ Start" | Sets status to in-progress, navigates to Timeline with work order context |
| `execution` | "Accept" → then "▶ Start" | Accept first, then start when physically ready |
| `workflow-build` | "Open Builder" | Navigates to Workflow Builder with work order context |
| `workflow-review` | "Review Workflow" | Opens workflow in read-only mode with approve/comment options |
| `approval` | "Approve" / "Request Changes" | Manager approves or sends back |
| `verification` | "Verify" | Opens post-maintenance sensor comparison view |

---

## B.3 WORK ORDERS Tab — The Repo List

### Purpose
Browse all work orders for the current facility (or all facilities). Like GitHub's repository list.

### Layout

```
┌──────────────────────────────────────────────────────────────┐
│ 📂 Work Orders                                    [+ New]    │
│                                                              │
│ [All (12)] [Active (8)] [Resolved (4)]                      │
│                                                              │
│ Sort: [Most Recent ▾]  Filter: [All Priorities ▾]           │
│ 🔍 Search work orders...                                     │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 🔴 WO-2026-0847                                          │ │
│ │ Paint Booth #3 — Temperature Anomaly                      │ │
│ │ Munich Plant · Created 3h ago by AI Detection             │ │
│ │                                                          │ │
│ │ 📊 Risk: €28,000  ⏱ RUL: 4h  🎯 91% confidence          │ │
│ │                                                          │ │
│ │ 👥 SC OK MS AN        4 tasks · 2 workflows · 7 comments │ │
│ │ ├─ 🔍 Investigation    Omar Khalid     ● In Progress     │ │
│ │ ├─ 🔧 Execution        Ahmed Nasser    ○ Pending         │ │
│ │ ├─ ⚡ Workflow Build    Marco Silva     ● In Progress     │ │
│ │ └─ ✅ Verification     Omar Khalid     ○ Pending         │ │
│ │                                                          │ │
│ │ Tags: critical · paint-booth · bearing · predictive       │ │
│ │ 📌 6 bookmarked · 🔄 1 adapted (Riyadh)                  │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 🟠 WO-2026-0839                                          │ │
│ │ Motor A7 — Conveyor Drive Line 3 Bearing                  │ │
│ │ Munich Plant · Created 6h ago by AI Detection             │ │
│ │                                                          │ │
│ │ 📊 Risk: €8,500  ⏱ RUL: 72h  🎯 87% confidence          │ │
│ │                                                          │ │
│ │ 👥 SC AN              2 tasks · 1 workflow · 3 comments   │ │
│ │ ├─ 🔧 Execution        Ahmed Nasser    ○ Accepted        │ │
│ │ └─ ✅ Verification     Lisa Park       ○ Pending         │ │
│ │                                                          │ │
│ │ Tags: high · motor · bearing · conveyor                   │ │
│ │ 📌 2 bookmarked                                           │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ ✅ WO-2026-0831 · RESOLVED                               │ │
│ │ Cell B Robot Calibration — Quarterly                      │ │
│ │ Munich Plant · Resolved 2h ago                            │ │
│ │ Duration: 2d 4h · Cost saved: €12,300                    │ │
│ │ 👥 SC OK AN · 3 tasks · 1 workflow                       │ │
│ │ 📌 4 bookmarked · 🔄 2 adapted (Detroit, São Paulo)      │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Work Order card (list view) structure

```typescript
// /lib/types/opshub.ts

interface WorkOrderCard {
  id: string;
  number: string;              // "WO-2026-0847"
  title: string;
  facility: string;
  status: WorkOrderStatus;
  priority: 'critical' | 'high' | 'medium' | 'low';
  source: 'ai-detection' | 'manual' | 'workflow-trigger' | 'scheduled';
  sourceConfidence?: number;   // AI confidence if ai-detection
  risk: number;                // Financial risk in facility currency
  rul?: number;                // Remaining useful life in hours
  currency: string;
  team: TeamMember[];          // All assigned people
  taskSummary: TaskSummaryItem[];
  workflowCount: number;
  commentCount: number;
  tags: string[];
  bookmarks: number;
  adaptations: WorkOrderAdaptation[];
  createdAt: string;
  resolvedAt?: string;
  costSaved?: number;          // Calculated after resolution
  duration?: string;           // Total time from creation to resolution
}

type WorkOrderStatus = 'open' | 'investigating' | 'in-progress' | 'blocked' | 'resolved';

interface TaskSummaryItem {
  type: TaskType;
  assigneeName: string;
  status: TaskStatus;
}

interface WorkOrderAdaptation {
  facility: string;
  adaptedBy: string;
  adaptedAt: string;
}
```

---

## B.4 WORK ORDER DETAIL VIEW — The Repo Page

### This is the core of the entire platform. When you click on any Work Order, you enter its full detail view — like opening a GitHub repository.

### Layout — Desktop (3-column)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ← Back to Work Orders                                                        │
│                                                                              │
│ 🔴 WO-2026-0847 · Paint Booth #3 — Temperature Anomaly                      │
│ Munich Paint Shop · Open · Created 3h ago                                    │
│ [📌 Bookmark] [👁 Follow] [🔄 Adapt for...]                                 │
│                                                                              │
│ ┌──────────────────────────┬──────────────────────┬────────────────────────┐ │
│ │ TABS                      │                      │ SIDEBAR               │ │
│ │                          │                      │                        │ │
│ │ [📋 Overview]            │ (Tab Content Area)    │ 👥 Team               │ │
│ │ [📝 Tasks (4)]           │                      │                        │ │
│ │ [⚡ Workflows (2)]       │                      │ SC Sarah Chen          │ │
│ │ [💬 Discussion (7)]      │                      │    Owner · Manager     │ │
│ │ [📊 Activity]            │                      │                        │ │
│ │                          │                      │ OK Omar Khalid         │ │
│ │                          │                      │    Investigator        │ │
│ │                          │                      │    ● In Progress       │ │
│ │                          │                      │                        │ │
│ │                          │                      │ MS Marco Silva         │ │
│ │                          │                      │    Automation          │ │
│ │                          │                      │    ● Building Workflow │ │
│ │                          │                      │                        │ │
│ │                          │                      │ AN Ahmed Nasser        │ │
│ │                          │                      │    Maintenance Lead    │ │
│ │                          │                      │    ○ Pending           │ │
│ │                          │                      │                        │ │
│ │                          │                      │ [+ Assign]             │ │
│ │                          │                      │                        │ │
│ │                          │                      │ ──────────────────     │ │
│ │                          │                      │ 📊 Risk                │ │
│ │                          │                      │ €28,000                │ │
│ │                          │                      │ ⏱ RUL: 4 hours        │ │
│ │                          │                      │ 🎯 91% confidence     │ │
│ │                          │                      │                        │ │
│ │                          │                      │ ──────────────────     │ │
│ │                          │                      │ 🏷 Tags                │ │
│ │                          │                      │ critical paint-booth   │ │
│ │                          │                      │ bearing predictive     │ │
│ │                          │                      │ [+ Add tag]            │ │
│ │                          │                      │                        │ │
│ │                          │                      │ ──────────────────     │ │
│ │                          │                      │ 🔗 Links               │ │
│ │                          │                      │ View in Digital Twin → │ │
│ │                          │                      │ View in Timeline →     │ │
│ │                          │                      │ Check Spares →         │ │
│ │                          │                      │                        │ │
│ │                          │                      │ ──────────────────     │ │
│ │                          │                      │ 📈 Adaptations         │ │
│ │                          │                      │ 🔄 Riyadh (Fahad)     │ │
│ │                          │                      │    Adapted 1h ago      │ │
│ └──────────────────────────┴──────────────────────┴────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

### B.4.1 Overview Tab (README equivalent)

Shows the Work Order summary — the "README" of this maintenance event.

```
┌──────────────────────────────────────────────────────────────┐
│ 📋 Overview                                                  │
│                                                              │
│ ## Summary                                                   │
│ Temperature spike detected on Paint Booth #3 Drying Section. │
│ Current temperature: 42°C (normal range: 22-28°C).          │
│ AI pattern match: Heating element malfunction or ventilation │
│ blockage (91% confidence).                                   │
│                                                              │
│ ## Equipment                                                 │
│ 🏭 Paint Booth #3 — Drying Section                           │
│ Munich Paint Shop · Zone B                                   │
│ Health Score: 38% · Last Service: 2026-01-15                │
│ [View in 3D →]                                               │
│                                                              │
│ ## Root Cause (added by Omar Khalid)                         │
│ Bearing degradation on ventilation motor causing:            │
│ 1. Increased vibration (onset: 3 days ago)                   │
│ 2. Higher energy draw (+17% above baseline)                  │
│ 3. Reduced airflow → temperature rise                        │
│ [View Timeline Finding →]                                    │
│                                                              │
│ ## Parts Required                                            │
│ ✅ Bearing SKF 6205-2RS — 5 in stock (Warehouse B)          │
│ ✅ Heating Element 2.5kW — 1 in stock (Warehouse A)         │
│ ❌ Ventilation Fan Motor — On Order (2-3 days)              │
│ Total: €1,300                                                │
│                                                              │
│ ## Resolution (added when completed)                         │
│ ⏳ Pending...                                                │
└──────────────────────────────────────────────────────────────┘
```

### B.4.2 Tasks Tab (Issues equivalent)

Every unit of work assigned to a person is a Task — like a GitHub Issue.

```
┌──────────────────────────────────────────────────────────────┐
│ 📝 Tasks (4)                                    [+ New Task] │
│                                                              │
│ [All (4)] [Open (3)] [Completed (1)]                        │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ #1 🔍 Investigate root cause                              │ │
│ │ Assigned: OK Omar Khalid · Priority: Critical            │ │
│ │ Status: ● In Progress (started 45 min ago)               │ │
│ │ Note: "Check ventilation correlation with energy spike"  │ │
│ │                                                          │ │
│ │ Latest update: "Root cause identified — bearing          │ │
│ │ degradation. See Timeline finding."                      │ │
│ │ Updated 20 min ago by Omar Khalid                        │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ #2 ⚡ Build preventive workflow                           │ │
│ │ Assigned: MS Marco Silva · Priority: High                │ │
│ │ Status: ● In Progress                                    │ │
│ │ Note: "@Marco — build early warning for bearing          │ │
│ │ degradation pattern Omar found"                          │ │
│ │                                                          │ │
│ │ Latest update: "Workflow published: Paint Booth           │ │
│ │ Bearing Degradation Early Warning v1"                    │ │
│ │ Updated 10 min ago by Marco Silva                        │ │
│ │ [View Workflow →]                                        │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ #3 🔧 Execute repair — Replace heating element            │ │
│ │ Assigned: AN Ahmed Nasser · Priority: Critical           │ │
│ │ Status: ○ Accepted (not started yet)                     │ │
│ │ Due: Today 4:00 PM                                       │ │
│ │ Parts: 2/3 available · Checklist: 5 steps               │ │
│ │ Depends on: #1 (investigation complete)                  │ │
│ │                                                          │ │
│ │ [📋 View Execution Checklist]                             │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ #4 ✅ Verify maintenance integrity                        │ │
│ │ Assigned: OK Omar Khalid · Priority: High                │ │
│ │ Status: ○ Pending (blocked: waiting for #3)              │ │
│ │ Note: "Compare pre/post sensor readings to confirm       │ │
│ │ repair was effective"                                     │ │
│ │ Depends on: #3 (execution complete)                      │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Task interface

```typescript
// /lib/types/opshub.ts

interface WorkOrderTask {
  id: string;
  number: number;                  // #1, #2, #3...
  workOrderId: string;
  type: TaskType;
  title: string;
  description: string;
  assignee: TeamMember;
  assignedBy: TeamMember;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: TaskStatus;
  dueDate?: string;
  note?: string;
  dependsOn?: string[];           // Task IDs that must complete first
  isBlocked: boolean;             // True if depends on incomplete tasks
  checklist?: ChecklistItem[];    // For execution tasks
  linkedWorkflowId?: string;      // If task produced a workflow
  linkedFindingId?: string;       // If task produced a timeline finding
  updates: TaskUpdate[];          // Thread of updates/comments
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface TaskUpdate {
  id: string;
  author: TeamMember;
  content: string;                // Supports @mentions
  attachments?: TaskAttachment[];
  createdAt: string;
}

interface TaskAttachment {
  type: 'photo' | 'document' | 'workflow-link' | 'timeline-link' | 'finding-link';
  label: string;
  url: string;
}

interface ChecklistItem {
  id: string;
  order: number;
  label: string;                  // "Isolate power supply (LOTO)"
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
  requiresPhoto: boolean;
  photoUrl?: string;
}
```

### B.4.3 Workflows Tab (Code equivalent)

All workflows (automated procedures) associated with this work order. Like browsing code files in a repo.

```
┌──────────────────────────────────────────────────────────────┐
│ ⚡ Workflows (2)                          [+ Create Workflow] │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ ⚡ Paint Booth Bearing Degradation Early Warning          │ │
│ │ v1 · Created by Marco Silva · 30 min ago                │ │
│ │ Status: ✅ Published to OpsHub                           │ │
│ │                                                          │ │
│ │ Trigger: Vibration > 4.0 mm/s AND Energy > +15%         │ │
│ │ Actions: Create Work Order + Alert Omar + Alert Sarah    │ │
│ │ 4 nodes · 3 connections                                  │ │
│ │                                                          │ │
│ │ [Open in Builder] [View Execution Log]                   │ │
│ │                                                          │ │
│ │ 💬 Review thread:                                        │ │
│ │ OK Omar Khalid: "4.0 mm/s is correct for this           │ │
│ │    motor type. Approved. ✅"                              │ │
│ │ SC Sarah Chen: "Add me to the alert list too.            │ │
│ │    Otherwise LGTM."                                      │ │
│ │ MS Marco Silva: "Done — both added. v1 published."       │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ ⚡ Paint Booth Temperature Control (Suggested by AI)      │ │
│ │ v0 · Auto-generated · 3h ago                             │ │
│ │ Status: 💡 Suggested (not yet adopted)                   │ │
│ │                                                          │ │
│ │ Trigger: Temperature > 35°C sustained 15 min             │ │
│ │ Actions: Alert + Log Entry                               │ │
│ │ 3 nodes · 2 connections                                  │ │
│ │                                                          │ │
│ │ [Adopt & Edit] [Dismiss]                                 │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### B.4.4 Discussion Tab (GitHub Discussions / Comments equivalent)

Threaded conversation about this work order. Supports @mentions. This is where all the collaboration happens — not in WhatsApp.

```
┌──────────────────────────────────────────────────────────────┐
│ 💬 Discussion (7)                                            │
│                                                              │
│ SC Sarah Chen · 3h ago                                       │
│ Created this work order from AI anomaly detection.           │
│ @Omar Khalid — please investigate. Check if ventilation      │
│ system is correlated with the energy spike we're seeing.     │
│                                                              │
│    OK Omar Khalid · 2h ago                                   │
│    Investigating now. Initial look at Timeline shows          │
│    vibration climbing for 3 days. Will share findings.       │
│                                                              │
│ OK Omar Khalid · 45 min ago                                  │
│ Root cause identified. Bearing degradation on ventilation    │
│ motor → vibration → energy draw → temperature.               │
│ Full finding with annotations: [View Timeline Finding →]     │
│ @Marco Silva — can you build a preventive workflow for       │
│ this exact pattern?                                          │
│                                                              │
│    MS Marco Silva · 40 min ago                               │
│    On it. I'll use voice to build it — the pattern is clear. │
│                                                              │
│    MS Marco Silva · 15 min ago                               │
│    Done. Published: "Bearing Degradation Early Warning"      │
│    [View Workflow →]                                         │
│    @Omar Khalid can you validate 4.0 mm/s threshold?        │
│                                                              │
│    OK Omar Khalid · 10 min ago                               │
│    Validated. 4.0 is correct for this motor type. ✅          │
│                                                              │
│ SC Sarah Chen · 5 min ago                                    │
│ Great teamwork. @Ahmed Nasser — you're clear to execute      │
│ the repair. Parts are staged in Warehouse B. The workflow    │
│ Marco built will catch this pattern early next time.         │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐     │
│ │ Add comment...                            [@] [Send] │     │
│ └──────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

### B.4.5 Activity Tab (GitHub Activity / Insights equivalent)

Chronological log of EVERY action taken on this work order. Auto-generated, not editable. This is the audit trail.

```
┌──────────────────────────────────────────────────────────────┐
│ 📊 Activity                                                  │
│                                                              │
│ ⬤── 7:15 AM                                                 │
│ │ 🤖 AI System detected anomaly                              │
│ │    Temperature 42°C on Paint Booth #3 (91% confidence)     │
│ │    Work Order WO-2026-0847 auto-created                    │
│ │                                                            │
│ ⬤── 7:18 AM                                                 │
│ │ SC Sarah Chen assigned Task #1 to Omar Khalid              │
│ │    Type: Investigation · Priority: Critical                │
│ │                                                            │
│ ⬤── 7:19 AM                                                 │
│ │ SC Sarah Chen assigned Task #3 to Ahmed Nasser             │
│ │    Type: Execution · Due: Today 4:00 PM                    │
│ │                                                            │
│ ⬤── 7:22 AM                                                 │
│ │ OK Omar Khalid accepted Task #1                            │
│ │    Status: Pending → In Progress                           │
│ │                                                            │
│ ⬤── 7:30 AM                                                 │
│ │ OK Omar Khalid added Timeline annotation                   │
│ │    "Bearing degradation onset — root cause"                │
│ │                                                            │
│ ⬤── 7:35 AM                                                 │
│ │ OK Omar Khalid shared finding                              │
│ │    Linked to Timeline range: Feb 7-10                      │
│ │    Root cause: bearing → vibration → energy → temperature  │
│ │                                                            │
│ ⬤── 7:36 AM                                                 │
│ │ OK Omar Khalid mentioned @Marco Silva                      │
│ │    "Can you build a preventive workflow?"                   │
│ │                                                            │
│ ⬤── 7:37 AM                                                 │
│ │ SC Sarah Chen assigned Task #2 to Marco Silva              │
│ │    Type: Workflow Build · Priority: High                   │
│ │                                                            │
│ ⬤── 8:00 AM                                                 │
│ │ MS Marco Silva created workflow via voice command           │
│ │    "Paint Booth Bearing Degradation Early Warning" v1      │
│ │                                                            │
│ ⬤── 8:10 AM                                                 │
│ │ OK Omar Khalid reviewed workflow — Approved ✅              │
│ │    "4.0 mm/s threshold validated"                          │
│ │                                                            │
│ ⬤── 8:15 AM                                                 │
│ │ MS Marco Silva published workflow to OpsHub                │
│ │    Visibility: All Facilities                              │
│ │    Task #2 completed                                       │
│ │                                                            │
│ ⬤── 10:00 AM                                                │
│ │ AN Ahmed Nasser started Task #3                            │
│ │    Execution checklist opened (5 steps)                    │
│ │                                                            │
│ ⬤── 10:15 AM                                                │
│ │ AN Ahmed Nasser completed step 1/5                         │
│ │    "Isolated power supply (LOTO)" ✅ · Photo attached      │
│ │                                                            │
│ ⬤── 10:45 AM                                                │
│ │ AN Ahmed Nasser completed step 3/5                         │
│ │    "Replaced heating element" ✅ · Photo attached          │
│ │                                                            │
│ ⬤── 11:30 AM                                                │
│ │ AN Ahmed Nasser completed Task #3 (all 5/5 steps)         │
│ │    Duration: 1h 30m · 3 photos attached                   │
│ │    Note: "Heating element replaced. Ventilation duct       │
│ │    cleared of debris. Temperature stabilizing."            │
│ │                                                            │
│ ⬤── 11:35 AM                                                │
│ │ 🤖 AI System — Maintenance Integrity Verification          │
│ │    Post-repair sensor readings:                            │
│ │    Temperature: 42°C → 24.1°C ✅                           │
│ │    Vibration: 4.2 mm/s → 1.8 mm/s ✅                      │
│ │    Energy: 17.8 kW → 15.0 kW ✅                           │
│ │    Verdict: Maintenance effective ✅                        │
│ │                                                            │
│ ⬤── 11:36 AM                                                │
│ │ 🤖 System assigned Task #4 to Omar Khalid                  │
│ │    Type: Verification · Auto-triggered by repair complete  │
│ │                                                            │
│ ⬤── 11:45 AM                                                │
│ │ OK Omar Khalid verified maintenance integrity              │
│ │    "Sensor readings confirm successful repair. Closing."   │
│ │    Task #4 completed                                       │
│ │                                                            │
│ ⬤── 11:46 AM                                                │
│ │ 🤖 System changed Work Order status                        │
│ │    Open → Resolved                                         │
│ │    Total duration: 4h 31m · Cost saved: €28,000            │
│ │                                                            │
│ ⬤── 2:30 PM                                                 │
│ │ FA Fahad Al-Rashid (Riyadh) adapted this Work Order        │
│ │    Workflow threshold adjusted: 4.0 → 4.5 mm/s            │
│ │    Recipients changed to Riyadh team                       │
│ │                                                            │
└──────────────────────────────────────────────────────────────┘
```

### Activity entry interface

```typescript
// /lib/types/opshub.ts

interface ActivityEntry {
  id: string;
  workOrderId: string;
  timestamp: string;
  actor: {
    type: 'user' | 'ai-system';
    user?: TeamMember;
    label: string;
  };
  action: ActivityAction;
  details: string;
  linkedEntityType?: 'task' | 'workflow' | 'finding' | 'checklist-step';
  linkedEntityId?: string;
  attachments?: { type: string; label: string; url: string }[];
}

type ActivityAction =
  | 'work-order-created'
  | 'task-assigned'
  | 'task-accepted'
  | 'task-started'
  | 'task-update'
  | 'task-completed'
  | 'checklist-step-completed'
  | 'workflow-created'
  | 'workflow-reviewed'
  | 'workflow-published'
  | 'finding-shared'
  | 'annotation-added'
  | 'mention'
  | 'comment-added'
  | 'spares-checked'
  | 'maintenance-verified'
  | 'status-changed'
  | 'adapted-by-facility'
  ;
```

---

## B.5 Execution Checklist — Ahmed Nasser's Interface

### This is what the Maintenance Technician sees when they start their execution task. It's the mobile-first, step-by-step interface.

**When Ahmed clicks "▶ Start" on Task #3 (Execute repair):**

The system opens a full-screen checklist overlay (or navigates to a dedicated page), optimized for mobile/tablet use on the factory floor.

### Layout (Mobile-First)

```
┌────────────────────────────────────────┐
│ ← WO-2026-0847                         │
│ 🔧 Execute: Replace Heating Element     │
│ Paint Booth #3 · Due: 4:00 PM          │
│                                        │
│ Step 2 of 5                            │
│ ██████████░░░░░░░░░░ 40%               │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │                                    │ │
│ │ 🔒 Step 1: Isolate Power (LOTO)   │ │
│ │ ✅ Completed · 10:15 AM            │ │
│ │ 📷 Photo attached                  │ │
│ │                                    │ │
│ └────────────────────────────────────┘ │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │                                    │ │
│ │ 🔧 Step 2: Remove old heating     │ │
│ │    element                     ◄── │ │
│ │                                    │ │
│ │ Instructions:                      │ │
│ │ Disconnect terminals A and B.      │ │
│ │ Remove 4x M8 bolts. Carefully     │ │
│ │ extract element from housing.      │ │
│ │                                    │ │
│ │ ⚠ Caution: Element may still be   │ │
│ │ hot. Use thermal gloves.           │ │
│ │                                    │ │
│ │ Required photo: Yes 📷             │ │
│ │                                    │ │
│ │ ┌──────────────────────────────┐   │ │
│ │ │ 📷 Take Photo                │   │ │
│ │ └──────────────────────────────┘   │ │
│ │                                    │ │
│ │ Note (optional):                   │ │
│ │ ┌──────────────────────────────┐   │ │
│ │ │ Old element showed signs of  │   │ │
│ │ │ overheating on terminal B... │   │ │
│ │ └──────────────────────────────┘   │ │
│ │                                    │ │
│ │ ┌──────────────────────────────┐   │ │
│ │ │ ✅ Mark Complete              │   │ │
│ │ └──────────────────────────────┘   │ │
│ │                                    │ │
│ └────────────────────────────────────┘ │
│                                        │
│  Step 3: Install new element (next)    │
│  Step 4: Reconnect and test            │
│  Step 5: Remove LOTO, verify temp      │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ 🎙 Voice Note                      │ │
│ └────────────────────────────────────┘ │
│                                        │
│ ⚠ Report Issue   💬 Ask for Help       │
└────────────────────────────────────────┘
```

### Checklist interface

```typescript
// /lib/types/opshub.ts

interface ExecutionChecklist {
  taskId: string;
  workOrderId: string;
  title: string;
  equipment: string;
  dueDate: string;
  steps: ChecklistStep[];
  currentStep: number;
  startedAt: string;
  completedAt?: string;
}

interface ChecklistStep {
  id: string;
  order: number;
  title: string;
  instructions: string;
  caution?: string;              // Safety warning
  requiresPhoto: boolean;
  requiresSignature: boolean;    // For LOTO / safety critical
  photoUrl?: string;
  note?: string;                 // Technician's note
  voiceNoteUrl?: string;         // Voice note recording
  status: 'pending' | 'active' | 'completed' | 'skipped';
  completedAt?: string;
  completedBy?: string;
}
```

### Key UX details for the execution checklist:

1. **Large touch targets:** All buttons minimum 48px height (gloves-on design)
2. **One step at a time:** Current step is expanded, completed steps are collapsed with ✅, future steps are visible but dimmed
3. **Progress bar:** Visual progress at the top (step X of Y + percentage)
4. **Photo capture:** Opens device camera directly. Photo is attached to the step and auto-uploaded
5. **Voice note:** Tap and hold to record. Useful when hands are dirty/busy. Audio is attached to the step
6. **"Report Issue" button:** If the technician finds something unexpected, this creates a new Task on the Work Order flagged as a discovered issue
7. **"Ask for Help" button:** Opens the Discussion tab with a pre-filled mention to the investigation assignee (Omar in this case)
8. **Offline capability (mock for demo):** Show a subtle "Synced ✅" indicator. In production, steps would queue offline and sync when connected
9. **Auto-timer:** Time elapsed per step is tracked automatically
10. **Completion:** When all steps are done, show a summary screen with total time, photos taken, notes, and a "Complete Task" button that sends everything back to the Work Order activity log

---

## B.6 Notification Badge in Main Navigation

### Instead of a separate Command Center, add a badge to the OpsHub tab itself.

**Location:** The main nav tab for OpsHub

```
[Overview] [Digital Twin] [Timeline] [Workflows] [📊 OpsHub (3)]
```

The "(3)" badge represents unread items in "My Tasks." This tells the user: "You have 3 things waiting for your action in OpsHub."

**When OpsHub is clicked:** It opens on the tab that has pending items. If "My Tasks" has pending items, default to that tab. Otherwise default to Home.

---

## B.7 Assignment Popover (Reused Across Platform)

### Shared component: `/components/shared/AssignmentPopover.tsx`

This popover appears whenever someone assigns a task. Used on:
- Anomaly card "Investigate" button
- Anomaly card "Approve & Create Work Order" button  
- Work Order detail "+" Assign button
- Inside Task creation flow

```typescript
interface AssignmentPopoverProps {
  onAssign: (assignee: TeamMember, config: AssignmentConfig) => void;
  onCancel: () => void;
  suggestedRole?: string;        // Pre-filter by role if context is clear
  facility: string;              // Filter to same facility
  taskType: TaskType;
}

interface AssignmentConfig {
  assigneeId: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  dueDate?: string;
  note?: string;
  dependsOn?: string[];          // Task IDs
}
```

---

## B.8 @Mention Component

### Shared component: `/components/shared/MentionInput.tsx`

Used in: Discussion comments, Task notes, Workflow review comments, any text input.

**Behavior:**
1. Type `@` → dropdown appears with team members filtered by text after @
2. Select user → inserts `@Name` as a styled chip (colored background matching user's avatarColor at 15% opacity)
3. On submit → creates a notification item in that user's "My Tasks" tab as type `mention`

```typescript
interface MentionInputProps {
  value: string;
  onChange: (value: string, mentionedUserIds: string[]) => void;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
  teamMembers: TeamMember[];     // Available users to mention
}
```

---

## B.9 User Avatar Components

Same as previous addendum — UserAvatar.tsx and AvatarStack.tsx. No changes needed.

---

## B.10 Mock Data for Demo

### Complete mock data for WO-2026-0847

```typescript
// /lib/hooks/useOpshubMockData.ts — ADD these

const MOCK_TEAM: TeamMember[] = [
  { id: 'sarah-chen', name: 'Sarah Chen', role: 'Plant Manager', facility: 'Munich Plant', avatarInitials: 'SC', avatarColor: '#3B82F6', status: 'available' },
  { id: 'omar-khalid', name: 'Omar Khalid', role: 'Reliability Engineer', facility: 'Munich Plant', avatarInitials: 'OK', avatarColor: '#10B981', status: 'available' },
  { id: 'marco-silva', name: 'Marco Silva', role: 'Automation Technician', facility: 'Munich Plant', avatarInitials: 'MS', avatarColor: '#F59E0B', status: 'available' },
  { id: 'ahmed-nasser', name: 'Ahmed Nasser', role: 'Maintenance Lead', facility: 'Munich Plant', avatarInitials: 'AN', avatarColor: '#EF4444', status: 'available' },
  { id: 'lisa-park', name: 'Lisa Park', role: 'Reliability Engineer', facility: 'Munich Plant', avatarInitials: 'LP', avatarColor: '#EC4899', status: 'in-field' },
  { id: 'fahad-alrashid', name: 'Fahad Al-Rashid', role: 'Plant Manager', facility: 'Riyadh Manufacturing', avatarInitials: 'FA', avatarColor: '#8B5CF6', status: 'available' },
];

const MOCK_WORK_ORDER_0847: WorkOrderCard = {
  id: 'wo-0847',
  number: 'WO-2026-0847',
  title: 'Paint Booth #3 — Temperature Anomaly',
  facility: 'Munich Plant',
  status: 'in-progress',
  priority: 'critical',
  source: 'ai-detection',
  sourceConfidence: 0.91,
  risk: 28000,
  rul: 4,
  currency: 'EUR',
  team: [MOCK_TEAM[0], MOCK_TEAM[1], MOCK_TEAM[2], MOCK_TEAM[3]],
  taskSummary: [
    { type: 'investigation', assigneeName: 'Omar Khalid', status: 'in-progress' },
    { type: 'workflow-build', assigneeName: 'Marco Silva', status: 'in-progress' },
    { type: 'execution', assigneeName: 'Ahmed Nasser', status: 'accepted' },
    { type: 'verification', assigneeName: 'Omar Khalid', status: 'pending' },
  ],
  workflowCount: 2,
  commentCount: 7,
  tags: ['critical', 'paint-booth', 'bearing', 'predictive', 'temperature'],
  bookmarks: 6,
  adaptations: [{ facility: 'Riyadh Manufacturing', adaptedBy: 'Fahad Al-Rashid', adaptedAt: new Date().toISOString() }],
  createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
};

const MOCK_EXECUTION_CHECKLIST: ExecutionChecklist = {
  taskId: 'task-3',
  workOrderId: 'wo-0847',
  title: 'Replace Heating Element — Paint Booth #3',
  equipment: 'Paint Booth #3, Drying Section',
  dueDate: new Date().toISOString(),
  currentStep: 2,
  startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  steps: [
    { id: 'step-1', order: 1, title: 'Isolate Power Supply (LOTO)', instructions: 'Follow LOTO procedure PB3-LOTO-001. Tag out breaker panel C, switches 14 and 15. Verify zero energy with multimeter. Attach personal lock.', caution: 'Verify zero energy BEFORE proceeding. Double-check with voltmeter.', requiresPhoto: true, requiresSignature: true, status: 'completed', completedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), completedBy: 'ahmed-nasser', photoUrl: '/mock/loto-photo.jpg' },
    { id: 'step-2', order: 2, title: 'Remove Old Heating Element', instructions: 'Disconnect terminals A and B. Remove 4x M8 bolts (17mm socket). Carefully extract element from housing. Inspect housing for damage or debris.', caution: 'Element may retain heat. Use thermal gloves.', requiresPhoto: true, requiresSignature: false, status: 'active' },
    { id: 'step-3', order: 3, title: 'Install New Heating Element', instructions: 'Insert replacement HE-2500-PB3 into housing. Align mounting holes. Torque M8 bolts to 25Nm in cross pattern. Connect terminals A and B — verify polarity.', requiresPhoto: true, requiresSignature: false, status: 'pending' },
    { id: 'step-4', order: 4, title: 'Reconnect and Functional Test', instructions: 'Remove LOTO locks (all personnel accounted for). Restore power. Set booth to 25°C target. Monitor for 10 minutes. Verify temperature stabilizes within ±2°C.', caution: 'Ensure ALL personnel locks are removed before energizing.', requiresPhoto: false, requiresSignature: true, status: 'pending' },
    { id: 'step-5', order: 5, title: 'Final Verification and Cleanup', instructions: 'Confirm temperature reads 24-26°C. Check vibration reading is below 3.0 mm/s. Clean work area. Return tools. Update system.', requiresPhoto: true, requiresSignature: false, status: 'pending' },
  ],
};
```

---

# PART C: REVISED DEMO SCRIPT — "The Munich Incident" (v2)

## 5 Acts, 14 minutes. Each person's handoff is visible INSIDE the Work Order.

### Characters

| Character | Role | What They Do |
|-----------|------|-------------|
| **Sarah Chen** | Plant Manager | Sees alert, creates work order, assigns team |
| **Omar Khalid** | Reliability Engineer | Investigates root cause in Timeline + 3D |
| **Marco Silva** | Automation Technician | Builds preventive workflow via voice |
| **Ahmed Nasser** | Maintenance Lead | Executes physical repair with checklist |
| **Fahad Al-Rashid** | Plant Manager, Riyadh | Adapts the solution for his facility |

---

## ACT 1: "THE ALERT" (3 min) — Sarah Chen, Plant Manager

**Open on:** OpsHub Home, Executive view. Logged in as Sarah Chen.

> "It's 7:15 AM in Munich. Sarah Chen opens OpsHub — her operational hub."

**Action:** Show OpsHub Home with Risk Summary Card: €36,500 total exposure.

> "€36,500 in risk across 4 anomalies. But this one is critical."

**Action:** Point to Paint Booth #3 anomaly card. 91% confidence, €28K risk, RUL 4 hours.

> "The AI detected a temperature spike 14 degrees above normal. 91% confidence it's a heating element malfunction. Sarah needs to mobilize her team."

**Action:** Click "Approve & Create Work Order." Show the Work Order creation flow.

> "She creates a Work Order — in our platform, a Work Order is like a GitHub repository. It's the container where everything about this incident will live — the investigation, the workflows, the execution, the discussion."

**Action:** Work Order WO-2026-0847 is created. Show the Work Order Detail view opening for the first time. It has the Overview tab with the anomaly summary, empty Tasks, empty Workflows, empty Discussion.

> "Now she assigns the team. Just like assigning contributors to a repo."

**Action:** Click "+ Assign" in the Team sidebar. Assignment popover opens. Select Omar Khalid → Task: Investigation, Priority: Critical. Type note: "Check ventilation correlation with energy spike."

> "Omar gets the investigation. She adds a note with specific direction."

**Action:** Assign. Show Omar appear in the Team sidebar with status "● Pending." Then assign Marco Silva → Task: Build Workflow. Then assign Ahmed Nasser → Task: Execution, Due: 4:00 PM, Depends on: Investigation.

> "Marco will build the preventive workflow. Ahmed will execute the physical repair — but his task is blocked until the investigation is complete. Just like a PR that can't merge until CI passes."

**Action:** Show the Tasks tab now populated with 4 tasks. Task #3 (Ahmed) shows "⏳ Blocked: Depends on #1."

> "Four tasks, four people, clear dependencies. Sarah can now see the entire operation at a glance."

**Action:** Show the Team sidebar: SC (Owner), OK (Investigation, Pending), MS (Workflow, Pending), AN (Execution, Blocked).

> "She opens the Discussion tab and sets context for the team."

**Action:** Switch to Discussion tab. Type: "@Omar Khalid — anomaly on Paint Booth #3. Check if ventilation system is correlated with the energy spike we've been seeing. @Marco Silva — once Omar has the root cause, build a workflow to prevent recurrence. @Ahmed Nasser — parts are being staged in Warehouse B. You'll start once Omar confirms the diagnosis."

> "One message. Three people notified. Everyone has context. No WhatsApp chain needed."

**Transition:** "Each person now sees their task in OpsHub. Let's follow Omar."

---

## ACT 2: "THE INVESTIGATION" (3.5 min) — Omar Khalid, Reliability Engineer

**Switch to:** Omar Khalid's view (demo user switch). OpsHub opens to My Tasks tab.

> "Omar Khalid is the Reliability Engineer. His OpsHub opens on My Tasks — his personal queue."

**Action:** Show My Tasks tab with the investigation at the top:
```
🔴 Investigation · WO-2026-0847
Paint Booth #3 — Temperature Anomaly
Assigned by Sarah Chen · 5 min ago
"Check ventilation correlation with energy spike"
[▶ Start] [Open Work Order]
```

> "Sarah's task is right here with her note. He clicks Start."

**Action:** Click "▶ Start" → Status changes to In Progress → Navigates to Timeline with Paint Booth #3 context.

> "The platform takes him directly to the Timeline, pre-loaded with the relevant equipment data."

**Action:** Show Timeline with vibration climbing over 3 days. Select range. Cross-layer highlighting on all layers.

> "He overlays sensors, energy, and production. Vibration climbing 3 days. Energy spiking in correlation. Production dipping. He's found the pattern."

**Action:** Add annotation: "Bearing degradation onset." Then click "📤 Share Finding."

> "He marks the root cause and shares his finding — directly linked to this work order."

**Action:** Navigate to Digital Twin. Auto-fly to Paint Booth #3. Toggle heatmap.

> "Spatial confirmation. 38% health. The heatmap shows this zone is degrading."

**Action:** Navigate back to OpsHub → Open WO-2026-0847 → Discussion tab. Type: "Root cause identified. Bearing degradation on ventilation motor → vibration → energy draw → temperature. Full finding with Timeline annotations linked above. @Marco Silva — the pattern is clear: vibration > 4.0 mm/s AND energy > +15% above baseline. Build the workflow around these thresholds. @Ahmed Nasser — confirmed it's the heating element. You're clear to proceed once parts are staged."

> "He posts his findings in the Discussion. Tags Marco with the exact thresholds. Tags Ahmed with the go-ahead. Everything in one place."

**Action:** Show the Activity tab updating in real-time. Show Task #3 (Ahmed's) changing from "Blocked" to "Pending" because the investigation dependency is now resolved.

> "Notice: Ahmed's execution task just unblocked. The investigation is done, so the system releases the dependency. Ahmed can now start."

---

## ACT 3: "THE AUTOMATION" (3 min) — Marco Silva, Automation Technician

**Switch to:** Marco Silva's view. OpsHub → My Tasks tab.

> "Marco Silva, Automation Technician. His My Tasks shows Omar's request."

**Action:** Show My Tasks:
```
🟠 Workflow Build · WO-2026-0847
Paint Booth #3 — Build preventive workflow
Assigned by Sarah Chen · 30 min ago
💬 Omar Khalid: "vibration > 4.0 mm/s AND energy > +15%"
[Open Builder] [Open Work Order]
```

> "He has the exact parameters from Omar. He opens the Workflow Builder."

**Action:** Navigate to Workflows tab. Template Gallery appears.

> "Templates — he picks the vibration alert template as a starting point."

**Action:** Select template. Nodes animate in.

> "Then he uses voice to customize it with Omar's exact thresholds."

**Action:** Click mic. Speak the workflow. Show confirmation cards. Click "Build Workflow."

> "AI parses the voice command. One click to build. Now he goes back to the Work Order to publish it."

**Action:** Navigate back to WO-2026-0847 → Workflows tab. The new workflow appears. Click on it to show the review thread.

> "The workflow is now attached to the Work Order — like code in a repo. And just like a Pull Request, he needs a review."

**Action:** In the workflow review thread, type: "@Omar Khalid can you validate the 4.0 mm/s threshold for all paint booth motors? I set energy correlation at +15%."

> "He asks Omar for a code review — a workflow review. Omar responds: 'Validated. 4.0 is correct. Approved.'"

**Action:** Show Omar's reply: "Validated. ✅" → Marco clicks "Publish to OpsHub" → Workflow status changes to "Published."

> "Reviewed, approved, published. Available to every facility in the organization."

---

## ACT 4: "THE EXECUTION" (2.5 min) — Ahmed Nasser, Maintenance Lead

**Switch to:** Ahmed Nasser's view. OpsHub → My Tasks tab.

> "Ahmed Nasser. Maintenance Lead. His task was blocked — now it's not."

**Action:** Show My Tasks:
```
🔴 Execution · WO-2026-0847
Replace Heating Element — Paint Booth #3
Assigned by Sarah Chen · Due: 4:00 PM
Parts: 2/3 available · Checklist: 5 steps
[▶ Start] [Open Work Order]
```

> "Parts staged. Checklist ready. He clicks Start."

**Action:** Click "▶ Start" → Full-screen execution checklist opens. Show Step 1: LOTO procedure.

> "This is what the technician sees. Step-by-step. Large buttons for gloved hands. Each step has instructions, safety warnings, and photo requirements."

**Action:** Show Step 1 completed with photo. Progress bar: 1/5, 20%.

> "Step 1: Power isolation with LOTO. Photo attached as proof. Step 2: Remove the old heating element."

**Action:** Show Step 2 active. Ahmed takes a photo (mock). Types a note: "Old element showed overheating on terminal B — possible loose connection was contributing factor." Clicks "✅ Mark Complete."

> "He adds a note — this is gold. The engineer will see that the terminal had a loose connection. That insight improves the next investigation."

**Action:** Fast-forward through steps 3-4-5. Show progress bar filling: 60%, 80%, 100%.

> "Steps 3 through 5: install, test, verify. Each one documented with photos and timestamps."

**Action:** Show completion screen: "All 5 steps completed. Duration: 1h 30m. 3 photos attached."

> "Ahmed completes the task. 1 hour 30 minutes. Every step documented. Now watch what happens."

**Action:** Show the Activity tab on WO-2026-0847. The AI verification entry appears:

```
🤖 AI System — Maintenance Integrity Verification
Post-repair sensor readings:
Temperature: 42°C → 24.1°C ✅
Vibration: 4.2 mm/s → 1.8 mm/s ✅
Energy: 17.8 kW → 15.0 kW ✅
Verdict: Maintenance effective ✅
```

> "The AI automatically compares before and after sensor readings. Temperature dropped 18 degrees. Vibration normalized. Energy back to baseline. The system confirms: maintenance was effective. No fake maintenance. No paperwork fraud. Verified by physics."

**Action:** Show Work Order status changing to "Resolved." Duration: 4h 31m. Cost saved: €28,000.

> "Work Order resolved. 4 hours 31 minutes from detection to verified repair. €28,000 in risk eliminated."

---

## ACT 5: "THE NETWORK EFFECT" (2 min) — Fahad Al-Rashid, Riyadh

**Switch to:** Fahad Al-Rashid. OpsHub → My Tasks tab. Facility: Riyadh.

> "Fahad Al-Rashid. 5,000 kilometers away in Riyadh."

**Action:** Show My Tasks:
```
📦 Solution Kit Available
"Paint Booth Bearing Degradation Early Warning"
From WO-2026-0847 · Munich Plant
Published by Marco Silva · 1 hour ago
[View Work Order] [Adapt for Riyadh]
```

> "A new workflow from Munich, surfaced because Fahad follows the Predictive Maintenance category. But he doesn't just get the workflow — he can see the entire Work Order it came from."

**Action:** Click "View Work Order" → Opens WO-2026-0847 in read-only mode. Show the Overview, Tasks (all resolved), Workflows, Discussion, Activity.

> "He reads the full story. The AI detection. Sarah's assignments. Omar's investigation. Marco's workflow. Ahmed's execution. The AI verification. Complete context."

**Action:** Click "Adapt for Riyadh." Quick configuration: threshold 4.0 → 4.5 mm/s, Riyadh team as recipients, SAR currency.

> "He adapts it for his conditions. 2 minutes. Done."

**Action:** Show the original WO-2026-0847 Activity tab with a new entry at the bottom: "Fahad Al-Rashid (Riyadh) adapted this Work Order."

> "And back in Munich, the Activity log shows: Riyadh adapted this solution. Munich's incident made Riyadh smarter. This is the network effect."

---

## CLOSING (30 seconds)

**Action:** Show the Work Order detail view of WO-2026-0847 with all 4 team avatars, all tasks ✅, the full Activity timeline.

> "What you've just seen is one Work Order — one incident — flowing through an entire organization:

> The Plant Manager created it and assembled her team in seconds.
> The Reliability Engineer investigated and shared his findings inside the Work Order.
> The Automation Technician built a preventive workflow with his voice — peer-reviewed, approved.
> The Maintenance Lead executed the repair step-by-step with photo documentation.
> The AI verified the repair was effective using sensor data.
> And another facility, 5,000 kilometers away, adapted the solution in minutes.

> Five people. One Work Order. Full traceability. Full collaboration. Zero WhatsApp.

> This is Tripolar. Industrial GitHub for Facility Operations.

> Thank you."

---

# PART D: REVISED SPRINT PLAN

### Sprint 1 (Days 1-3): Foundation + Rebranding
1. Fithub → OpsHub rename (all files, stores, types, routes)
2. OpsHub tab navigation (Home / My Tasks / Work Orders)
3. Core types: WorkOrderCard, WorkOrderTask, TeamMember, ActivityEntry, ExecutionChecklist
4. Mock data: MOCK_TEAM, MOCK_WORK_ORDER_0847, MOCK_EXECUTION_CHECKLIST
5. UserAvatar + AvatarStack components

### Sprint 2 (Days 4-8): Work Order System
6. Work Orders tab — list view with cards
7. Work Order Detail view — 3-column layout with 5 inner tabs
8. Overview tab content (summary, equipment, parts, root cause)
9. Tasks tab with task cards, status, dependencies, blocked state
10. Workflows tab with workflow cards + review thread
11. Discussion tab with threaded comments
12. Activity tab with full timeline
13. Team sidebar with role + status indicators

### Sprint 3 (Days 9-12): Collaboration Components
14. AssignmentPopover component (reused across platform)
15. MentionInput component with @autocomplete
16. My Tasks tab (filtered personal view)
17. Notification badge on OpsHub nav tab
18. Follow/Bookmark buttons on Work Orders
19. Connect anomaly card buttons → Work Order creation + assignment flow

### Sprint 4 (Days 13-16): Execution + Tier 2/3 Features
20. Execution Checklist — full-screen step-by-step interface
21. Photo capture mock (use file picker as stand-in)
22. Voice note button (mock recording UI)
23. Task dependency unlocking (when #1 completes → #3 unblocks)
24. AI maintenance integrity verification mock (before/after sensor comparison)
25. Auto-resolve Work Order when all tasks + verification complete

### Sprint 5 (Days 17-20): Timeline + Digital Twin + Workflow Builder
26. All Timeline enhancements from main prompt (Export CSV, Annotations, Cross-layer, Share Finding)
27. All Digital Twin enhancements from main prompt (Auto-fly, Heatmap, Pulse effect)
28. Workflow Template Gallery + Voice improvements from main prompt
29. Connect "Share Finding" and "Publish Workflow" back to Work Order Activity

### Sprint 6 (Days 21-23): Demo Polish
30. Saudi/Gulf localization (currency toggle, Riyadh facility)
31. Demo Mode panel (user switching: Sarah → Omar → Marco → Ahmed → Fahad)
32. Pre-populate ALL mock data for the complete Munich Incident story
33. Cross-facility adaptation flow (Fahad adapts Munich's Work Order)
34. Full 14-minute demo rehearsal run
35. Projector/contrast testing

---

# PART E: COMPONENT TREE (Final)

```
/components/
  shared/
    UserAvatar.tsx              — Circle avatar with initials + status
    AvatarStack.tsx             — Overlapping avatars for compact display
    MentionInput.tsx            — Text input with @mention autocomplete
    AssignmentPopover.tsx       — Team member picker for task assignment
    FollowButton.tsx            — Follow/Unfollow toggle
    BookmarkButton.tsx          — Bookmark toggle

  features/
    opshub/
      OpshubLayout.tsx          — Tab container (Home / My Tasks / Work Orders)
      OpshubHome.tsx            — Existing Home (anomalies + feed + activity log)
      MyTasks.tsx               — Personal task queue
      MyTaskCard.tsx            — Individual task card in My Tasks
      WorkOrderList.tsx         — Browse all work orders
      WorkOrderListCard.tsx     — Work order card in list view
      WorkOrderDetail.tsx       — Full work order view (3-column)
      WorkOrderOverview.tsx     — Overview tab (README equivalent)
      WorkOrderTasks.tsx        — Tasks tab (Issues equivalent)
      WorkOrderTaskCard.tsx     — Individual task card
      WorkOrderWorkflows.tsx    — Workflows tab (Code equivalent)
      WorkOrderDiscussion.tsx   — Discussion tab (threaded comments)
      WorkOrderActivity.tsx     — Activity tab (audit timeline)
      WorkOrderTeamSidebar.tsx  — Right sidebar (team + risk + tags + links)
      ExecutionChecklist.tsx    — Full-screen step-by-step interface
      ChecklistStep.tsx         — Individual step card
      AdaptWorkOrder.tsx        — Adaptation configuration for other facilities

  layout/
    DemoModePanel.tsx           — Hidden panel for user switching in demo

/lib/
  types/
    opshub.ts                   — All Work Order, Task, Activity, Checklist types
    team.ts                     — TeamMember, MentionableUser
  store/
    opshub-store.ts             — Updated with tabs, work orders, my tasks
  hooks/
    useOpshubMockData.ts        — All mock data for demo scenario
    useWorkOrderDetail.ts       — Hook for work order detail logic
    useMyTasks.ts               — Hook for filtered personal tasks
    useActivityTimeline.ts      — Hook for generating activity entries
    useDemoMode.ts              — Hook for demo user switching
```

---

# END OF ADDENDUM v2

## Summary of what changed from v1:

1. **No separate Command Center** — "My Tasks" is a tab INSIDE OpsHub
2. **Work Order = Repository** — the complete container for an incident, with inner tabs (Overview/Tasks/Workflows/Discussion/Activity) mirroring GitHub's repo structure
3. **Tasks = Issues** — assigned to specific people, with dependencies and blocking
4. **Workflows = Code** — attached to work orders, with review threads like PRs
5. **Discussion = GitHub Comments** — threaded, with @mentions
6. **Activity = Commit History** — every action timestamped and attributed
7. **Ahmed Nasser added as ACT 4** — the execution chain is now complete with a step-by-step checklist, photo documentation, voice notes, and AI maintenance verification
8. **Adaptations = Forks** — other facilities can view the full Work Order and adapt the workflows

**The killer line for WAM:** "This is Industrial GitHub. A Work Order is a Repository. Tasks are Issues. Workflows are Code. Every assignment, every finding, every repair step — traceable, collaborative, and transferable across your entire organization."
