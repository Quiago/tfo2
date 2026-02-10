'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  Box,
  ChevronDown,
  LayoutDashboard,
  LayoutGrid,
  MapPin,
  Maximize2,
  Minimize2,
  Moon,
  Search,
  Settings,
  Sun,
  Workflow,
} from 'lucide-react'
import { useTfoStore, type FacilityLocation } from '@/lib/store/tfo-store'
import type { TfoModule } from '@/lib/types/tfo'

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
  { id: 'digital-twin', label: 'Digital Twin', icon: <Box size={16} />, description: '3D facility model' },
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
  const { activeModule, setActiveModule, darkMode, toggleDarkMode, facilityMetrics, activeAlerts, recentWorkflows, locations, activeLocationId, setActiveLocation } =
    useTfoStore()

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

  // Digital Twin iframe loaded state
  const [dtLoaded, setDtLoaded] = useState(false)

  const isOverview = activeModule === 'overview'
  const isFullDT = activeModule === 'digital-twin'

  return (
    <div className={`flex h-screen flex-col ${darkMode ? 'dark bg-zinc-950 text-zinc-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* ── NAVBAR ───────────────────────────────────────────────── */}
      <Navbar
        activeModule={activeModule}
        onModuleChange={handleModuleChange}
        darkMode={darkMode}
        onToggleDark={toggleDarkMode}
        locations={locations}
        activeLocation={activeLocation}
        onLocationChange={setActiveLocation}
      />

      {/* ── BODY ─────────────────────────────────────────────────── */}
      <main className="relative flex-1 overflow-hidden">

        {/* ── SINGLE DIGITAL TWIN IFRAME — always alive, repositioned via CSS ── */}
        <div
          className={`absolute bg-zinc-950 transition-all duration-300 ease-in-out ${
            isFullDT
              ? 'inset-0 z-30'
              : isOverview
                ? 'top-0 left-0 w-[70%] bottom-[20%] z-10'
                : 'top-0 left-0 w-1 h-1'
          }`}
        >
          {!dtLoaded && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-cyan-500" />
                <span className="text-xs text-zinc-500">Loading 3D Scene...</span>
              </div>
            </div>
          )}
          <iframe
            src="/playground/digital-twin"
            className={`w-full h-full border-0 transition-opacity duration-500 ${dtLoaded ? 'opacity-100' : 'opacity-0'}`}
            title="Digital Twin"
            onLoad={() => setDtLoaded(true)}
          />
        </div>

        {/* ── OVERVIEW PANELS (over and around the DT iframe) ──── */}
        {isOverview && (
          <>
            {/* View Full button — floats over the DT area */}
            <button
              onClick={() => handleModuleChange('digital-twin')}
              className="absolute top-3 right-[31%] z-20 flex items-center gap-1.5 rounded-md bg-zinc-900/80 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 border border-zinc-700 transition"
            >
              <Maximize2 size={13} />
              View Full
            </button>
            {/* Zone label */}
            <div className="absolute bottom-[21%] left-3 z-20 flex items-center gap-2 rounded bg-zinc-900/80 backdrop-blur-sm px-2.5 py-1 text-[10px] text-zinc-400 pointer-events-none">
              <Box size={12} className="text-cyan-500" />
              Digital Twin — {activeLocation.name}
            </div>
            {/* Bottom Analytics — 20% height, 70% width */}
            <div className={`absolute bottom-0 left-0 w-[70%] h-[20%] z-20 border-t border-r ${darkMode ? 'border-zinc-800' : 'border-slate-200'}`}>
              <BottomAnalytics darkMode={darkMode} onNavigate={handleModuleChange} />
            </div>
            {/* Right Panel — 30% width */}
            <div className={`absolute top-0 right-0 w-[30%] h-full z-20 overflow-y-auto p-4 space-y-4 ${darkMode ? 'bg-zinc-950' : 'bg-slate-50'}`}>
              <RightPanel
                darkMode={darkMode}
                onNavigate={handleModuleChange}
                facilityMetrics={facilityMetrics}
                activeAlerts={activeAlerts}
                recentWorkflows={recentWorkflows}
              />
            </div>
          </>
        )}

        {/* ── Full DT back button ─────────────────────────────────── */}
        {isFullDT && (
          <button
            onClick={() => handleModuleChange('overview')}
            className="absolute top-3 right-3 z-40 flex items-center gap-1.5 rounded-md bg-zinc-900/80 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 border border-zinc-700 transition"
          >
            <Minimize2 size={13} />
            Back to Overview
          </button>
        )}

        {/* ── OTHER MODULES (lazy mount, visibility toggle) ───── */}
        {mounted.has('timeline') && (
          <div className={`absolute inset-0 overflow-auto bg-white dark:bg-zinc-950 ${activeModule === 'timeline' ? 'z-20' : 'z-0 invisible pointer-events-none'}`}>
            <MultiLayerTimeline />
          </div>
        )}
        {mounted.has('workflows') && (
          <div className={`absolute inset-0 ${activeModule === 'workflows' ? 'z-20' : 'z-0 invisible pointer-events-none'}`}>
            <WorkflowBuilder className="h-full" />
          </div>
        )}
        {mounted.has('opshub') && (
          <div className={`absolute inset-0 overflow-hidden ${activeModule === 'opshub' ? 'z-20' : 'z-0 invisible pointer-events-none'}`}>
            <OpshubLayout />
          </div>
        )}
      </main>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <Footer darkMode={darkMode} facilityMetrics={facilityMetrics} />
    </div>
  )
}

// ─── NAVBAR COMPONENT ──────────────────────────────────────────────────────
function Navbar({
  activeModule,
  onModuleChange,
  darkMode,
  onToggleDark,
  locations,
  activeLocation,
  onLocationChange,
}: {
  activeModule: TfoModule
  onModuleChange: (mod: TfoModule) => void
  darkMode: boolean
  onToggleDark: () => void
  locations: FacilityLocation[]
  activeLocation: FacilityLocation
  onLocationChange: (id: string) => void
}) {
  return (
    <header
      className={`flex-shrink-0 border-b ${
        darkMode
          ? 'border-zinc-800 bg-zinc-900'
          : 'border-slate-200 bg-white'
      }`}
    >
      {/* Top bar */}
      <div className="flex h-12 items-center gap-4 px-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mr-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={darkMode ? '/dark.png' : '/light.png'}
            alt="Tripolar"
            width={28}
            height={28}
            className="object-contain"
          />
          <span className={`text-sm font-semibold tracking-tight ${darkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
            TFO
          </span>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${darkMode ? 'bg-cyan-500/10 text-cyan-400' : 'bg-blue-50 text-blue-600'}`}>
            Facility Ops
          </span>
        </div>

        {/* Operations dropdown */}
        <OperationsDropdown darkMode={darkMode} onSelect={onModuleChange} />

        {/* Location selector (AWS region-style) */}
        <LocationSelector
          darkMode={darkMode}
          locations={locations}
          activeLocation={activeLocation}
          onSelect={onLocationChange}
        />

        {/* Search */}
        <div className={`hidden md:flex items-center gap-2 rounded-md px-3 py-1.5 text-xs flex-1 max-w-xs ${
          darkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-500'
        }`}>
          <Search size={13} />
          <span>Search zones, machines, workflows...</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right controls */}
        <button
          onClick={onToggleDark}
          className={`p-1.5 rounded-md transition ${darkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-500'}`}
        >
          {darkMode ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <button className={`p-1.5 rounded-md transition ${darkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-500'}`}>
          <Settings size={15} />
        </button>
        <div className={`flex items-center gap-2 pl-3 ml-1 border-l ${darkMode ? 'border-zinc-700' : 'border-slate-200'}`}>
          <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${darkMode ? 'bg-cyan-500/20 text-cyan-400' : 'bg-blue-100 text-blue-700'}`}>
            OP
          </div>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="flex items-center gap-0.5 px-4 h-9">
        {MODULES.map((mod) => (
          <button
            key={mod.id}
            onClick={() => onModuleChange(mod.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t text-xs font-medium transition ${
              activeModule === mod.id
                ? darkMode
                  ? 'bg-zinc-950 text-cyan-400 border-b-2 border-cyan-500'
                  : 'bg-slate-50 text-blue-700 border-b-2 border-blue-600'
                : darkMode
                  ? 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {mod.icon}
            {mod.label}
          </button>
        ))}
      </div>
    </header>
  )
}

// ─── OPERATIONS DROPDOWN ───────────────────────────────────────────────────
function OperationsDropdown({
  darkMode,
  onSelect,
}: {
  darkMode: boolean
  onSelect: (mod: TfoModule) => void
}) {
  return (
    <div className="relative group">
      <button
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition ${
          darkMode
            ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`}
      >
        <LayoutGrid size={13} />
        Operations
        <ChevronDown size={12} />
      </button>

      {/* Dropdown panel */}
      <div
        className={`absolute left-0 top-full mt-1 z-50 w-72 rounded-lg border p-3 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity ${
          darkMode
            ? 'bg-zinc-900 border-zinc-700'
            : 'bg-white border-slate-200'
        }`}
      >
        <p className={`text-[10px] uppercase tracking-widest font-semibold mb-2 ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
          All Operations
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {MODULES.map((mod) => (
            <button
              key={mod.id}
              onClick={() => onSelect(mod.id)}
              className={`flex items-center gap-2 rounded-md px-2.5 py-2 text-left transition ${
                darkMode
                  ? 'hover:bg-zinc-800 text-zinc-300'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded ${
                darkMode ? 'bg-zinc-800' : 'bg-slate-100'
              }`}>
                {mod.icon}
              </span>
              <div>
                <div className="text-xs font-medium">{mod.label}</div>
                <div className={`text-[10px] ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
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
  darkMode,
  locations,
  activeLocation,
  onSelect,
}: {
  darkMode: boolean
  locations: FacilityLocation[]
  activeLocation: FacilityLocation
  onSelect: (id: string) => void
}) {
  return (
    <div className="relative group">
      <button
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition ${
          darkMode
            ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`}
      >
        <MapPin size={13} className={darkMode ? 'text-cyan-400' : 'text-blue-500'} />
        <span className="max-w-[140px] truncate">{activeLocation.name}</span>
        <span className={`text-[10px] ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
          {activeLocation.region}
        </span>
        <ChevronDown size={12} />
      </button>

      <div
        className={`absolute left-0 top-full mt-1 z-50 w-80 rounded-lg border p-3 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity ${
          darkMode
            ? 'bg-zinc-900 border-zinc-700'
            : 'bg-white border-slate-200'
        }`}
      >
        <p className={`text-[10px] uppercase tracking-widest font-semibold mb-2 ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
          Select Facility
        </p>
        <div className="space-y-1">
          {locations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => onSelect(loc.id)}
              className={`w-full flex items-center gap-3 rounded-md px-2.5 py-2 text-left transition ${
                loc.id === activeLocation.id
                  ? darkMode
                    ? 'bg-cyan-500/10 border border-cyan-500/30'
                    : 'bg-blue-50 border border-blue-200'
                  : darkMode
                    ? 'hover:bg-zinc-800 border border-transparent'
                    : 'hover:bg-slate-50 border border-transparent'
              }`}
            >
              <MapPin size={14} className={
                loc.id === activeLocation.id
                  ? darkMode ? 'text-cyan-400' : 'text-blue-500'
                  : darkMode ? 'text-zinc-500' : 'text-slate-400'
              } />
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-medium truncate ${darkMode ? 'text-zinc-200' : 'text-slate-800'}`}>
                  {loc.name}
                </div>
                <div className={`text-[10px] ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                  {loc.region} · {loc.type}
                </div>
              </div>
              {loc.id === activeLocation.id && (
                <span className={`text-[10px] font-medium ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>
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
  darkMode,
  onNavigate,
  facilityMetrics,
  activeAlerts,
  recentWorkflows,
}: {
  darkMode: boolean
  onNavigate: (mod: TfoModule) => void
  facilityMetrics: { label: string; value: string; unit?: string; status: string }[]
  activeAlerts: { id: string; zone: string; sensor: string; severity: string; message: string; timeAgo: string }[]
  recentWorkflows: { id: string; name: string; status: string; timeAgo: string }[]
}) {
  const cardBg = darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
  const mutedText = darkMode ? 'text-zinc-500' : 'text-slate-400'
  const bodyText = darkMode ? 'text-zinc-300' : 'text-slate-700'

  return (
    <>
      {/* Facility Status */}
      <div className={`rounded-lg border p-3 ${cardBg}`}>
        <h3 className={`text-[10px] uppercase tracking-widest font-semibold mb-3 ${mutedText}`}>
          Facility Status
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {facilityMetrics.map((m) => (
            <div key={m.label} className={`rounded-md p-2 ${darkMode ? 'bg-zinc-800/50' : 'bg-slate-50'}`}>
              <div className={`text-[10px] ${mutedText}`}>{m.label}</div>
              <div className="flex items-baseline gap-1">
                <span className={`text-lg font-bold ${
                  m.status === 'critical' ? 'text-red-400' : m.status === 'warning' ? 'text-amber-400' : darkMode ? 'text-zinc-100' : 'text-slate-900'
                }`}>
                  {m.value}
                </span>
                {m.unit && <span className={`text-[10px] ${mutedText}`}>{m.unit}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Alerts */}
      <div className={`rounded-lg border p-3 ${cardBg}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-[10px] uppercase tracking-widest font-semibold ${mutedText}`}>
            Active Alerts
          </h3>
          <span className="text-[10px] font-bold text-red-400">{activeAlerts.length}</span>
        </div>
        <div className="space-y-2">
          {activeAlerts.map((alert) => (
            <button
              key={alert.id}
              onClick={() => onNavigate('timeline')}
              className={`w-full text-left rounded-md p-2 transition ${
                darkMode ? 'hover:bg-zinc-800' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle
                  size={12}
                  className={alert.severity === 'critical' ? 'text-red-400' : 'text-amber-400'}
                />
                <span className={`text-xs font-medium ${bodyText}`}>{alert.zone} — {alert.sensor}</span>
              </div>
              <p className={`text-[10px] mt-0.5 pl-5 ${mutedText}`}>{alert.message}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Energy Consumption */}
      <div className={`rounded-lg border p-3 ${cardBg}`}>
        <h3 className={`text-[10px] uppercase tracking-widest font-semibold mb-3 ${mutedText}`}>
          Energy Consumption
        </h3>
        <div className="space-y-2">
          <EnergyBar label="Robot Arms" value={78} darkMode={darkMode} color="cyan" />
          <EnergyBar label="Conveyor System" value={62} darkMode={darkMode} color="blue" />
          <EnergyBar label="Paint Booth" value={45} darkMode={darkMode} color="emerald" />
          <EnergyBar label="Curing Oven" value={71} darkMode={darkMode} color="amber" />
        </div>
        <div className={`mt-3 pt-2 border-t flex justify-between ${darkMode ? 'border-zinc-800' : 'border-slate-200'}`}>
          <span className={`text-[10px] ${mutedText}`}>Plant Efficiency</span>
          <span className={`text-xs font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
            86.4%
          </span>
        </div>
      </div>

      {/* Recent Workflows */}
      <div className={`rounded-lg border p-3 ${cardBg}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-[10px] uppercase tracking-widest font-semibold ${mutedText}`}>
            Recent Workflows
          </h3>
          <button
            onClick={() => onNavigate('workflows')}
            className={`text-[10px] font-medium ${darkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-blue-600 hover:text-blue-700'}`}
          >
            View all
          </button>
        </div>
        <div className="space-y-1.5">
          {recentWorkflows.map((wf) => (
            <button
              key={wf.id}
              onClick={() => onNavigate('workflows')}
              className={`w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left transition ${
                darkMode ? 'hover:bg-zinc-800' : 'hover:bg-slate-50'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                  wf.status === 'running'
                    ? 'bg-cyan-400 animate-pulse'
                    : wf.status === 'completed'
                      ? 'bg-emerald-400'
                      : 'bg-red-400'
                }`}
              />
              <span className={`text-xs ${bodyText} flex-1 truncate`}>{wf.name}</span>
              <span className={`text-[10px] ${mutedText}`}>{wf.timeAgo}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Links to OpsHub */}
      <button
        onClick={() => onNavigate('opshub')}
        className={`w-full flex items-center gap-3 rounded-lg border p-3 transition ${
          darkMode
            ? 'border-zinc-800 bg-zinc-900 hover:border-cyan-800 text-zinc-300'
            : 'border-slate-200 bg-white hover:border-blue-300 text-slate-700'
        }`}
      >
        <LayoutDashboard size={16} className={darkMode ? 'text-cyan-500' : 'text-blue-500'} />
        <div className="text-left">
          <div className="text-xs font-medium">OpsHub</div>
          <div className={`text-[10px] ${mutedText}`}>Cross-facility ops & work orders</div>
        </div>
      </button>
    </>
  )
}

// ─── BOTTOM ANALYTICS ──────────────────────────────────────────────────────
function BottomAnalytics({
  darkMode,
  onNavigate,
}: {
  darkMode: boolean
  onNavigate: (mod: TfoModule) => void
}) {
  const mutedText = darkMode ? 'text-zinc-500' : 'text-slate-400'
  const bodyText = darkMode ? 'text-zinc-300' : 'text-slate-600'

  // Client-only random data — inside useEffect so it never runs on server
  const [sparkData, setSparkData] = useState<{
    vibration: number[]
    temperature: number[]
    pressure: number[]
  } | null>(null)

  useEffect(() => {
    const points = 20
    setSparkData({
      vibration: Array.from({ length: points }, (_, i) => 2 + Math.sin(i * 0.5) * 1.5 + Math.random() * 0.5),
      temperature: Array.from({ length: points }, (_, i) => 22 + Math.cos(i * 0.3) * 3 + Math.random()),
      pressure: Array.from({ length: points }, (_, i) => 6 + Math.sin(i * 0.4) * 1 + Math.random() * 0.3),
    })
  }, [])

  return (
    <div className={`h-full flex items-stretch gap-0 ${darkMode ? 'bg-zinc-950' : 'bg-slate-50'}`}>
      <button
        onClick={() => onNavigate('timeline')}
        className={`flex-1 p-3 border-r transition ${
          darkMode ? 'border-zinc-800 hover:bg-zinc-900/50' : 'border-slate-200 hover:bg-white'
        }`}
      >
        <div className={`text-[10px] uppercase tracking-widest font-semibold mb-1 ${mutedText}`}>Vibration</div>
        {sparkData && <MiniSparkline data={sparkData.vibration} color="#22d3ee" />}
        <div className={`text-xs font-bold mt-1 ${bodyText}`}>3.2 <span className={`text-[10px] font-normal ${mutedText}`}>mm/s</span></div>
      </button>

      <button
        onClick={() => onNavigate('timeline')}
        className={`flex-1 p-3 border-r transition ${
          darkMode ? 'border-zinc-800 hover:bg-zinc-900/50' : 'border-slate-200 hover:bg-white'
        }`}
      >
        <div className={`text-[10px] uppercase tracking-widest font-semibold mb-1 ${mutedText}`}>Temperature</div>
        {sparkData && <MiniSparkline data={sparkData.temperature} color="#f59e0b" />}
        <div className={`text-xs font-bold mt-1 ${bodyText}`}>23.8 <span className={`text-[10px] font-normal ${mutedText}`}>C</span></div>
      </button>

      <button
        onClick={() => onNavigate('timeline')}
        className={`flex-1 p-3 border-r transition ${
          darkMode ? 'border-zinc-800 hover:bg-zinc-900/50' : 'border-slate-200 hover:bg-white'
        }`}
      >
        <div className={`text-[10px] uppercase tracking-widest font-semibold mb-1 ${mutedText}`}>Pressure</div>
        {sparkData && <MiniSparkline data={sparkData.pressure} color="#a78bfa" />}
        <div className={`text-xs font-bold mt-1 ${bodyText}`}>6.3 <span className={`text-[10px] font-normal ${mutedText}`}>bar</span></div>
      </button>

      <div className={`flex-1 p-3 flex flex-col justify-center`}>
        <div className={`text-[10px] uppercase tracking-widest font-semibold mb-2 ${mutedText}`}>Recent Actions</div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className={`text-[10px] ${bodyText}`}>3 Robot calibrations done</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span className={`text-[10px] ${bodyText}`}>1 Vibration alert ack'd</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span className={`text-[10px] ${bodyText}`}>2 Maintenance workflows active</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── MINI SPARKLINE (SVG) ──────────────────────────────────────────────────
function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const h = 28
  const w = 120

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w
      const y = h - ((v - min) / range) * h
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── ENERGY BAR ────────────────────────────────────────────────────────────
function EnergyBar({ label, value, darkMode, color }: { label: string; value: number; darkMode: boolean; color: string }) {
  const colorMap: Record<string, string> = {
    cyan: 'bg-cyan-500',
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
  }

  return (
    <div>
      <div className="flex justify-between mb-0.5">
        <span className={`text-[10px] ${darkMode ? 'text-zinc-400' : 'text-slate-500'}`}>{label}</span>
        <span className={`text-[10px] font-medium ${darkMode ? 'text-zinc-300' : 'text-slate-700'}`}>{value}%</span>
      </div>
      <div className={`h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-zinc-800' : 'bg-slate-200'}`}>
        <div
          className={`h-full rounded-full ${colorMap[color] ?? 'bg-cyan-500'}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

// ─── FOOTER ────────────────────────────────────────────────────────────────
function Footer({ darkMode, facilityMetrics }: { darkMode: boolean; facilityMetrics: { label: string; value: string; unit?: string }[] }) {
  return (
    <footer
      className={`flex-shrink-0 flex items-center justify-between px-4 h-8 text-[10px] border-t ${
        darkMode
          ? 'border-zinc-800 bg-zinc-900 text-zinc-500'
          : 'border-slate-200 bg-white text-slate-400'
      }`}
    >
      <div className="flex items-center gap-4">
        {facilityMetrics.slice(0, 4).map((m) => (
          <span key={m.label} className="flex items-center gap-1">
            <span className="font-semibold">{m.label}:</span> {m.value}{m.unit ? ` ${m.unit}` : ''}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <span>All systems operational</span>
        <span className="mx-2">|</span>
        <span>TFO v0.1.0</span>
      </div>
    </footer>
  )
}
