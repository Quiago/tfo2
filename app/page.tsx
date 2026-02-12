'use client'

import { AssetTree } from '@/components/asset-details/AssetTree'
import { MachineSummaryBar } from '@/components/asset-details/MachineSummaryBar'
import { DigitalTwinNavigator } from '@/components/digital-twin/DigitalTwinNavigator'
import { CAMERA_PRESETS } from '@/components/digital-twin/camera-presets'
import { useOpshubStore } from '@/lib/store/opshub-store'
import { useTfoStore, type FacilityLocation } from '@/lib/store/tfo-store'
import type { TfoModule } from '@/lib/types/tfo'
import {
    Activity,
    AlertTriangle,
    ChevronDown,
    LayoutDashboard,
    LayoutGrid,
    MapPin,
    Minimize2,
    Search,
    Workflow
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'

// Dynamic imports — SSR disabled for heavy components
const MultiLayerTimeline = dynamic(
    () =>
        import('@/components/timeline/Timeline').then((m) => m.MultiLayerTimeline),
    { ssr: false, loading: () => <ModuleLoader label="Timeline" /> }
)

const WorkflowBuilder = dynamic(
    () =>
        import('@/components/workflow-builder').then((m) => m.WorkflowBuilder),
    { ssr: false, loading: () => <ModuleLoader label="Workflow Builder" /> }
)

const OpshubLayout = dynamic(
    () => import('@/components/opshub').then((m) => m.OpshubLayout),
    { ssr: false, loading: () => <ModuleLoader label="OpsHub" /> }
)

// ─── MODULE REGISTRY ────────────────────────────────────────────────────────
const MODULES: { id: TfoModule; label: string; icon: React.ReactNode; description: string }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutGrid size={16} />, description: 'Facility dashboard' },

    { id: 'timeline', label: 'Timeline', icon: <Activity size={16} />, description: 'Sensor time-series' },
    { id: 'workflows', label: 'Workflows', icon: <Workflow size={16} />, description: 'Process automation' },
    { id: 'opshub', label: 'OpsHub', icon: <LayoutDashboard size={16} />, description: 'Cross-facility ops' },
]

// ─── LOADING PLACEHOLDER ────────────────────────────────────────────────────
function ModuleLoader({ label }: { label: string }) {
    return (
        <div className="flex h-full w-full items-center justify-center bg-zinc-950">
            <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-cyan-500" />
                <span className="text-xs text-zinc-500">Loading {label}...</span>
            </div>
        </div>
    )
}

// No DigitalTwinFrame component — single iframe rendered directly in main

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────

export default function TFODashboard() {
    const { activeModule, setActiveModule, facilityMetrics, activeAlerts, recentWorkflows, locations, activeLocationId, setActiveLocation } =
        useTfoStore()

    const setPendingCreateWorkOrder = useOpshubStore(s => s.setPendingCreateWorkOrder)

    const activeLocation = locations.find((l) => l.id === activeLocationId) ?? locations[0]

    const handleModuleChange = useCallback(
        (mod: TfoModule) => setActiveModule(mod),
        [setActiveModule]
    )

    // Track which modules have been visited (lazy mount, never unmount)
    const [mounted, setMounted] = useState<Set<TfoModule>>(new Set(['overview']))
    useEffect(() => {
        setMounted((prev) => {
            if (prev.has(activeModule)) return prev
            const next = new Set(prev)
            next.add(activeModule)
            return next
        })
    }, [activeModule])

    // View Mode State: 'overview' vs 'details'
    const [viewMode, setViewMode] = useState<'overview' | 'details'>('overview')
    const [selectedAsset, setSelectedAsset] = useState<string | null>(null)
    const [autoTriggerAnomaly, setAutoTriggerAnomaly] = useState(false)

    const isOverview = activeModule === 'overview'

    // When clicking a mesh, switch to details mode
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'MESH_CLICK') {
                const meshName = event.data.meshName
                setSelectedAsset(meshName)
                setViewMode('details')
            }
        }
        window.addEventListener('message', handleMessage)
        return () => window.removeEventListener('message', handleMessage)
    }, [])

    // Handler for DigitalTwinNavigator click (need to expose this via the iframe or component)
    // Note: Since we are using an iframe for the DT, we need to pass props via postMessage or URL params if possible,
    // OR render the DigitalTwinNavigator directly if we want tighter integration.
    // The current architecture uses an iframe pointing to generic playground.
    // To support the seamless transition requested, rendering the component directly is better,
    // BUT to minimize risk, let's keep the iframe and control it via className/layout changes.
    // WAIT: The "shrink" effect on the model requires the canvas to resize.

    // Modification: Render DigitalTwinNavigator DIRECTLY instead of iframe to allow prop passing and smoother transition.
    // We already imported it in `playground/digital-twin/page.tsx`. Let's assume we can import it here too.

    // But wait, the dynamic import in page.tsx implies module separation.
    // Let's modify the DigitalTwin wrapper to simply be the component if we can.
    // For now, I will stick to the iframe strategy but resize the iframe container. 
    // AND I need to pass the 'viewMode' and 'isolatedMeshName' to the iframe context.
    // OR simpler: Move DigitalTwinNavigator import here and drop the iframe.
    // Let's drop the iframe for better control as requested by the specific transition effect.

    return (
        <div className="flex h-screen flex-col bg-slate-50 text-slate-900">
            {/* ── NAVBAR ───────────────────────────────────────────────── */}
            <Navbar
                activeModule={activeModule}
                onModuleChange={handleModuleChange}
                locations={locations}
                activeLocation={activeLocation}
                onLocationChange={setActiveLocation}
            />

            {/* ── BODY ─────────────────────────────────────────────────── */}
            <main className="relative flex-1 overflow-hidden flex">

                {/* ── UNIFIED CONTENT CONTAINER ── 
                    We use a flex layout. 
                    - Overview: Digital Twin takes 100% absolute, Panels overlay.
                    - Details: Standard Flex/Grid layout.
                */}

                {/* ── LEFT COLUMN (Variable Width) ── */}
                <div className={`flex flex-col border-r border-zinc-800 transition-all duration-700 ease-in-out ${viewMode === 'details' ? 'w-[20%]' : 'w-0 border-none'
                    }`}>
                    {/* Top: 3D Model Container (When in Details Mode) */}
                    {/* Actually, if we want the 3D model to shrink from Full to Top-Left, 
                         we should keep the 3D model container independent and resize it. 
                         Let's try absolute positioning transition. 
                     */}
                </div>

                {/* ── DYNAMIC LAYOUT ── */}

                {/* 3D Model Container - Transitions between Full Screen and Top-Left */}
                <div
                    style={{ transition: 'all 1.2s cubic-bezier(0.4, 0, 0.1, 1)', background: 'var(--tp-bg-main)' }}
                    className={`absolute border-b border-zinc-200 z-10
                    ${viewMode === 'overview'
                            ? 'inset-0'
                            : 'top-0 left-0 w-[20%] h-[40%]'
                        }`}
                >
                    {/* We need to render the DigitalTwinNavigator directly for props to work */}
                    <SuspendedDigitalTwin
                        viewMode={viewMode}
                        isolatedMeshName={selectedAsset}
                        onExpandClick={(meshName, isAnomaly) => {
                            setSelectedAsset(meshName)
                            setViewMode('details')
                            if (isAnomaly) {
                                setAutoTriggerAnomaly(true)
                            }
                        }}
                        onCreateWorkOrder={(meshName) => {
                            // Demo Simulation: Pre-fill context
                            setPendingCreateWorkOrder({
                                equipmentName: meshName,
                                meshName,
                                title: `${meshName} - Anomaly Check`,
                                description: 'Investigate vibration deviation similar to Munich incident. Check bearing assembly for signs of wear or misalignment.',
                                priority: 'high',
                                facility: 'Dubai Plant',
                                tags: ['Predictive', 'AI-Detected']
                            })
                            setActiveModule('opshub')
                        }}
                    />
                </div>

                {/* Asset Tree - Slides up after 3D shrinks */}
                <div
                    style={{ transition: 'all 1s cubic-bezier(0.4, 0, 0.1, 1) 0.3s' }}
                    className={`absolute bg-zinc-900 border-r border-zinc-800
                    ${viewMode === 'details'
                            ? 'left-0 top-[40%] w-[20%] h-[60%] opacity-100'
                            : 'left-0 top-[100%] w-[20%] h-0 opacity-0'
                        }`}
                >
                    <AssetTree
                        selectedAssetId={selectedAsset || undefined}
                        onSelect={(id) => {
                            setSelectedAsset(id)
                            // If user clicks tree, trigger isolation logic too
                        }}
                    />
                </div>

                {/* Right Column - Expands from right after 3D shrinks */}
                <div
                    style={{ transition: 'all 1s cubic-bezier(0.4, 0, 0.1, 1) 0.15s' }}
                    className={`absolute right-0 top-0 h-full flex flex-col bg-zinc-900
                    ${viewMode === 'details'
                            ? 'w-[80%] opacity-100'
                            : 'w-0 opacity-0 overflow-hidden'
                        }`}
                >
                    {/* Top Bar — Machine summary + action buttons */}
                    <div className="h-[15%] min-h-0 border-b border-zinc-800">
                        <MachineSummaryBar
                            onCreateWorkOrder={() => {
                                if (selectedAsset) {
                                    setPendingCreateWorkOrder({ equipmentName: selectedAsset, meshName: selectedAsset })
                                }
                                setActiveModule('opshub')
                            }}
                        />
                    </div>

                    {/* Timeline Container (85%) */}
                    <div className="h-[85%] min-h-0 relative bg-zinc-900 p-0 overflow-hidden">
                        {/* @ts-ignore - Dynamic import props issue */}
                        <MultiLayerTimeline
                            autoTriggerAnomaly={autoTriggerAnomaly}
                            onAnomalyTriggered={() => setAutoTriggerAnomaly(false)}
                        />
                    </div>
                </div>

                {/* ── OVERVIEW PANELS (overlay on DT, Fade out in Details Mode) ──── */}
                {isOverview && viewMode === 'overview' && (
                    <div className={s.rightPanel}>
                        <RightPanel
                            onNavigate={handleModuleChange}
                            activeAlerts={activeAlerts}
                        />
                    </div>
                )}

                {/* Back Button for Details Mode */}
                {viewMode === 'details' && (
                    <button
                        onClick={() => {
                            setViewMode('overview')
                            setSelectedAsset(null)
                        }}
                        className="absolute top-2 right-2 z-50 bg-zinc-800 hover:bg-zinc-700 text-white p-2 rounded shadow border border-zinc-600"
                    >
                        <Minimize2 size={16} />
                    </button>
                )}

                {/* ── OTHER MODULES (lazy mount, visibility toggle) ───── */}
                {mounted.has('timeline') && (
                    <div className={`absolute inset-0 overflow-auto bg-white dark:bg-zinc-950 ${activeModule === 'timeline' ? 'z-30' : 'z-0 invisible pointer-events-none'}`}>
                        <MultiLayerTimeline />
                    </div>
                )}
                {mounted.has('workflows') && (
                    <div className={`absolute inset-0 ${activeModule === 'workflows' ? 'z-30' : 'z-0 invisible pointer-events-none'}`}>
                        <WorkflowBuilder className="h-full" />
                    </div>
                )}
                {mounted.has('opshub') && (
                    <div className={`absolute inset-0 overflow-hidden ${activeModule === 'opshub' ? 'z-30' : 'z-0 invisible pointer-events-none'}`}>
                        <OpshubLayout />
                    </div>
                )}
            </main>

        </div>
    )
}

// Helper to load DigitalTwinNavigator
// We need to import it. Since it was in playground, let's update the imports.

function SuspendedDigitalTwin({
    viewMode,
    isolatedMeshName,
    onExpandClick,
    onCreateWorkOrder,
}: {
    viewMode: 'overview' | 'details'
    isolatedMeshName: string | null
    onExpandClick: (name: string, isAnomaly?: boolean) => void
    onCreateWorkOrder: (name: string) => void
}) {
    return (
        <DigitalTwinNavigator
            modelUrl="/models/factory.glb"
            presets={CAMERA_PRESETS}
            initialPreset="overview"
            devMode={false}
            environment="warehouse"
            autoTour={false}
            showHotspots={viewMode === 'overview'}
            className="w-full h-full"
            viewMode={viewMode}
            isolatedMeshName={isolatedMeshName}
            onExpandClick={onExpandClick}
            onCreateWorkOrder={onCreateWorkOrder}
        />
    )
}

// ─── NAVBAR COMPONENT ──────────────────────────────────────────────────────
import s from './overview.module.css'

function Navbar({
    activeModule,
    onModuleChange,
    locations,
    activeLocation,
    onLocationChange,
}: {
    activeModule: TfoModule
    onModuleChange: (mod: TfoModule) => void
    locations: FacilityLocation[]
    activeLocation: FacilityLocation
    onLocationChange: (id: string) => void
}) {
    return (
        <header className={s.navbar}>
            {/* ── Logo + Brand ── */}
            <div className={s.navLogo}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/light.png"
                    alt="Tripolar"
                    className={s.navLogoImg}
                />
                <span className={s.navBrand}>Tripolar</span>
            </div>

            {/* ── Separator ── */}
            <div className={s.navSep} />

            {/* ── Operations label ── */}
            <div className={s.navOps}>
                <LayoutGrid size={14} />
                <span className={s.navOpsText}>operations</span>
            </div>

            {/* ── Module Icons Pill ── */}
            <div className={s.modulePill}>
                {MODULES.map((mod) => (
                    <button
                        key={mod.id}
                        onClick={() => onModuleChange(mod.id)}
                        title={mod.label}
                        className={activeModule === mod.id ? s.moduleBtnActive : s.moduleBtn}
                    >
                        {mod.icon}
                    </button>
                ))}
            </div>

            {/* ── Search Button ── */}
            <button className={s.searchBtn}>
                <Search size={13} />
                <span>Search</span>
            </button>

            {/* ── Spacer ── */}
            <div className={s.spacer} />

            {/* ── Factory Selector Pill ── */}
            <LocationSelector
                locations={locations}
                activeLocation={activeLocation}
                onSelect={onLocationChange}
            />

            {/* ── User Section ── */}
            <div className={s.userSection}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/light.png"
                    alt="User"
                    className={s.userAvatar}
                />
                <span className={s.userName}>User</span>
                <ChevronDown size={12} className={s.userChevron} />
            </div>
        </header>
    )
}

// ─── OPERATIONS DROPDOWN ───────────────────────────────────────────────────
function OperationsDropdown({
    onSelect,
}: {
    onSelect: (mod: TfoModule) => void
}) {
    return (
        <div className="relative group">
            <button
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
                <LayoutGrid size={13} />
                Operations
                <ChevronDown size={12} />
            </button>

            {/* Dropdown panel */}
            <div
                className="absolute left-0 top-full mt-1 z-50 w-72 rounded-lg border p-3 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity bg-white border-slate-200"
            >
                <p className="text-[10px] uppercase tracking-widest font-semibold mb-2 text-slate-400">
                    All Operations
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                    {MODULES.map((mod) => (
                        <button
                            key={mod.id}
                            onClick={() => onSelect(mod.id)}
                            className="flex items-center gap-2 rounded-md px-2.5 py-2 text-left transition hover:bg-slate-50 text-slate-700"
                        >
                            <span className="flex h-7 w-7 items-center justify-center rounded bg-slate-100">
                                {mod.icon}
                            </span>
                            <div>
                                <div className="text-xs font-medium">{mod.label}</div>
                                <div className="text-[10px] text-slate-400">
                                    {mod.description}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ─── LOCATION SELECTOR (AWS Region-style) ────────────────────────────────
function LocationSelector({
    locations,
    activeLocation,
    onSelect,
}: {
    locations: FacilityLocation[]
    activeLocation: FacilityLocation
    onSelect: (id: string) => void
}) {
    return (
        <div className="relative group">
            <button className={s.factoryPill}>
                <MapPin size={14} />
                <span style={{ maxWidth: 160 }} className="truncate">{activeLocation.name}</span>
                <ChevronDown size={13} />
            </button>

            <div
                className="absolute left-0 top-full mt-1 z-50 w-80 rounded-lg border p-3 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity bg-white border-slate-200"
            >
                <p className="text-[10px] uppercase tracking-widest font-semibold mb-2 text-slate-400">
                    Select Facility
                </p>
                <div className="space-y-1">
                    {locations.map((loc) => (
                        <button
                            key={loc.id}
                            onClick={() => onSelect(loc.id)}
                            className={`w-full flex items-center gap-3 rounded-md px-2.5 py-2 text-left transition ${loc.id === activeLocation.id
                                ? 'bg-blue-50 border border-blue-200'
                                : 'hover:bg-slate-50 border border-transparent'
                                }`}
                        >
                            <MapPin size={14} className={
                                loc.id === activeLocation.id
                                    ? 'text-blue-500'
                                    : 'text-slate-400'
                            } />
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium truncate text-slate-800">
                                    {loc.name}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                    {loc.region} · {loc.type}
                                </div>
                            </div>
                            {loc.id === activeLocation.id && (
                                <span className="text-[10px] font-medium text-blue-600">
                                    Active
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ─── RIGHT PANEL ───────────────────────────────────────────────────────────
function RightPanel({
    onNavigate,
    activeAlerts,
}: {
    onNavigate: (mod: TfoModule) => void
    activeAlerts: { id: string; zone: string; sensor: string; severity: string; message: string; timeAgo: string }[]
}) {
    return (
        <>
            {/* ─── Card 1: Production Efficiency (Stacked Area Chart) ──── */}
            <div className={s.card}>
                <div className={s.cardTitle}>Production Efficiency (Last 7d)</div>
                <div className={s.chartContainer}>
                    <svg viewBox="0 0 360 135" width="100%" preserveAspectRatio="xMidYMid meet">
                        <g transform="scale(1, 0.65)">
                            {/* Grid lines */}
                            {[0, 20, 40, 60, 80, 100].map((v) => {
                                const y = 160 - (v / 100) * 140
                                return (
                                    <g key={v}>
                                        <line x1="40" y1={y} x2="350" y2={y} stroke="#828898" strokeWidth="0.5" strokeDasharray="2,3" />
                                        <text x="35" y={y + 3} textAnchor="end" fontSize="8" fill="#828898">{v}</text>
                                    </g>
                                )
                            })}
                            {/* Area layers — lower (light cyan) */}
                            <path
                                d="M40,130 C80,125 120,120 160,128 C200,136 240,108 280,100 C300,96 330,88 350,85
                               L350,160 L40,160 Z"
                                fill="#66DBFF" opacity="0.7"
                            />
                            {/* Area layers — upper (darker blue) */}
                            <path
                                d="M40,115 C80,100 120,108 160,95 C200,82 240,60 280,48 C300,42 330,35 350,30
                               L350,160 L40,160 Z"
                                fill="#0B8FD9" opacity="0.6"
                            />
                            {/* Stroke lines */}
                            <path
                                d="M40,130 C80,125 120,120 160,128 C200,136 240,108 280,100 C300,96 330,88 350,85"
                                fill="none" stroke="#56B5DA" strokeWidth="1.5"
                            />
                            <path
                                d="M40,115 C80,100 120,108 160,95 C200,82 240,60 280,48 C300,42 330,35 350,30"
                                fill="none" stroke="#3992C4" strokeWidth="1.5"
                            />
                            {/* X-axis labels */}
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                                <text key={day} x={40 + i * 51.5} y={175} textAnchor="middle" fontSize="8" fill="#828898">{day}</text>
                            ))}
                        </g>
                    </svg>
                </div>
            </div>

            {/* ─── Card 2: Energy Consumption (Grouped Bar Chart) ──── */}
            <div className={s.card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div className={s.cardTitle} style={{ marginBottom: 0 }}>Energy Consumption</div>
                    <div className={s.chartLegend} style={{ marginBottom: 0 }}>
                        <span className={s.legendDot}><span className={s.legendDotCircle} style={{ background: '#99E3BE' }} /> D1</span>
                        <span className={s.legendDot}><span className={s.legendDotCircle} style={{ background: '#1BC0C4' }} /> D2</span>
                        <span className={s.legendDot}><span className={s.legendDotCircle} style={{ background: '#9ED0F1' }} /> D3</span>
                    </div>
                </div>
                <div className={s.chartContainer}>
                    <svg viewBox="0 0 360 115" width="100%" preserveAspectRatio="xMidYMid meet">
                        <g transform="scale(1, 0.65)">
                            {/* Grid lines */}
                            {[0, 50, 100, 150, 200].map((v) => {
                                const y = 130 - (v / 200) * 110
                                return (
                                    <g key={v}>
                                        <line x1="40" y1={y} x2="350" y2={y} stroke="#828898" strokeWidth="0.5" strokeDasharray="2,3" />
                                        <text x="35" y={y + 3} textAnchor="end" fontSize="8" fill="#828898">{v}</text>
                                    </g>
                                )
                            })}
                            {/* Bars for each day */}
                            {[
                                { day: 'Mon', d1: 140, d2: 100, d3: 120 },
                                { day: 'Tue', d1: 80, d2: 110, d3: 90 },
                                { day: 'Wed', d1: 120, d2: 95, d3: 85 },
                                { day: 'Thu', d1: 180, d2: 120, d3: 110 },
                                { day: 'Fri', d1: 160, d2: 170, d3: 130 },
                                { day: 'Sat', d1: 40, d2: 50, d3: 35 },
                                { day: 'Sun', d1: 175, d2: 90, d3: 60 },
                            ].map((item, i) => {
                                const gx = 55 + i * 44
                                const barW = 10
                                const maxH = 110
                                return (
                                    <g key={item.day}>
                                        <rect x={gx} y={130 - (item.d1 / 200) * maxH} width={barW} height={(item.d1 / 200) * maxH} rx={2} fill="#99E3BE" />
                                        <rect x={gx + barW + 2} y={130 - (item.d2 / 200) * maxH} width={barW} height={(item.d2 / 200) * maxH} rx={2} fill="#1BC0C4" />
                                        <rect x={gx + (barW + 2) * 2} y={130 - (item.d3 / 200) * maxH} width={barW} height={(item.d3 / 200) * maxH} rx={2} fill="#9ED0F1" />
                                        <text x={gx + 17} y={143} textAnchor="middle" fontSize="8" fill="#828898">{item.day}</text>
                                    </g>
                                )
                            })}
                        </g>
                    </svg>
                </div>
            </div>

            {/* ─── Card 3: Active Alerts ──── */}
            <div className={s.card} style={{ height: 140, display: 'flex', flexDirection: 'column', paddingBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className={s.cardTitle} style={{ marginBottom: 0 }}>
                        <span style={{ verticalAlign: 'middle' }}>⚠️</span> Active Alerts
                    </div>
                </div>
                <div style={{ marginTop: 4, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
                    {activeAlerts.map((alert, idx) => (
                        <button
                            key={alert.id}
                            onClick={() => onNavigate('timeline')}
                            className={s.alertItem}
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '2px 0',
                                borderTop: idx > 0 ? '1px solid rgba(152,166,212,0.2)' : 'none'
                            }}
                        >
                            <div className={`${s.alertIcon} ${alert.severity === 'critical' ? s.alertIconCritical : s.alertIconWarning}`} style={{ width: 24, height: 24 }}>
                                <AlertTriangle size={12} />
                            </div>
                            <div className={s.alertText}>
                                <div className={s.alertTitle} style={{ fontSize: 10, lineHeight: '1.2' }}>{alert.zone} — {alert.sensor}</div>
                                <div className={s.alertDesc} style={{ fontSize: 9, lineHeight: '1.2', marginTop: 0 }}>{alert.message}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* ─── Card 4: Factory Status ──── */}
            <div className={s.card}>
                <div className={s.cardTitle}>Factory Status</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                        { label: 'Robot Arms', status: 'green', value: '18/20 Online' },
                        { label: 'Conveyor System', status: 'red', value: 'Maintenance' },
                        { label: 'Paint Booth', status: 'green', value: 'Operational' },
                    ].map((item) => (
                        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className={`${s.statusDot} ${item.status === 'green' ? s.statusGreen : s.statusRed}`} />
                            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--tp-text-heading)', flex: 1 }}>{item.label}</span>
                            <span style={{ fontSize: 10, color: 'var(--tp-text-muted)' }}>{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

// ─── FOOTER ────────────────────────────────────────────────────────────────
function Footer({ facilityMetrics }: { facilityMetrics: { label: string; value: string; unit?: string }[] }) {
    return (
        <footer
            className="flex-shrink-0 flex items-center justify-between px-4 h-8 text-[10px] border-t z-50 border-slate-200 bg-white text-slate-400"
        >
            <div className="flex items-center gap-4">
                {facilityMetrics.slice(0, 4).map((m) => (
                    <span key={m.label} className="flex items-center gap-1">
                        <span className="font-semibold">{m.label}:</span> {m.value}{m.unit ? ` ${m.unit}` : ''}
                    </span>
                ))}
            </div>
            <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>All systems operational</span>
                <span className="mx-2 opacity-50">|</span>
                <span>TFO v0.1.0</span>
            </div>
        </footer>
    )
}
