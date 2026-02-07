export interface CameraPreset {
  id: string
  name: string
  description: string
  icon: string
  position: [number, number, number]
  target: [number, number, number]
  hotspotPosition?: [number, number, number]
  category?: 'overview' | 'equipment' | 'infrastructure' | 'monitoring'
}

export const CAMERA_PRESETS: CameraPreset[] = [
  {
    id: 'overview',
    name: 'Facility Overview',
    description: 'Bird\'s eye view of the entire datacenter facility',
    icon: '🏭',
    position: [0, 35, 55],
    target: [0, 0, 0],
    category: 'overview',
  },
  {
    id: 'server-room-a',
    name: 'Server Room A',
    description: 'Primary compute rack cluster — high-density GPU nodes',
    icon: '🖥️',
    position: [12, 5, 8],
    target: [12, 2, 3],
    hotspotPosition: [12, 3.5, 3],
    category: 'equipment',
  },
  {
    id: 'cooling-unit',
    name: 'Cooling Unit',
    description: 'Liquid cooling distribution system and heat exchangers',
    icon: '❄️',
    position: [-8, 4, 6],
    target: [-8, 1, 2],
    hotspotPosition: [-8, 2.5, 2],
    category: 'infrastructure',
  },
  {
    id: 'robot-cell-alpha',
    name: 'Robot Cell Alpha',
    description: 'Automated maintenance robot station for rack servicing',
    icon: '🤖',
    position: [3, 5, 6],
    target: [3, 2, 3],
    hotspotPosition: [3, 3.5, 3],
    category: 'equipment',
  },
  {
    id: 'power-distribution',
    name: 'Power Distribution',
    description: 'Main PDU and UPS systems — energy metering point',
    icon: '⚡',
    position: [-15, 6, -5],
    target: [-15, 2, -10],
    hotspotPosition: [-15, 3, -10],
    category: 'infrastructure',
  },
  {
    id: 'control-room',
    name: 'Control Room',
    description: 'Facility operations center with real-time dashboards',
    icon: '🎛️',
    position: [8, 4, -8],
    target: [8, 2, -12],
    hotspotPosition: [8, 3, -12],
    category: 'monitoring',
  },
  {
    id: 'loading-dock',
    name: 'Loading Dock',
    description: 'Equipment receiving and logistics staging area',
    icon: '🚛',
    position: [20, 5, 0],
    target: [20, 1, -5],
    hotspotPosition: [20, 2, -5],
    category: 'infrastructure',
  },
  {
    id: 'monitoring-station',
    name: 'Monitoring Station',
    description: 'Environmental sensors hub — temperature, humidity, airflow',
    icon: '📡',
    position: [0, 8, -15],
    target: [0, 3, -20],
    hotspotPosition: [0, 4, -20],
    category: 'monitoring',
  },
]
