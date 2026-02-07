'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { FactoryScene } from './FactoryScene'
import { NavigationPanel } from './NavigationPanel'
import { LoadingScreen } from './LoadingScreen'
import { InfoBar } from './InfoBar'
import { MachineInspector } from './MachineInspector'
import { getMachineInfo, type MachineInfo } from './machine-data'
import type { MeshClickEvent } from './FactoryModel'
import type { CameraPreset } from './camera-presets'
import type { CameraSystemHandle } from './CameraSystem'

interface DigitalTwinNavigatorProps {
  modelUrl: string
  presets: CameraPreset[]
  initialPreset?: string
  devMode?: boolean
  environment?: string
  autoTour?: boolean
  autoTourInterval?: number
  showHotspots?: boolean
  showNavPanel?: boolean
  className?: string
}

interface InspectorState {
  machine: MachineInfo
  meshName: string
}

export function DigitalTwinNavigator({
  modelUrl,
  presets,
  initialPreset = 'overview',
  devMode = false,
  environment = 'warehouse',
  autoTour = false,
  autoTourInterval = 5000,
  showHotspots = true,
  showNavPanel = true,
  className = 'w-full h-screen',
}: DigitalTwinNavigatorProps) {
  const [activeId, setActiveId] = useState<string | null>(initialPreset)
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([0, 0, 0])
  const [meshCount, setMeshCount] = useState(0)
  const [transitionLabel, setTransitionLabel] = useState<string | null>(null)
  const [inspector, setInspector] = useState<InspectorState | null>(null)
  const cameraRef = useRef<CameraSystemHandle>(null)
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inspectorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleActiveChange = useCallback(
    (id: string | null) => {
      setActiveId(id)
      if (id) {
        const preset = presets.find((p) => p.id === id)
        if (preset) {
          setTransitionLabel(preset.name)
          if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current)
          transitionTimeoutRef.current = setTimeout(() => setTransitionLabel(null), 2200)
        }
      }
    },
    [presets]
  )

  const handleNavSelect = useCallback(
    (id: string) => {
      const preset = presets.find((p) => p.id === id)
      if (preset) {
        cameraRef.current?.flyToPreset(preset)
      }
    },
    [presets]
  )

  const handleCameraMove = useCallback((position: [number, number, number]) => {
    setCameraPosition(position)
  }, [])

  const handleMeshCount = useCallback((count: number) => {
    setMeshCount(count)
  }, [])

  // Dynamic fly: mesh click → fly to the exact point + show inspector
  const handleMeshClick = useCallback((event: MeshClickEvent) => {
    const machine = getMachineInfo(event.meshName)

    // Fly to the exact click point on the mesh
    cameraRef.current?.flyToPoint(event.worldPosition, machine.name)

    // Show transition label
    setTransitionLabel(machine.name)
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current)
    transitionTimeoutRef.current = setTimeout(() => setTransitionLabel(null), 2200)

    // Show inspector after camera starts moving
    if (inspectorTimeoutRef.current) clearTimeout(inspectorTimeoutRef.current)
    inspectorTimeoutRef.current = setTimeout(() => {
      setInspector({ machine, meshName: event.meshName })
    }, 400)
  }, [])

  // Dynamic fly: canvas/ground click → fly to that point (no inspector)
  const handleCanvasClick = useCallback((point: [number, number, number]) => {
    setInspector(null)
    cameraRef.current?.flyToPoint(point)
  }, [])

  const handleInspectorClose = useCallback(() => {
    setInspector(null)
  }, [])

  const handleInspectorAction = useCallback(
    (action: 'monitoring' | 'workflows' | 'logs' | 'manual') => {
      // Placeholder — these will navigate to respective modules
      console.log(`[DigitalTwin] Action: ${action} for ${inspector?.machine.name}`)
    },
    [inspector]
  )

  // Close inspector on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && inspector) {
        setInspector(null)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [inspector])

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current)
      if (inspectorTimeoutRef.current) clearTimeout(inspectorTimeoutRef.current)
    }
  }, [])

  const activePresetName = presets.find((p) => p.id === activeId)?.name ?? null

  return (
    <div className={`relative ${className}`}>
      {/* Loading Screen */}
      <LoadingScreen />

      {/* 3D Canvas */}
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: 3, // ACESFilmicToneMapping
          toneMappingExposure: 1.2,
        }}
        camera={{ fov: 50, near: 0.1, far: 500 }}
        className="!absolute inset-0"
      >
        <FactoryScene
          modelUrl={modelUrl}
          presets={presets}
          activeId={activeId}
          onActiveChange={handleActiveChange}
          onCameraMove={handleCameraMove}
          onMeshCount={handleMeshCount}
          onMeshClick={handleMeshClick}
          onCanvasClick={handleCanvasClick}
          devMode={devMode}
          environment={environment}
          autoTour={autoTour}
          autoTourInterval={autoTourInterval}
          initialPreset={initialPreset}
          showHotspots={showHotspots}
          cameraRef={cameraRef}
        />
      </Canvas>

      {/* Transition Label */}
      {transitionLabel && (
        <div className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center">
          <div className="animate-fade-in-out">
            <h2 className="text-4xl font-bold text-white/80 tracking-wide drop-shadow-lg">
              {transitionLabel}
            </h2>
          </div>
        </div>
      )}

      {/* Navigation Panel Overlay */}
      {showNavPanel && (
        <NavigationPanel
          presets={presets}
          activeId={activeId}
          onSelect={handleNavSelect}
        />
      )}

      {/* Machine Inspector Popup */}
      {inspector && (
        <MachineInspector
          machine={inspector.machine}
          meshName={inspector.meshName}
          onClose={handleInspectorClose}
          onAction={handleInspectorAction}
        />
      )}

      {/* Info Bar */}
      <InfoBar
        activePresetName={activePresetName}
        cameraPosition={cameraPosition}
        meshCount={meshCount}
      />

      {/* Dev Mode Indicator */}
      {devMode && (
        <div className="fixed top-4 right-4 z-50 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
          <span className="text-xs font-mono text-yellow-400">
            DEV MODE — Double-click to capture coordinates
          </span>
        </div>
      )}

      {/* Inline keyframes for transition label */}
      <style jsx global>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(10px); }
          15% { opacity: 1; transform: translateY(0); }
          70% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        .animate-fade-in-out {
          animation: fadeInOut 2.2s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
