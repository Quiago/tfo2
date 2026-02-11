'use client'

import { Canvas } from '@react-three/fiber'
import { AlertTriangle } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { CameraSystemHandle } from './CameraSystem'
import type { AlertMeshInfo, MeshClickEvent } from './FactoryModel'
import { FactoryScene } from './FactoryScene'
import { InfoBar } from './InfoBar'
import { LoadingScreen } from './LoadingScreen'
import { MachineInspector, type AnomalyAlert } from './MachineInspector'
import { NavigationPanel } from './NavigationPanel'
import type { CameraPreset } from './camera-presets'
import { getMachineInfo, type MachineInfo } from './machine-data'

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
    viewMode?: 'full' | 'details' | 'overview'
    isolatedMeshName?: string | null
    onMeshClick?: (name: string) => void
}

interface InspectorState {
    machine: MachineInfo
    meshName: string
    anomaly?: AnomalyAlert | null
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
    viewMode = 'full',
    isolatedMeshName = null,
    onMeshClick,
}: DigitalTwinNavigatorProps) {
    const [activeId, setActiveId] = useState<string | null>(initialPreset)
    const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([0, 0, 0])
    const [meshCount, setMeshCount] = useState(0)
    const [transitionLabel, setTransitionLabel] = useState<string | null>(null)
    const [inspector, setInspector] = useState<InspectorState | null>(null)
    const [alertMeshPattern, setAlertMeshPattern] = useState<string | null>(null)
    const [alertActive, setAlertActive] = useState(false)
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

    // Dynamic fly: mesh click
    const handleMeshClick = useCallback((event: MeshClickEvent) => {
        const machine = getMachineInfo(event.meshName)

        // When parent handles the click (layout transition), skip camera fly —
        // the layout itself IS the animation. Only fly when no parent handler.
        if (onMeshClick) {
            onMeshClick(event.meshName)
        } else {
            cameraRef.current?.flyToPoint(event.worldPosition, machine.name)

            setTransitionLabel(machine.name)
            if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current)
            transitionTimeoutRef.current = setTimeout(() => setTransitionLabel(null), 2200)

            if (inspectorTimeoutRef.current) clearTimeout(inspectorTimeoutRef.current)
            if (viewMode !== 'details') {
                inspectorTimeoutRef.current = setTimeout(() => {
                    setInspector({ machine, meshName: event.meshName, anomaly: null })
                }, 400)
            }
        }
    }, [viewMode, onMeshClick])

    // Dynamic fly: canvas/ground click
    const handleCanvasClick = useCallback((point: [number, number, number]) => {
        setInspector(null)
        cameraRef.current?.flyToPoint(point)
    }, [])

    const handleInspectorClose = useCallback(() => {
        setInspector(null)
        setAlertMeshPattern(null)
        setAlertActive(false)
    }, [])

    const handleInspectorAction = useCallback(
        (action: 'monitoring' | 'workflows' | 'logs' | 'manual') => {
            console.log(`[DigitalTwin] Action: ${action} for ${inspector?.machine.name}`)
        },
        [inspector]
    )

    // Called by FactoryModel when alert meshes are found — fly to them
    const handleAlertMeshFound = useCallback((info: AlertMeshInfo) => {
        cameraRef.current?.flyToPoint(info.worldPosition, info.meshName)

        setTransitionLabel(`ALERT: ${info.meshName}`)
        if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current)
        transitionTimeoutRef.current = setTimeout(() => setTransitionLabel(null), 3000)

        // Show inspector with anomaly data after fly begins
        const machine = getMachineInfo(info.meshName)
        const anomaly: AnomalyAlert = {
            type: 'Excessive Vibration Detected',
            severity: 'critical',
            message: 'Vibration amplitude exceeds safe operating threshold on joint axis 3. Immediate inspection recommended — potential bearing wear or misalignment.',
            value: '13.5 mm/s RMS',
            threshold: '7.0 mm/s RMS',
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        }

        if (inspectorTimeoutRef.current) clearTimeout(inspectorTimeoutRef.current)
        inspectorTimeoutRef.current = setTimeout(() => {
            setInspector({ machine, meshName: info.meshName, anomaly })
        }, 600)
    }, [])

    // TRIGGER ALERT — simulate vibration anomaly on a KUKA robot
    const handleTriggerAlert = useCallback(() => {
        if (alertActive) {
            setAlertMeshPattern(null)
            setAlertActive(false)
            setInspector(null)
            return
        }

        setAlertActive(true)
        // Target one specific KUKA robot arm by exact Blender mesh names
        setAlertMeshPattern('kuka-kr120-right')
    }, [alertActive])

    // Close inspector on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setInspector(null)
                setAlertMeshPattern(null)
                setAlertActive(false)
            }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [])

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
                    toneMapping: 3,
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
                    alertMeshPattern={alertMeshPattern}
                    onAlertMeshFound={handleAlertMeshFound}
                    devMode={devMode}
                    environment={environment}
                    autoTour={autoTour}
                    autoTourInterval={autoTourInterval}
                    initialPreset={initialPreset}
                    showHotspots={showHotspots}
                    cameraRef={cameraRef}
                    isolatedMeshName={isolatedMeshName}
                />
            </Canvas>

            {/* Transition Label — use absolute within container in details mode */}
            {transitionLabel && (
                <div className={`${viewMode === 'details' ? 'absolute' : 'fixed'} inset-0 z-40 pointer-events-none flex items-center justify-center`}>
                    <div className="animate-fade-in-out">
                        <h2 className={`${viewMode === 'details' ? 'text-sm' : 'text-4xl'} font-bold tracking-wide drop-shadow-lg ${alertActive ? 'text-red-400/90' : 'text-white/80'
                            }`}>
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
                    anomaly={inspector.anomaly}
                    onClose={handleInspectorClose}
                    onAction={handleInspectorAction}
                />
            )}

            {/* Trigger Alert Button — hidden in details mode */}
            {viewMode !== 'details' && (
                <button
                    onClick={handleTriggerAlert}
                    className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-2.5 rounded-xl border font-medium text-sm transition-all duration-300 ${alertActive
                        ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_25px_rgba(239,68,68,0.3)] animate-pulse'
                        : 'bg-zinc-900/80 border-white/10 text-zinc-300 hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/5'
                        }`}
                >
                    <AlertTriangle size={16} className={alertActive ? 'text-red-400' : ''} />
                    {alertActive ? 'DISMISS ALERT' : 'TRIGGER ALERT'}
                </button>
            )}

            {/* Info Bar — hidden in details mode */}
            {viewMode !== 'details' && (
                <InfoBar
                    activePresetName={activePresetName}
                    cameraPosition={cameraPosition}
                    meshCount={meshCount}
                />
            )}

            {/* Dev Mode Indicator */}
            {devMode && (
                <div className="fixed top-4 right-4 z-50 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                    <span className="text-xs font-mono text-yellow-400">
                        DEV MODE — Double-click to capture coordinates
                    </span>
                </div>
            )}

            {/* Keyframes */}
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
        .animate-pulse-slow {
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
        </div>
    )
}
