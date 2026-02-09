import { create } from 'zustand'
import type { TfoModule, ActiveAlert, FacilityMetric, RecentWorkflow } from '@/lib/types/tfo'

export interface FacilityLocation {
  id: string
  name: string
  region: string
  type: string
}

const LOCATIONS: FacilityLocation[] = [
  { id: 'muc-01', name: 'Munich Paint Shop', region: 'EU-Central', type: 'Automotive' },
  { id: 'det-01', name: 'Detroit Assembly', region: 'US-East', type: 'Automotive' },
  { id: 'shz-01', name: 'Shenzhen Electronics', region: 'AP-East', type: 'Manufacturing' },
  { id: 'cdmx-01', name: 'CDMX Stamping Plant', region: 'LATAM', type: 'Automotive' },
]

// Per-location mock data
const FACILITY_DATA: Record<string, {
  metrics: FacilityMetric[]
  alerts: ActiveAlert[]
  workflows: RecentWorkflow[]
}> = {
  'muc-01': {
    metrics: [
      { label: 'OEE', value: '87.3', unit: '%', status: 'normal' },
      { label: 'Cycle Time', value: '42.1', unit: 's', status: 'normal' },
      { label: 'Robots Online', value: '18/20', status: 'warning' },
      { label: 'Paint Temp', value: '23.4', unit: 'C', status: 'normal' },
      { label: 'Booth Humidity', value: '55', unit: '%', status: 'normal' },
      { label: 'Uptime', value: '99.2', unit: '%', status: 'normal' },
    ],
    alerts: [
      { id: 'a1', zone: 'Cell B', sensor: 'Vibration', severity: 'critical', message: 'KUKA KR300-2 joint axis 3 — 8.7 mm/s RMS', timeAgo: '45s ago' },
      { id: 'a2', zone: 'Oven Zone', sensor: 'Temperature', severity: 'warning', message: 'Curing oven north section rising (192C / limit 195C)', timeAgo: '3m ago' },
      { id: 'a3', zone: 'Cell A', sensor: 'Flow Rate', severity: 'warning', message: 'Paint flow rate deviation on KR120 sealer nozzle', timeAgo: '8m ago' },
    ],
    workflows: [
      { id: 'w1', name: 'Robot Calibration — KR300', status: 'running', timeAgo: '2m ago' },
      { id: 'w2', name: 'Nozzle Purge Cycle', status: 'completed', timeAgo: '12m ago' },
      { id: 'w3', name: 'Vibration Diagnosis', status: 'completed', timeAgo: '25m ago' },
      { id: 'w4', name: 'Paint Batch Change', status: 'failed', timeAgo: '40m ago' },
    ],
  },
  'det-01': {
    metrics: [
      { label: 'OEE', value: '82.1', unit: '%', status: 'warning' },
      { label: 'Cycle Time', value: '38.7', unit: 's', status: 'normal' },
      { label: 'Robots Online', value: '24/24', status: 'normal' },
      { label: 'Line Temp', value: '21.8', unit: 'C', status: 'normal' },
      { label: 'Air Quality', value: '96', unit: 'AQI', status: 'normal' },
      { label: 'Uptime', value: '97.8', unit: '%', status: 'warning' },
    ],
    alerts: [
      { id: 'a1', zone: 'Weld Station 4', sensor: 'Current', severity: 'warning', message: 'Spot welder current drift +3.2% from baseline', timeAgo: '5m ago' },
    ],
    workflows: [
      { id: 'w1', name: 'Shift Handover Report', status: 'running', timeAgo: '1m ago' },
      { id: 'w2', name: 'Torque Validation — Line B', status: 'completed', timeAgo: '18m ago' },
    ],
  },
  'shz-01': {
    metrics: [
      { label: 'OEE', value: '91.5', unit: '%', status: 'normal' },
      { label: 'Cycle Time', value: '12.3', unit: 's', status: 'normal' },
      { label: 'SMT Lines', value: '8/8', status: 'normal' },
      { label: 'Clean Room', value: '22.0', unit: 'C', status: 'normal' },
      { label: 'Particle Count', value: '14', unit: '/m3', status: 'normal' },
      { label: 'Uptime', value: '99.9', unit: '%', status: 'normal' },
    ],
    alerts: [],
    workflows: [
      { id: 'w1', name: 'AOI Calibration', status: 'completed', timeAgo: '5m ago' },
      { id: 'w2', name: 'Solder Paste Check', status: 'completed', timeAgo: '30m ago' },
    ],
  },
  'cdmx-01': {
    metrics: [
      { label: 'OEE', value: '79.4', unit: '%', status: 'warning' },
      { label: 'Cycle Time', value: '55.2', unit: 's', status: 'warning' },
      { label: 'Presses Online', value: '5/6', status: 'warning' },
      { label: 'Hydraulic Temp', value: '68', unit: 'C', status: 'normal' },
      { label: 'Die Wear', value: '72', unit: '%', status: 'warning' },
      { label: 'Uptime', value: '94.1', unit: '%', status: 'warning' },
    ],
    alerts: [
      { id: 'a1', zone: 'Press 3', sensor: 'Pressure', severity: 'critical', message: 'Hydraulic pressure drop — possible seal failure', timeAgo: '1m ago' },
      { id: 'a2', zone: 'Press 5', sensor: 'Vibration', severity: 'warning', message: 'Abnormal vibration during stroke cycle', timeAgo: '15m ago' },
    ],
    workflows: [
      { id: 'w1', name: 'Emergency Seal Replacement', status: 'running', timeAgo: '1m ago' },
      { id: 'w2', name: 'Die Inspection', status: 'running', timeAgo: '10m ago' },
      { id: 'w3', name: 'Tonnage Calibration', status: 'completed', timeAgo: '1h ago' },
    ],
  },
}

interface TfoState {
  activeModule: TfoModule
  setActiveModule: (module: TfoModule) => void
  darkMode: boolean
  toggleDarkMode: () => void

  // Location
  locations: FacilityLocation[]
  activeLocationId: string
  setActiveLocation: (id: string) => void

  // Facility data (derived from active location)
  facilityMetrics: FacilityMetric[]
  activeAlerts: ActiveAlert[]
  recentWorkflows: RecentWorkflow[]
}

export const useTfoStore = create<TfoState>((set) => ({
  activeModule: 'overview',
  setActiveModule: (module) => set({ activeModule: module }),
  darkMode: true,
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

  locations: LOCATIONS,
  activeLocationId: 'muc-01',
  setActiveLocation: (id) => {
    const data = FACILITY_DATA[id]
    if (!data) return
    set({
      activeLocationId: id,
      facilityMetrics: data.metrics,
      activeAlerts: data.alerts,
      recentWorkflows: data.workflows,
    })
  },

  // Default: Munich Paint Shop
  facilityMetrics: FACILITY_DATA['muc-01'].metrics,
  activeAlerts: FACILITY_DATA['muc-01'].alerts,
  recentWorkflows: FACILITY_DATA['muc-01'].workflows,
}))
