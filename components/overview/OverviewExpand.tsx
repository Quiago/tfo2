'use client'

import { AssetTree } from '@/components/asset-details/AssetTree'
import { MachineSummaryBar } from '@/components/asset-details/MachineSummaryBar'
import { useOpshubStore } from '@/lib/store/opshub-store'
import type { TfoModule } from '@/lib/types/tfo'
import dynamic from 'next/dynamic'

// Dynamic imports — SSR disabled for heavy components
const MultiLayerTimeline = dynamic(
    () =>
        import('@/components/timeline/Timeline').then((m) => m.MultiLayerTimeline),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-full w-full items-center justify-center bg-zinc-950">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-cyan-500" />
                    <span className="text-xs text-zinc-500">Loading Timeline...</span>
                </div>
            </div>
        )
    }
)

interface OverviewExpandProps {
    viewMode: 'overview' | 'details'
    selectedAsset: string | null
    autoTriggerAnomaly: boolean
    onAnomalyTriggered: () => void
    onSelectAsset: (id: string) => void
    setActiveModule: (mod: TfoModule) => void
}

export function OverviewExpand({
    viewMode,
    selectedAsset,
    autoTriggerAnomaly,
    onAnomalyTriggered,
    onSelectAsset,
    setActiveModule,
}: OverviewExpandProps) {
    const setPendingCreateWorkOrder = useOpshubStore(s => s.setPendingCreateWorkOrder)

    return (
        <>
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
                    onSelect={onSelectAsset}
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
                        onAnomalyTriggered={onAnomalyTriggered}
                    />
                </div>
            </div>
        </>
    )
}
