'use client'

import { Canvas, useThree } from '@react-three/fiber'
import { AlertTriangle, ClipboardPlus, Maximize2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { CameraSystemHandle } from './CameraSystem'
import type { AlertMeshInfo, MeshClickEvent } from './FactoryModel'
import { FactoryScene } from './FactoryScene'
import { InfoBar } from './InfoBar'
import { LoadingScreen } from './LoadingScreen'
import type { AnomalyAlert } from './MachineInspector'
import type { CameraPreset } from './camera-presets'
import { getMachineInfo } from './machine-data'

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
    onExpandClick?: (meshName: string) => void
    onCreateWorkOrder?: (meshName: string) => void
}

interface OverlayState {
    meshName: string
    machineName: string
    screenX: number
    screenY: number
    anomaly?: AnomalyAlert | null
}

// Helper component inside the Canvas to project 3D → 2D
function ScreenProjector({
    worldPos,
    onProject,
}: {
    worldPos: [number, number, number] | null
    onProject: (x: number, y: number) => void
}) {
    const { camera, gl } = useThree()

    useEffect(() => {
        if (!worldPos) return
        const vec = new THREE.Vector3(...worldPos)
        vec.project(camera)
        const rect = gl.domElement.getBoundingClientRect()
        const x = ((vec.x + 1) / 2) * rect.width + rect.left
        const y = ((-vec.y + 1) / 2) * rect.height + rect.top
        onProject(x, y)
    }, [worldPos, camera, gl, onProject])

    return null
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
    className = 'w-full h-screen',
    viewMode = 'full',
    isolatedMeshName = null,
    onExpandClick,
    onCreateWorkOrder,
}: DigitalTwinNavigatorProps) {
    const [activeId, setActiveId] = useState<string | null>(initialPreset)
    const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([0, 0, 0])
    const [meshCount, setMeshCount] = useState(0)
    const [transitionLabel, setTransitionLabel] = useState<string | null>(null)
    const [alertMeshPattern, setAlertMeshPattern] = useState<string | null>(null)
    const [alertActive, setAlertActive] = useState(false)
    const [overlay, setOverlay] = useState<OverlayState | null>(null)
    const [pendingProjection, setPendingProjection] = useState<[number, number, number] | null>(null)
    const [pendingOverlayData, setPendingOverlayData] = useState<Omit<OverlayState, 'screenX' | 'screenY'> | null>(null)
    const cameraRef = useRef<CameraSystemHandle>(null)
    const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

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

    const handleCameraMove = useCallback((position: [number, number, number]) => {
        setCameraPosition(position)
    }, [])

    const handleMeshCount = useCallback((count: number) => {
        setMeshCount(count)
    }, [])

    // Handle the 3D→2D projection result
    const handleProjection = useCallback((x: number, y: number) => {
        if (!pendingOverlayData) return
        // Clamp to container bounds
        const rect = containerRef.current?.getBoundingClientRect()
        const cx = rect ? Math.max(rect.left + 80, Math.min(x, rect.right - 80)) : x
        const cy = rect ? Math.max(rect.top + 40, Math.min(y, rect.bottom - 100)) : y
        setOverlay({ ...pendingOverlayData, screenX: cx, screenY: cy })
        setPendingProjection(null)
        setPendingOverlayData(null)
    }, [pendingOverlayData])

    // Mesh click → show overlay buttons at click screen position
    const handleMeshClick = useCallback((event: MeshClickEvent) => {
        const machine = getMachineInfo(event.meshName)

        // Use the mouse event screen coordinates via projection
        setPendingOverlayData({
            meshName: event.meshName,
            machineName: machine.name,
            anomaly: null,
        })
        setPendingProjection(event.worldPosition)
    }, [])

    // Canvas/ground click → dismiss overlay
    const handleCanvasClick = useCallback(() => {
        setOverlay(null)
    }, [])

    // Called by FactoryModel when alert meshes are found
    const handleAlertMeshFound = useCallback((info: AlertMeshInfo) => {
        cameraRef.current?.flyToPoint(info.worldPosition, info.meshName)

        setTransitionLabel(`ALERT: ${info.meshName}`)
        if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current)
        transitionTimeoutRef.current = setTimeout(() => setTransitionLabel(null), 3000)

        const machine = getMachineInfo(info.meshName)
        const anomaly: AnomalyAlert = {
            type: 'Excessive Vibration Detected',
            severity: 'critical',
            message: 'Vibration amplitude exceeds safe operating threshold on joint axis 3. Immediate inspection recommended.',
            value: '13.5 mm/s RMS',
            threshold: '7.0 mm/s RMS',
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        }

        // Show overlay with alert after fly animation settles
        setTimeout(() => {
            setPendingOverlayData({
                meshName: info.meshName,
                machineName: machine.name,
                anomaly,
            })
            setPendingProjection(info.worldPosition)
        }, 700)
    }, [])

    // TRIGGER ALERT
    const handleTriggerAlert = useCallback(() => {
        if (alertActive) {
            setAlertMeshPattern(null)
            setAlertActive(false)
            setOverlay(null)
            return
        }
        setAlertActive(true)
        setAlertMeshPattern('kuka-kr120-right')
    }, [alertActive])

    // Dismiss on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setOverlay(null)
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
        }
    }, [])

    const activePresetName = presets.find((p) => p.id === activeId)?.name ?? null

    // Convert overlay position from fixed viewport to relative-to-container
    const containerRect = containerRef.current?.getBoundingClientRect()
    const overlayLeft = overlay && containerRect ? overlay.screenX - containerRect.left : 0
    const overlayTop = overlay && containerRect ? overlay.screenY - containerRect.top : 0

    return (
        <div ref={containerRef} className={`relative ${className}`}>
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
                {/* Project 3D world position → 2D screen coords */}
                <ScreenProjector worldPos={pendingProjection} onProject={handleProjection} />
            </Canvas>

            {/* Transition Label */}
            {transitionLabel && (
                <div className={`${viewMode === 'details' ? 'absolute' : 'absolute'} inset-0 z-40 pointer-events-none flex items-center justify-center`}>
                    <div className="animate-fade-in-out">
                        <h2 className={`${viewMode === 'details' ? 'text-sm' : 'text-4xl'} font-bold tracking-wide drop-shadow-lg ${alertActive ? 'text-red-400/90' : 'text-white/80'}`}>
                            {transitionLabel}
                        </h2>
                    </div>
                </div>
            )}

            {/* ── OVERLAY BUTTONS at click position ── */}
            {overlay && viewMode !== 'details' && (
                <div
                    className="absolute z-50 flex flex-col items-center gap-2 animate-overlay-in"
                    style={{
                        left: `${overlayLeft}px`,
                        top: `${overlayTop}px`,
                        transform: 'translate(-50%, -100%)',
                    }}
                >
                    {/* Alert card — shown above buttons when anomaly */}
                    {overlay.anomaly && (
                        <div className="w-64 rounded-xl border border-red-500/40 bg-red-950/80 backdrop-blur-md p-3 mb-1 shadow-lg shadow-red-500/10">
                            <div className="flex items-center gap-2 mb-1.5">
                                <AlertTriangle size={14} className="text-red-400" />
                                <span className="text-xs font-semibold text-red-300">{overlay.anomaly.type}</span>
                            </div>
                            <p className="text-[11px] text-red-200/80 leading-relaxed mb-2">{overlay.anomaly.message}</p>
                            <div className="flex justify-between text-[10px]">
                                <span className="text-red-300">Value: <span className="font-mono font-bold">{overlay.anomaly.value}</span></span>
                                <span className="text-red-400/60">Threshold: {overlay.anomaly.threshold}</span>
                            </div>
                        </div>
                    )}

                    {/* Machine name label */}
                    <span className="text-[10px] text-zinc-400 font-medium tracking-wide mb-0.5">{overlay.machineName}</span>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                onCreateWorkOrder?.(overlay.meshName)
                                setOverlay(null)
                            }}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-zinc-800/90 backdrop-blur-sm text-zinc-200 border border-zinc-600/50 hover:bg-zinc-700 hover:border-zinc-500 transition-all shadow-lg"
                        >
                            <ClipboardPlus size={14} />
                            Create Work Order
                        </button>
                        <button
                            onClick={() => {
                                const name = overlay.meshName
                                setOverlay(null)
                                onExpandClick?.(name)
                            }}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-cyan-500/20 backdrop-blur-sm text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 hover:border-cyan-400/60 transition-all shadow-lg"
                        >
                            <Maximize2 size={14} />
                            Expand
                        </button>
                    </div>

                    {/* Pointer triangle */}
                    <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-zinc-700/80" />
                </div>
            )}

            {/* Trigger Alert Button */}
            {viewMode !== 'details' && (
                <button
                    onClick={handleTriggerAlert}
                    className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-2.5 rounded-xl border font-medium text-sm transition-all duration-300 ${alertActive
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
                <div className="absolute top-4 right-4 z-50 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
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
                @keyframes overlayIn {
                    from { opacity: 0; transform: translate(-50%, -100%) scale(0.9); }
                    to { opacity: 1; transform: translate(-50%, -100%) scale(1); }
                }
                .animate-overlay-in {
                    animation: overlayIn 0.2s ease-out;
                }
            `}</style>
        </div>
    )
}
