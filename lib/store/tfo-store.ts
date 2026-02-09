import { create } from 'zustand'
import type { TfoModule, ActiveAlert, FacilityMetric, RecentWorkflow } from '@/lib/types/tfo'

interface TfoState {
  activeModule: TfoModule
  setActiveModule: (module: TfoModule) => void
  darkMode: boolean
  toggleDarkMode: () => void

  // Facility overview mock data
  facilityMetrics: FacilityMetric[]
  activeAlerts: ActiveAlert[]
  recentWorkflows: RecentWorkflow[]
}

// All mock data uses static strings — no Date.now() to avoid hydration mismatch
export const useTfoStore = create<TfoState>((set) => ({
  activeModule: 'overview',
  setActiveModule: (module) => set({ activeModule: module }),
  darkMode: true,
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

  facilityMetrics: [
    { label: 'PUE', value: '1.28', status: 'normal' },
    { label: 'Power', value: '2.4', unit: 'MW', status: 'normal' },
    { label: 'Humidity', value: '52', unit: '%', status: 'normal' },
    { label: 'Temp Avg', value: '22.4', unit: 'C', status: 'normal' },
    { label: 'Devices Online', value: '47/51', status: 'warning' },
    { label: 'Uptime', value: '99.97', unit: '%', status: 'normal' },
  ],

  activeAlerts: [
    {
      id: 'a1',
      zone: 'Zone A',
      sensor: 'Temperature',
      severity: 'warning',
      message: 'Temp rising above threshold (38.2C)',
      timeAgo: '2m ago',
    },
    {
      id: 'a2',
      zone: 'Zone C',
      sensor: 'Vibration',
      severity: 'critical',
      message: 'Abnormal vibration on KUKA KR300-2 (8.7 mm/s)',
      timeAgo: '45s ago',
    },
    {
      id: 'a3',
      zone: 'Zone B',
      sensor: 'Pressure',
      severity: 'warning',
      message: 'Pressure drop detected (5.1 bar)',
      timeAgo: '5m ago',
    },
  ],

  recentWorkflows: [
    { id: 'w1', name: 'HVAC Adjustment', status: 'running', timeAgo: '1m ago' },
    { id: 'w2', name: 'Pump Inspection', status: 'completed', timeAgo: '10m ago' },
    { id: 'w3', name: 'Vibration Diagnosis', status: 'completed', timeAgo: '20m ago' },
    { id: 'w4', name: 'Rack Thermal Scan', status: 'failed', timeAgo: '30m ago' },
  ],
}))
