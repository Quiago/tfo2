/** TFO — Tripolar Facility Operations types */

export type TfoModule =
  | 'overview'
  | 'digital-twin'
  | 'timeline'
  | 'workflows'
  | 'opshub'

export interface TfoModuleMeta {
  id: TfoModule
  label: string
  description: string
  icon: string // lucide icon name
}

export interface FacilityMetric {
  label: string
  value: string
  unit?: string
  status: 'normal' | 'warning' | 'critical'
}

export interface ActiveAlert {
  id: string
  zone: string
  sensor: string
  severity: 'warning' | 'critical'
  message: string
  timeAgo: string // static display label e.g. "2m ago" — avoids Date.now() hydration issues
}

export interface RecentWorkflow {
  id: string
  name: string
  status: 'running' | 'completed' | 'failed'
  timeAgo: string // static display label
}
