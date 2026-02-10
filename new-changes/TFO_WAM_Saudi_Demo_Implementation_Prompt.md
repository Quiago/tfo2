# TRIPOLAR TFO — WAM SAUDI DEMO: Implementation Prompt + Demo Script

## FOR THE CODING AGENT: Read this entire document before writing any code.

---

# PART 1: CONTEXT & OBJECTIVES

## What is this?
Tripolar Facilities Operations (TFO) is an industrial digital twin platform built with Next.js 14+, Zustand, Tailwind CSS v4, Recharts, and React Three Fiber. We are preparing a live demo for WAM (World AI & Metaverse) conference in Saudi Arabia. The demo must show a complete operational story across 3 user tiers in a single, flowing narrative.

## Architecture Reference
- **Framework:** Next.js 14+ (App Router), TypeScript Strict
- **State:** Zustand with Immer middleware (stores: `tfo-store`, `workflow-store`, `fithub-store`)
- **Styling:** Tailwind CSS v4 + CSS Modules
- **3D:** React Three Fiber + Drei
- **Charts:** Recharts
- **Pattern:** Headless/Container-Presenter (Hooks for logic, Components for UI)
- **All data is mock data** — use `useMockData` hooks pattern

## Critical Rules
1. Follow existing CLAUDE.md conventions (Hook-View pattern, playground pages, Zod validation)
2. Every new component gets: Code + Playground page + Documentation markdown + CHANGELOG entry
3. No `\n` in docx — use separate elements. No unicode bullets — use proper lists.
4. TypeScript strict mode. No `any`. All interfaces in `/lib/types/`.
5. Dark theme by default (the platform uses a dark theme as shown in screenshots)
6. All text content in English (demo audience is international at WAM Saudi)

---

# PART 2: REBRANDING CHANGES (Apply FIRST, before any new features)

## 2.1 Fithub → OpsHub Rebranding

The "Fithub" name and GitHub metaphor alienates factory personnel. Rename across the entire codebase:

### File Renames
```
/components/features/fithub/ → /components/features/opshub/
/lib/store/fithub-store.ts → /lib/store/opshub-store.ts
/lib/types/fithub.ts → /lib/types/opshub.ts
/lib/hooks/useFithubMockData.ts → /lib/hooks/useOpshubMockData.ts
/app/playground/fithub/ → /app/playground/opshub/
```

### Terminology Replacements (Global Find & Replace)

| Old Term | New Term | Context |
|----------|----------|---------|
| `Fithub` | `OpsHub` | Component names, store names, route paths |
| `fithub` | `opshub` | File names, import paths, CSS classes |
| `Repository` / `Repo` | `Solution Kit` | UI labels, type names, mock data |
| `Fork` (verb) | `Adapt` | Button labels, action names |
| `Forked` | `Adapted` | Status labels, past tense in mock data |
| `Fork` (noun/count) | `Adaptation` | Count labels ("4 adapted" not "4 forked") |
| `Star` (verb) | `Bookmark` | Button labels, action names |
| `Starred` | `Bookmarked` | Status labels |
| `Stars` (count) | `Bookmarks` | Count labels |
| `Pull Request` | `Improvement` | Card titles, type names |
| `Commit` | `Version` | Timeline labels |
| `Changelog` | `Activity Log` | Section headers, nav items |
| `Feed` | `Insights Feed` | Section headers |
| `Issue` | `Anomaly` | Already correct — keep as is |

### Navigation Tab Update
In the main navigation bar (`Overview | Digital Twin | Timeline | Workflows | Fithub`), change the last tab:
- **Old:** `🔀 Fithub`
- **New:** `📊 OpsHub`
- Keep the same icon style but use a more industrial icon (e.g., `LayoutDashboard` from lucide-react instead of git-related icons)

### OpsHub Store Updates (`/lib/store/opshub-store.ts`)
Rename all interface properties:
```typescript
// OLD
interface FithubRepo { stars: number; forks: number; }

// NEW  
interface SolutionKit { 
  bookmarks: number; 
  adaptations: number; 
  adaptedFrom?: string; // was "forkedFrom"
}
```

### Mock Data Updates (`/lib/hooks/useOpshubMockData.ts`)
Update all mock data strings:
```typescript
// OLD: "munich/Motor Vibration P... ⭐ 4 adopted 🔀 2 adapted"
// NEW: "munich/Motor Vibration Protocol — 📌 4 bookmarked · 🔄 2 adapted"

// OLD: "View changelog"
// NEW: "View activity log"

// OLD sidebar label: "TOP WORKFLOWS"  
// NEW sidebar label: "TOP SOLUTION KITS"
```

---

## 2.2 Work Order Language Updates

Ensure manufacturing-friendly terminology throughout:

| Old | New |
|-----|-----|
| `Create Ticket` (in workflow nodes) | `Create Work Order` |
| `Ticket` (anywhere) | `Work Order` |
| Any "incident" language | `Anomaly` or `Alert` |

---

# PART 3: TIER 1 REFINEMENTS — Overview + OpsHub (Gerente de Planta / Plant Manager)

These changes target the BUYER persona. The Plant Manager needs to see financial impact, trends, and act in under 5 seconds.

## 3.1 Overview Dashboard Enhancements

### 3.1.1 KPI Trend Indicators
**Location:** Facility Status panel (right side of Overview, Image 5 in screenshots)
**Current state:** Static values (OEE: 87.3%, Cycle Time: 42.1s, etc.)
**Required change:** Add a trend indicator below each KPI value.

```typescript
// /lib/types/dashboard.ts
interface KPICard {
  label: string;           // e.g., "OEE"
  value: string;           // e.g., "87.3"
  unit: string;            // e.g., "%"
  trend: 'up' | 'down' | 'stable';
  trendValue: string;      // e.g., "+2.1%"
  trendPeriod: string;     // e.g., "vs last week"
  status: 'good' | 'warning' | 'critical';
}
```

**UI Implementation:**
- Below each KPI value, render a small line: 
  - Green arrow up + "+2.1% vs last week" (if `trend === 'up'` and `status === 'good'`)
  - Red arrow down + "-1.3% vs last week" (if `trend === 'down'` and `status === 'warning'`)
  - Gray dash + "Stable vs last week" (if `trend === 'stable'`)
- Font size: 11px, color matches trend direction (green/red/gray)
- Use `TrendingUp`, `TrendingDown`, `Minus` icons from lucide-react

**Mock data for demo:**
```typescript
const FACILITY_KPIS: KPICard[] = [
  { label: 'OEE', value: '87.3', unit: '%', trend: 'up', trendValue: '+2.1%', trendPeriod: 'vs last week', status: 'good' },
  { label: 'Cycle Time', value: '42.1', unit: 's', trend: 'down', trendValue: '-0.8s', trendPeriod: 'vs last week', status: 'good' },
  { label: 'Robots Online', value: '18/20', unit: '', trend: 'stable', trendValue: '', trendPeriod: 'vs last week', status: 'warning' },
  { label: 'Paint Temp', value: '23.4', unit: '°C', trend: 'stable', trendValue: '', trendPeriod: 'vs last week', status: 'good' },
  { label: 'Booth Humidity', value: '55', unit: '%', trend: 'up', trendValue: '+3%', trendPeriod: 'vs last week', status: 'warning' },
  { label: 'Uptime', value: '99.2', unit: '%', trend: 'up', trendValue: '+0.1%', trendPeriod: 'vs last week', status: 'good' },
];
```

### 3.1.2 Financial Risk Summary Card
**Location:** New card at the TOP of the right panel (above Facility Status), or as a banner below the 3D preview.
**Purpose:** Plant Manager sees total risk exposure in 1 glance.

```typescript
// /lib/types/dashboard.ts
interface RiskSummaryCard {
  totalRiskExposure: number;    // e.g., 36500 (euros)
  currency: string;             // e.g., "EUR" or "SAR" for Saudi demo
  activeAnomalies: number;      // e.g., 4
  criticalCount: number;        // e.g., 1
  highCount: number;            // e.g., 2
  mediumCount: number;          // e.g., 1
  estimatedDowntimeHours: number; // e.g., 12
  trendVsLastWeek: 'up' | 'down' | 'stable';
  trendPercentage: string;      // e.g., "-15%" (risk went down = good)
}
```

**UI Implementation:**
- Dark card with subtle red/orange gradient border (not fill)
- Large number: `€36,500` or `SAR 136,875` (use a toggle or detect from location context)
- Subtitle: "Total Risk Exposure · 4 Active Anomalies"
- Mini bar chart: 1 Critical (red) | 2 High (orange) | 1 Medium (yellow) — horizontal stacked bar
- Bottom line: "⬇ -15% vs last week" in green (risk decreased = good)
- Width: full width of the right panel

### 3.1.3 Export PDF Button
**Location:** Top-right corner of Overview page, next to existing controls
**Functionality:** Generates a PDF snapshot of the current Overview dashboard state.

**Implementation approach:**
1. Add a button with `Download` icon from lucide-react, label "Export Report"
2. On click, use `html2canvas` + `jspdf` to capture the Overview panel
3. Include: Facility name, date/time, all KPIs, risk summary, active alerts list
4. Header: "Tripolar Operations Report — Munich Paint Shop — Feb 10, 2026"
5. **Install dependencies:** `npm install html2canvas jspdf`

```typescript
// /lib/hooks/useExportPDF.ts
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export function useExportPDF() {
  const exportToPDF = async (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const canvas = await html2canvas(element, { 
      backgroundColor: '#0f1117', // dark background
      scale: 2 
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(filename);
  };
  
  return { exportToPDF };
}
```

4. Wrap the Overview content area in a `<div id="overview-export-target">` for capture

### 3.1.4 Anomaly Cards Enhancement (OpsHub Home)
**Location:** Pending Anomalies section in OpsHub Home (Image 1 — the main home view)
**Current state:** Cards show Risk: €28K, RUL, Confidence, Suggested workflow
**Required additions:**

Add TWO new buttons per anomaly card:

**Button 1: "Check Spares"**
- Position: Next to "Investigate" button
- Icon: `Package` from lucide-react
- On click: Opens a modal/slide-over showing mock spare parts availability:

```typescript
interface SparePartCheck {
  anomalyId: string;
  requiredParts: SparePartItem[];
  estimatedLeadTime: string;
  totalPartsCost: number;
  allPartsAvailable: boolean;
}

interface SparePartItem {
  partName: string;        // "Bearing SKF 6205-2RS"
  partNumber: string;      // "SKF-6205-2RS-001"
  quantityNeeded: number;
  quantityInStock: number;
  warehouseLocation: string; // "Warehouse B, Shelf 4A"
  available: boolean;
  unitCost: number;
}
```

Mock data:
```typescript
const MOCK_SPARES: SparePartCheck = {
  anomalyId: 'anomaly-001',
  requiredParts: [
    { partName: 'Bearing SKF 6205-2RS', partNumber: 'SKF-6205-2RS-001', quantityNeeded: 2, quantityInStock: 5, warehouseLocation: 'Warehouse B, Shelf 4A', available: true, unitCost: 45 },
    { partName: 'Heating Element 2.5kW', partNumber: 'HE-2500-PB3', quantityNeeded: 1, quantityInStock: 1, warehouseLocation: 'Warehouse A, Shelf 12C', available: true, unitCost: 320 },
    { partName: 'Ventilation Fan Motor', partNumber: 'VFM-400-CE', quantityNeeded: 1, quantityInStock: 0, warehouseLocation: 'N/A — On Order', available: false, unitCost: 890 },
  ],
  estimatedLeadTime: '2-3 business days (1 part on order)',
  totalPartsCost: 1300,
  allPartsAvailable: false,
};
```

UI for the modal:
- Title: "Spare Parts Availability"
- Table with columns: Part | Qty Needed | In Stock | Location | Status
- Status column: green "Available" badge or red "On Order" badge
- Footer: "Total Parts Cost: €1,300 · Lead Time: 2-3 days"
- CTA button: "Include in Work Order" (closes modal and adds parts to the work order creation)

**Button 2: "View in 3D"**  
- This already exists (shown in Image 1). Keep it. Ensure it triggers navigation to Digital Twin tab with auto-fly to the affected equipment.

### 3.1.5 OpsHub Role-Based Views
**Location:** OpsHub Home page (Image 1)
**Current state:** Single view for all users
**Required change:** Add a subtle view toggle at the top of OpsHub Home

```typescript
type OpshubViewMode = 'executive' | 'engineering' | 'operations';
```

**Executive View (default for Plant Manager):**
- Anomalies sorted by `risk` (€ amount) descending
- Shows: Risk €, RUL, Confidence, Action buttons
- Activity Log section shows: financial saves, model updates, cross-facility adoptions
- Hides: Technical details like vibration values, sensor IDs

**Engineering View (for Reliability Engineer):**
- Anomalies sorted by `confidence` descending, then by `severity`
- Shows: Full sensor data (vibration RMS, temperature, thresholds), pattern match details, confidence %
- Activity Log shows: model version updates, new anomaly patterns detected, solution kit publications
- Shows: Solution Kits sidebar with technical details

**Operations View (for Automation Tech):**
- Anomalies sorted by `severity` then `RUL` (most urgent first)
- Shows: Suggested workflow, "Adapt Solution Kit" button prominent
- Activity Log shows: workflow adoptions, adaptation history
- Shows: Solution Kits sidebar with adaptation counts

**Implementation:**
- Add a segmented control (3 pills) at top-right of OpsHub Home: `Executive | Engineering | Operations`
- Store selection in `opshub-store.ts` as `viewMode: OpshubViewMode`
- Use the viewMode to conditionally render/sort/filter content
- Style: subtle pills with dark background, active state has a slight border glow

---

# PART 4: TIER 2 REFINEMENTS — Timeline + Digital Twin (Ingeniero de Confiabilidad)

These changes target the CHAMPION persona. The Reliability Engineer needs deep analytical tools and the ability to share findings.

## 4.1 Timeline Enhancements

### 4.1.1 Export CSV Button
**Location:** Top-right of Timeline component, next to the zoom controls (Minute/Hour/Day/Week/Year)
**Icon:** `Download` from lucide-react
**Label:** "Export CSV"

**Implementation:**
```typescript
// /lib/hooks/useTimelineExport.ts
export function useTimelineExport() {
  const exportToCSV = (data: TimelineDataPoint[], layerName: string) => {
    const headers = 'timestamp,value,type,predicted\n';
    const rows = data.map(d => 
      `${d.timestamp},${d.value},${layerName},${d.isPredictive ? 'true' : 'false'}`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tripolar_${layerName}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return { exportToCSV };
}
```

- Button renders next to the zoom control pills
- Exports currently visible data (respects zoom level and active layers)
- Filename format: `tripolar_sensors_2026-02-10.csv`

### 4.1.2 Annotation Layer
**Purpose:** Engineer can mark specific points on the timeline and share them as part of an anomaly investigation.

```typescript
// /lib/types/timeline.ts — ADD to existing types
interface TimelineAnnotation {
  id: string;
  timestamp: number;        // Unix ms — where on the X axis
  layerKey: string;         // Which layer this annotation is on ('sensors' | 'energy' | 'product')
  label: string;            // "Root cause identified here"
  author: string;           // "Omar K."
  createdAt: string;        // ISO date
  color: string;            // Annotation marker color
}
```

**UI Implementation:**
1. Add a toggle button in the Timeline toolbar: `📌 Annotate` (toggles annotation mode on/off)
2. When annotation mode is ON:
   - Cursor changes to crosshair
   - Clicking anywhere on a chart adds a vertical dashed line at that X position
   - A small popover appears asking for a label (text input, 100 char max)
   - On submit: annotation appears as a vertical dashed line with a small flag/pill at the top showing the label
3. Annotations persist in Zustand store (`timeline-store.ts` → add `annotations: TimelineAnnotation[]`)
4. Each annotation renders as:
   - A vertical dashed line (color: amber/yellow, `strokeDasharray: "4 4"`) using Recharts `ReferenceLine`
   - A small pill/badge at the top of the chart with the label text (truncated to 20 chars)
   - On hover: shows full label + author + time in a tooltip
5. Annotations should be toggleable (show/hide all annotations)

**Mock annotations for demo:**
```typescript
const MOCK_ANNOTATIONS: TimelineAnnotation[] = [
  {
    id: 'ann-001',
    timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
    layerKey: 'sensors',
    label: 'Vibration anomaly onset — bearing degradation pattern',
    author: 'Omar K.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    color: '#F59E0B',
  },
  {
    id: 'ann-002',
    timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
    layerKey: 'energy',
    label: 'Energy spike correlates with motor degradation',
    author: 'Omar K.',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    color: '#F59E0B',
  },
];
```

### 4.1.3 Cross-Layer Correlation Highlighting
**Purpose:** When the engineer selects a time range on one layer, the same range highlights on ALL other visible layers.

**Implementation:**
1. In the Timeline component, track a `selectedRange: { start: number; end: number } | null` in Zustand
2. When the user clicks and drags on any chart layer, set `selectedRange`
3. All other visible chart layers render a semi-transparent overlay (e.g., light blue at 10% opacity) over the selected range
4. Use Recharts `ReferenceArea` component:
```tsx
{selectedRange && (
  <ReferenceArea
    x1={selectedRange.start}
    x2={selectedRange.end}
    fill="#3B82F6"
    fillOpacity={0.1}
    stroke="#3B82F6"
    strokeOpacity={0.3}
  />
)}
```
5. Add a "Clear Selection" button that appears when a range is selected

### 4.1.4 "Share Finding" Action
**Location:** Appears when a range is selected OR when hovering over an annotation
**Purpose:** Engineer creates a finding that goes to OpsHub as an investigation

```typescript
interface TimelineFinding {
  id: string;
  title: string;
  description: string;
  timeRange: { start: number; end: number };
  layers: string[];           // Which layers were active
  annotations: string[];      // IDs of annotations in range
  author: string;
  severity: 'info' | 'warning' | 'critical';
  linkedAnomalyId?: string;   // Links to an existing anomaly in OpsHub
}
```

**UI:** Small floating action button appears at the bottom-right of the selected range: "📤 Share Finding"
- Opens a modal with: Title, Description, Severity selector, optional link to existing anomaly
- On submit: adds to OpsHub Insights Feed

---

## 4.2 Digital Twin Enhancements

### 4.2.1 Auto-Fly on Alert Click
**This is CRITICAL for the demo.**

**Current behavior:** Clicking an alert in Overview → navigates to Digital Twin tab → user must manually find the equipment
**Required behavior:** Clicking "View in 3D" on any alert → navigates to Digital Twin → camera automatically flies to the affected equipment → equipment pulses/glows red

**Implementation:**

1. In `tfo-store.ts`, add:
```typescript
interface TFOStore {
  // ... existing fields
  focusedEquipmentId: string | null;
  setFocusedEquipment: (id: string | null) => void;
}
```

2. When "View in 3D" is clicked on any anomaly card:
```typescript
const handleViewIn3D = (equipmentMeshId: string) => {
  // Set the focused equipment
  store.setFocusedEquipment(equipmentMeshId);
  // Navigate to Digital Twin tab
  store.setActiveModule('digital-twin');
};
```

3. In the Digital Twin component, use a `useEffect` to watch `focusedEquipmentId`:
```typescript
useEffect(() => {
  if (focusedEquipmentId && cameraRef.current) {
    // Find the mesh position from the scene
    const targetMesh = scene.getObjectByName(focusedEquipmentId);
    if (targetMesh) {
      const targetPosition = new THREE.Vector3();
      targetMesh.getWorldPosition(targetPosition);
      
      // Animate camera to position (offset for viewing angle)
      // Use @react-three/drei's CameraControls or manual GSAP/spring animation
      animateCameraTo({
        position: [targetPosition.x + 5, targetPosition.y + 3, targetPosition.z + 5],
        target: [targetPosition.x, targetPosition.y, targetPosition.z],
        duration: 1.5, // seconds
      });
      
      // Start pulsing glow on the equipment
      startEquipmentPulse(focusedEquipmentId);
    }
  }
}, [focusedEquipmentId]);
```

4. **Pulse effect:** The focused equipment should pulse with a red/orange emissive glow:
```typescript
// In the equipment mesh component
const pulseRef = useRef<THREE.Mesh>(null);

useFrame(({ clock }) => {
  if (isFocused && pulseRef.current) {
    const material = pulseRef.current.material as THREE.MeshStandardMaterial;
    const intensity = Math.sin(clock.elapsedTime * 3) * 0.5 + 0.5;
    material.emissive.setRGB(intensity * 0.8, intensity * 0.1, 0);
    material.emissiveIntensity = intensity;
  }
});
```

5. After 5 seconds, the pulse should slow down (not stop — keep subtle glow to indicate the focused item)
6. Clicking anywhere else or clicking "Back to Overview" clears `focusedEquipmentId`

### 4.2.2 Heatmap Mode Toggle
**Location:** New toggle in the Digital Twin toolbar (left sidebar icons, Image 4)
**Icon:** `Thermometer` from lucide-react, with label "Heatmap"

**Implementation:**
1. Add to `tfo-store.ts`: `digitalTwinViewMode: 'normal' | 'heatmap'`
2. In heatmap mode, ALL equipment meshes get colored by their health score:
   - Health 90-100%: Green (#22C55E)
   - Health 70-89%: Yellow (#EAB308)  
   - Health 50-69%: Orange (#F97316)
   - Health 0-49%: Red (#EF4444)
3. The floor/structure stays dark gray. Only equipment meshes change color.
4. Each equipment mesh should have a small floating label (HTML overlay using `@react-three/drei`'s `Html` component):
   - Shows: Equipment name + Health % (e.g., "KUKA KR300 · 89%")
   - Only visible in heatmap mode
   - Use Billboard effect so labels always face camera

**Mock health data:**
```typescript
const EQUIPMENT_HEALTH: Record<string, number> = {
  'kuka_kr300_cell_a': 89,
  'kuka_kr300_cell_b': 45,  // This one should be red — the alert target
  'conveyor_line_3': 72,
  'paint_booth_3': 38,      // Critical — drying section issue
  'oven_zone_north': 65,
  'sealer_kr120': 78,
  'kuka_kr300_cell_c': 94,
  'kuka_kr300_cell_d': 91,
};
```

### 4.2.3 Equipment Info Panel Enhancement
**Location:** Right-side panel when equipment is selected (Image 4 — KUKA KR300 panel)
**Current state:** Shows Health Status, Energy Consumption, Monitoring/Workflows/Logs/Manual buttons
**Required additions:**

Add a "Recent Anomalies" mini-section below Energy Consumption:
```typescript
interface EquipmentAnomalyPreview {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  daysAgo: number;
  status: 'active' | 'investigating' | 'resolved';
}
```

UI:
- Section header: "Recent Anomalies" with a count badge
- List of 2-3 items, each as a single line: `🔴 Vibration spike — 2d ago — Active`
- Clicking any anomaly → sets it as focused anomaly and pulses the equipment (same as auto-fly)
- "See all in OpsHub →" link at the bottom

---

# PART 5: TIER 3 REFINEMENTS — Workflows (Técnico de Automatización)

These changes target the POWER USER persona. The Automation Tech needs templates to start fast and voice to build workflows hands-free.

## 5.1 Workflow Template Gallery
**Location:** Shown when Workflow Builder opens with an empty canvas (Image 2 currently shows empty canvas)
**Purpose:** Remove the intimidation of the blank canvas.

### 5.1.1 Template Overlay Component
**Component:** `/components/features/workflow-builder/WorkflowTemplateGallery.tsx`

When the canvas has 0 nodes, show a centered overlay with:

**Header:** "Start a new workflow"
**Subtitle:** "Choose a template or create from scratch"

**Three template cards (each is clickable and loads a pre-built workflow):**

**Template 1: "Vibration Alert → Work Order"**
```
Icon: Activity (lucide)
Description: "Monitor vibration levels. When threshold exceeded, create work order and notify supervisor."
Nodes: SensorTrigger → Decision (threshold check) → CreateWorkOrder + SendAlert
Complexity: "3 steps · Beginner"
Badge: "Most Popular"
```

Pre-built node data:
```typescript
const TEMPLATE_VIBRATION: WorkflowTemplate = {
  id: 'tpl-vibration-alert',
  name: 'Vibration Alert → Work Order',
  description: 'Monitor vibration levels. When threshold exceeded, create work order and notify supervisor.',
  category: 'predictive-maintenance',
  complexity: 'beginner',
  estimatedSetupTime: '2 min',
  nodes: [
    { id: 'n1', type: 'sensor-trigger', position: { x: 100, y: 200 }, data: { label: 'Sensor Trigger', config: { metric: 'vibration_rms', operator: '>', threshold: 5.0, unit: 'mm/s' } } },
    { id: 'n2', type: 'decision', position: { x: 400, y: 200 }, data: { label: 'Check Severity', config: { conditions: [{ field: 'value', operator: '>', value: 8.0, label: 'Critical' }, { field: 'value', operator: '>', value: 5.0, label: 'High' }] } } },
    { id: 'n3', type: 'create-work-order', position: { x: 700, y: 100 }, data: { label: 'Create Work Order', config: { priority: 'high', assignTo: 'maintenance-lead', template: 'bearing-inspection' } } },
    { id: 'n4', type: 'send-alert', position: { x: 700, y: 300 }, data: { label: 'Notify Supervisor', config: { channel: 'email', recipients: ['supervisor@plant.com'], urgency: 'high' } } },
  ],
  edges: [
    { id: 'e1', source: 'n1', target: 'n2' },
    { id: 'e2', source: 'n2', target: 'n3', label: 'Critical/High' },
    { id: 'e3', source: 'n2', target: 'n4', label: 'Any' },
  ],
};
```

**Template 2: "Temperature Monitoring → Auto-Escalation"**
```
Icon: Thermometer (lucide)
Description: "Track temperature in paint booths. Auto-escalate if sustained above limit for 15 minutes."
Nodes: SensorTrigger → Schedule (wait 15min) → Decision (still high?) → SendAlert + LogEntry
Complexity: "4 steps · Intermediate"
```

**Template 3: "Scheduled Inspection → Checklist"**
```
Icon: ClipboardCheck (lucide)
Description: "Trigger daily inspection workflow. Technician completes checklist via mobile cards."
Nodes: ScheduleTrigger → ChecklistGate (5 items) → Decision (all pass?) → LogEntry OR CreateWorkOrder
Complexity: "4 steps · Intermediate"
```

**Bottom of overlay:**
- "Or start from scratch" link → dismisses overlay, shows empty canvas
- "🎙 Describe your workflow" button → opens voice input directly

### 5.1.2 Template Loading Animation
When a template is selected:
1. Overlay fades out (200ms)
2. Nodes appear one by one with a staggered animation (each node fades in + slides up from 10px below, 100ms apart)
3. Edges draw in after all nodes are placed (SVG stroke-dasharray animation, 300ms)
4. Final: all nodes and edges are fully interactive

## 5.2 Voice-to-Workflow Enhancement

### 5.2.1 First-Time Voice Experience
**Current state:** Mic button at bottom-right of canvas (Image 2)
**Problem:** Not obvious what it does or how to use it

**Required change:** When voice mode is activated for the first time in a session:
1. Show a brief tooltip/coach mark above the mic button: "Try saying: 'When vibration on Motor A7 exceeds 5mm/s, create a work order and notify the supervisor'"
2. The tooltip should have a "Got it" dismiss button and a "Show examples" link
3. "Show examples" opens a small panel with 3 example voice commands:
   - "If pump temperature goes above 80 degrees, send an alert to the maintenance team"
   - "Every Monday at 8am, start the weekly inspection checklist for Cell B"
   - "When a work order is created for any robot, log it and notify the plant manager"

### 5.2.2 Voice Processing Feedback
**After user speaks and releases mic:**
1. Show a transcription preview: the raw text of what was heard (e.g., "When vibration on motor A7 exceeds five millimeters per second create a work order and notify supervisor")
2. Show a 2-second processing animation (pulsing dots or spinning icon)
3. Show the parsed intent as confirmation cards:

```typescript
interface VoiceWorkflowIntent {
  rawTranscript: string;
  confidence: number;           // 0-1
  parsedSteps: ParsedStep[];
  suggestedName: string;        // AI-generated workflow name
}

interface ParsedStep {
  order: number;
  type: 'trigger' | 'condition' | 'action';
  nodeType: string;             // Maps to node palette type
  description: string;          // Human-readable
  config: Record<string, any>;  // Pre-filled config
}
```

4. Display as a vertical card stack (the ConfirmationCardOverlay):
   - Card 1 (green border): "TRIGGER: When vibration on Motor A7 > 5.0 mm/s"
   - Card 2 (blue border): "ACTION: Create Work Order — Priority: High, Assign: Maintenance Lead"
   - Card 3 (blue border): "ACTION: Send Alert — To: Supervisor, Urgency: High"
5. Bottom buttons: "✅ Build Workflow" | "🎙 Try Again" | "✏️ Edit Steps"
6. "Build Workflow" → generates the node graph with the staggered animation from 5.1.2

## 5.3 "Publish to OpsHub" Flow

### After Workflow is Built and Tested:
1. Add a button in the Workflow Toolbar: "📤 Publish to OpsHub"
2. On click, open a modal:
   - **Name:** (pre-filled from workflow name)
   - **Description:** (text area, 200 char)
   - **Category:** Dropdown: Predictive Maintenance | Quality Control | Safety | Energy Optimization | Custom
   - **Visibility:** Toggle: "This facility only" | "All facilities" (with note: "Published Solution Kits can be adapted by other facilities in your organization")
   - **Tags:** Chip input (e.g., "vibration", "bearing", "KUKA", "paint-shop")
3. On publish: workflow appears in OpsHub sidebar under "TOP SOLUTION KITS" with the author's name and "New" badge

---

# PART 6: GLOBAL DEMO POLISH

## 6.1 Saudi/Gulf Localization Touches

For the WAM Saudi demo, add these subtle touches:

### 6.1.1 Currency Toggle
- In the Overview Risk Summary Card and Anomaly Cards, show currency as SAR (Saudi Riyal) alongside EUR
- Add a small currency toggle in the top toolbar: `EUR | SAR`
- Conversion rate (mock): 1 EUR = 3.75 SAR
- When SAR is selected: "Risk: SAR 105,000" instead of "Risk: €28,000"

### 6.1.2 Location Context
- In the sidebar "All Factories" list, add a facility:
  - `🏗️ Riyadh Manufacturing · Saudi Arabia` (in addition to Munich, Shanghai, Detroit, Tokyo, São Paulo)
- When Riyadh is selected, adjust mock data to show:
  - Higher temperatures (ambient 45°C context)
  - Energy costs in SAR
  - Local time zone (AST, UTC+3)

### 6.1.3 RTL Awareness
- Do NOT implement full RTL. But ensure:
  - Numbers render LTR even in Arabic contexts
  - The platform gracefully handles Arabic names in mock data (e.g., "Omar K." as an annotation author, "Fahad M." as a workflow creator)

## 6.2 Status Bar Enhancement
**Location:** Bottom status bar (currently shows: OEE, Cycle Time, Robots Online, Paint Temp, TFO version)
**Add:** A subtle "All systems operational" dot should pulse gently (CSS animation, not JS)

```css
@keyframes pulse-green {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.status-dot {
  animation: pulse-green 2s ease-in-out infinite;
}
```

---

# PART 7: WAM SAUDI DEMO SCRIPT — "The Munich Incident"

## Overview
This is a 12-minute live demo that tells the story of a single incident flowing through ALL 3 tiers of users. The narrative follows a paint booth temperature anomaly at the Munich Plant that cascades through the entire platform.

## Characters (Roles in the Demo)

| Character | Role | Tier | What they do |
|-----------|------|------|-------------|
| **Sarah Chen** | Plant Manager, Munich | Tier 1 | Sees the alert, evaluates risk, approves action |
| **Omar Khalid** | Reliability Engineer, Munich | Tier 2 | Investigates root cause using Timeline + Digital Twin |
| **Marco Silva** | Automation Technician, Munich | Tier 3 | Builds automated workflow to prevent recurrence |
| **Fahad Al-Rashid** | Plant Manager, Riyadh | Tier 1 | Adapts Munich's solution for his facility |

---

## ACT 1: "THE ALERT" (3 minutes) — Tier 1: Plant Manager

### Scene Setup
**Open on:** OpsHub Home view (Image 1 layout with new enhancements)
**Facility:** Munich Paint Shop, EU-Central
**View mode:** Executive (default)

### Narration Script:

> "It's 7:15 AM in Munich. Sarah Chen, the Plant Manager, opens Tripolar on her tablet. This is her first screen every morning."

**Action:** Show OpsHub Home. Point to the Risk Summary Card at the top.

> "In less than 5 seconds, she sees what matters: €36,500 total risk exposure across 4 active anomalies. That's down 15% from last week — her team is making progress."

**Action:** Scroll down to the Pending Anomalies.

> "But this one gets her attention."

**Action:** Point to the CRITICAL anomaly card:
```
🔴 CRITICAL · Shanghai Facility · 91% confidence
Paint Booth #3 — Drying Section
Temperature spike: 42°C (normal: 22-28°C). Possible heating element malfunction or ventilation blockage.
⏱ RUL: 4 hours · 💰 Risk: €28,000 · 🔍 View in 3D
Suggested: Paint Booth Temperature Control
[✅ Approve & Create Work Order] [Dismiss] [🔍 Investigate]
```

> "Paint Booth #3 is spiking to 42°C — 14 degrees above normal. The AI gives 91% confidence this is a heating element malfunction. Remaining useful life: 4 hours. Financial risk: €28,000."

**Action:** Click "Check Spares" button.

> "Before she approves any work order, she wants to know: do we have the parts?"

**Action:** Show the Spare Parts modal:
```
✅ Bearing SKF 6205-2RS — 5 in stock (Warehouse B, Shelf 4A)
✅ Heating Element 2.5kW — 1 in stock (Warehouse A, Shelf 12C)
❌ Ventilation Fan Motor — On Order (2-3 days)
Total Parts Cost: €1,300
```

> "Two parts available, one on order. She includes the available parts in the work order and escalates the fan motor procurement."

**Action:** Click "Include in Work Order" → Click "Approve & Create Work Order"

> "Work order created. But Sarah doesn't just want it fixed — she wants to understand WHY. She routes this to her reliability engineer."

**Action:** Click "Investigate" → System shows a notification: "Investigation assigned to Omar Khalid"

**Transition:** "Let's follow Omar."

---

## ACT 2: "THE INVESTIGATION" (4 minutes) — Tier 2: Reliability Engineer

### Scene Setup
**Switch to:** Timeline tab
**Time range:** Day view, last 2 weeks visible

### Narration Script:

> "Omar Khalid is the Reliability Engineer. When he gets Sarah's investigation assignment, he goes straight to the Timeline."

**Action:** Show Timeline with Product Output + Sensors + Energy layers all visible.

> "This is what makes Tripolar different from anything else on the market. Omar can overlay production output, sensor data, and energy consumption on a single synchronized timeline. The solid lines are historical data. The dashed lines? Those are the AI's predictions."

**Action:** Point to the sensor layer showing vibration starting to climb 3 days ago.

> "He spots it immediately. Vibration in the paint booth started climbing 3 days ago — well before the temperature alert triggered this morning. The AI predicted this trajectory."

**Action:** Click and drag to select the 3-day range on the sensor layer. Show the cross-layer correlation highlighting appearing on ALL layers simultaneously.

> "Watch this. When Omar selects a time range on any layer, every other layer highlights the same period. He can see that as vibration climbed, energy consumption also spiked — the motor was drawing more power to compensate. And production output started dipping yesterday."

**Action:** Click the "📌 Annotate" button. Click on the point where vibration started climbing. Type: "Bearing degradation onset — root cause"

> "He marks the root cause point with an annotation. This becomes part of the permanent record."

**Action:** Click "📤 Share Finding" button on the selected range.

> "And he shares his finding — this goes directly to OpsHub where the whole team can see it."

**Action:** Switch to Digital Twin tab. Show auto-fly animation to Paint Booth #3.

> "Now he needs spatial context. He clicks 'View in 3D' and the digital twin flies directly to Paint Booth #3."

**Action:** Camera auto-flies to the paint booth. Equipment pulses with red glow. Right panel shows equipment details.

> "The equipment is pulsing red — 38% health score. He can see the energy consumption is 17.8 kW against a 15.2 average — 17% over normal."

**Action:** Click "Heatmap" toggle. Whole factory floor colorizes by health.

> "He toggles heatmap mode to see the full picture. Most equipment is green. But Paint Booth 3 and one conveyor are yellow-to-red. This isn't isolated — there might be a systemic ventilation issue in this zone."

**Action:** Toggle heatmap off. Click "Export CSV" on the Timeline.

> "He exports the data for deeper analysis and documents everything. Now he knows the pattern: bearing degradation → increased vibration → higher energy draw → temperature spike. He needs to make sure this never happens again without early detection."

**Transition:** "He calls Marco."

---

## ACT 3: "THE AUTOMATION" (3 minutes) — Tier 3: Automation Technician

### Scene Setup
**Switch to:** Workflows tab
**Start with:** Empty canvas showing Template Gallery

### Narration Script:

> "Marco Silva is the Automation Technician. His job: turn Omar's finding into a preventive workflow that catches this pattern before it becomes a €28,000 problem."

**Action:** Show the Workflow Template Gallery overlay.

> "When Marco opens the Workflow Builder, he doesn't face a blank canvas. He sees templates — pre-built starting points for common scenarios."

**Action:** Click "Vibration Alert → Work Order" template. Show the staggered node animation.

> "He picks the vibration alert template. Watch the nodes appear — trigger, decision, work order, notification. This is a working workflow in 3 seconds."

**Action:** Show the nodes fully loaded on canvas.

> "But Marco wants something more specific. He wants to capture Omar's exact finding — the bearing degradation pattern with the energy correlation."

**Action:** Click the mic button. Show the voice input UI.

> "So he uses voice."

**Action:** Simulate voice input:
> *"When vibration on any paint booth motor exceeds 4 millimeters per second AND energy consumption increases by more than 15 percent, create a high-priority work order for bearing inspection and send an alert to Omar and Sarah"*

**Action:** Show the transcription preview → processing animation → confirmation cards:
```
✅ TRIGGER: Vibration > 4.0 mm/s on paint booth motors
✅ CONDITION: AND energy consumption > +15% above baseline  
✅ ACTION: Create Work Order — Priority: High, Type: Bearing Inspection
✅ ACTION: Send Alert — To: Omar Khalid, Sarah Chen
```

> "The AI parsed his natural language into structured workflow steps. He reviews the cards — trigger, condition, two actions. Everything correct."

**Action:** Click "Build Workflow" → show the enhanced node graph with the AND condition node.

> "One click — and the workflow is built. Now he publishes it to OpsHub so other facilities can benefit."

**Action:** Click "📤 Publish to OpsHub" → fill in the modal:
- Name: "Paint Booth Bearing Degradation Early Warning"
- Category: Predictive Maintenance
- Visibility: All Facilities
- Tags: vibration, bearing, paint-booth, energy-correlation

> "Published as a Solution Kit — available to every facility in the organization."

---

## ACT 4: "THE NETWORK EFFECT" (2 minutes) — Cross-Facility

### Scene Setup
**Switch to:** OpsHub Home
**Facility:** Switch to "Riyadh Manufacturing" in the sidebar

### Narration Script:

> "Now here's where Tripolar becomes something no other platform offers."

**Action:** Switch facility to Riyadh. Show OpsHub Home from Fahad's perspective.

> "Fahad Al-Rashid manages the Riyadh plant. He opens OpsHub and sees something new in his Insights Feed."

**Action:** Point to the feed item:
```
🔄 New Solution Kit available
"Paint Booth Bearing Degradation Early Warning"
Published by Marco Silva · Munich Plant · 2 hours ago
📌 3 bookmarked · Category: Predictive Maintenance
[Adapt for Riyadh] [View Details]
```

> "Munich just solved a paint booth bearing problem. Fahad has similar equipment. He clicks 'Adapt for Riyadh.'"

**Action:** Click "Adapt for Riyadh" → Show a brief configuration screen:
- Threshold adjustment: 4.0 mm/s → 4.5 mm/s (Riyadh runs hotter, thresholds differ slightly)
- Recipients: Change to Riyadh team
- Currency: SAR instead of EUR

> "He adjusts the vibration threshold for his environment — Riyadh runs hotter, so his baseline is slightly different. Two minutes of customization, and he has a workflow that Munich spent 3 hours investigating."

**Action:** Show the adapted workflow active in Riyadh.

> "This is the network effect. Knowledge flows from Munich to Riyadh to Detroit to Shanghai. Every incident makes every facility smarter. This is what we call Continuous Operational Intelligence."

---

## CLOSING (30 seconds)

**Action:** Return to Overview, Munich Plant. Show the full dashboard.

> "What you've just seen is a single incident flowing through an entire organization:

> The Plant Manager saw the risk and acted in seconds.
> The Reliability Engineer investigated across dimensions — time, space, and data layers.
> The Automation Technician built prevention using his voice.
> And another Plant Manager, 5,000 kilometers away, benefited from that knowledge in minutes.

> This is Tripolar. Spatial Intelligence for Industrial Operations. 

> Thank you."

---

## DEMO TECHNICAL NOTES

### Pre-Demo Setup Checklist:
1. ☐ Load Munich Paint Shop as default facility
2. ☐ Ensure Paint Booth #3 anomaly is in CRITICAL state with mock data
3. ☐ Pre-load Timeline with 2 weeks of mock data showing the vibration climb pattern
4. ☐ Pre-load Digital Twin with equipment health scores (Paint Booth 3 at 38%)
5. ☐ Ensure Workflow Template Gallery appears on empty canvas
6. ☐ Pre-configure voice mock to return the bearing degradation workflow
7. ☐ Add Riyadh facility to sidebar with mock data
8. ☐ Ensure OpsHub feed shows Marco's published Solution Kit when switching to Riyadh
9. ☐ Test all transitions: OpsHub → Timeline → Digital Twin → Workflows → OpsHub
10. ☐ Test auto-fly camera animation (must be smooth, no jank)
11. ☐ Test Export CSV and Export PDF buttons
12. ☐ Ensure dark theme renders correctly on projector (test contrast)

### Screen Resolution:
- Demo on 1920x1080 minimum
- Test on projector at WAM venue if possible
- Ensure all text is readable at 3m distance (minimum 14px body text)

### Fallback Plan:
- If voice input fails live: have a pre-recorded voice clip ready
- If 3D rendering is slow: skip heatmap mode, focus on auto-fly
- If projector color is washed out: increase contrast in Tailwind config beforehand

### Timing Guide:
| Act | Duration | Key Moments |
|-----|----------|-------------|
| Act 1: The Alert | 3 min | Risk card, Spares check, Work order approval |
| Act 2: The Investigation | 4 min | Cross-layer correlation, Annotation, Auto-fly, Heatmap |
| Act 3: The Automation | 3 min | Template gallery, Voice workflow, Publish to OpsHub |
| Act 4: The Network Effect | 2 min | Facility switch, Adapt Solution Kit, Closing |
| **Total** | **12 min** | |

---

# PART 8: IMPLEMENTATION PRIORITY ORDER

Execute these changes in this EXACT order to maintain a demo-ready state at each step:

### Sprint 1 (Days 1-3): Foundation
1. Fithub → OpsHub rename (global find & replace + file renames)
2. Terminology updates (Repo → Solution Kit, Fork → Adapt, etc.)
3. Navigation tab icon update
4. Verify nothing breaks after rename

### Sprint 2 (Days 4-7): Tier 1 — Overview & OpsHub
5. KPI Trend Indicators on Facility Status cards
6. Financial Risk Summary Card
7. Anomaly Card enhancements (Check Spares button + modal)
8. OpsHub role-based view toggle (Executive/Engineering/Operations)
9. Export PDF button on Overview

### Sprint 3 (Days 8-12): Tier 2 — Timeline & Digital Twin
10. Export CSV button on Timeline
11. Annotation layer (add/display/toggle annotations)
12. Cross-layer correlation highlighting (drag-select → ReferenceArea)
13. Share Finding action
14. Auto-fly on alert click (CRITICAL — invest time here)
15. Equipment pulse/glow effect
16. Heatmap mode toggle
17. Equipment Info Panel → Recent Anomalies section

### Sprint 4 (Days 13-17): Tier 3 — Workflows
18. Workflow Template Gallery (3 templates)
19. Template loading animation (staggered nodes + edge drawing)
20. Voice-first experience improvements (coach marks, examples panel)
21. Enhanced voice processing feedback (transcription → cards → build)
22. Publish to OpsHub flow (modal + integration with OpsHub store)

### Sprint 5 (Days 18-20): Demo Polish
23. Saudi/Gulf localization (currency toggle, Riyadh facility, Arabic names)
24. Status bar pulse animation
25. Cross-facility adaptation flow (Riyadh adapts Munich's Solution Kit)
26. Full demo walkthrough testing (12-minute run)
27. Projector/contrast optimization
28. Fallback preparations (pre-recorded voice, pre-cached 3D)

---

# END OF PROMPT

This document serves as the single source of truth for:
1. **Coding agent:** Every component, interface, mock data structure, and implementation detail is specified
2. **Demo presenter:** The script in Part 7 is a word-for-word narration guide
3. **QA:** The checklist in Demo Technical Notes covers all verification points
4. **Sprint planning:** Part 8 gives exact execution order with day estimates

**Any questions about implementation should be resolved by re-reading the relevant section of this document, not by making assumptions.**
