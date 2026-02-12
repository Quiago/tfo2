import s from '@/app/overview.module.css'
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
            <div className="flex h-full w-full items-center justify-center">
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
            {/* Asset Tree Card - Bottom Left (Below 3D) */}
            <div
                className={`absolute ${s.card} flex flex-col overflow-hidden transition-opacity duration-300
                ${viewMode === 'details'
                        ? 'left-4 top-[calc(80px+35%+1rem)] w-[calc(20%-1rem)] h-[calc(100%-80px-35%-2rem)] opacity-100'
                        : 'left-0 top-[100%] w-[25%] h-0 opacity-0 pointer-events-none'
                    }`}
            >
                <AssetTree
                    selectedAssetId={selectedAsset || undefined}
                    onSelect={onSelectAsset}
                />
            </div>

            {/* Right Panel Container - Timeline + Summary */}
            <div
                className={`absolute right-4 top-[80px] bottom-4 flex flex-col gap-4 transition-opacity duration-300
                ${viewMode === 'details'
                        ? 'w-[calc(80%-2rem)] opacity-100'
                        : 'w-0 opacity-0 overflow-hidden pointer-events-none'
                    }`}
            >
                {/* Machine Summary Card */}
                <div className={`${s.card} flex-shrink-0`}>
                    <MachineSummaryBar
                        onCreateWorkOrder={() => {
                            if (selectedAsset) {
                                setPendingCreateWorkOrder({ equipmentName: selectedAsset, meshName: selectedAsset })
                            }
                            setActiveModule('opshub')
                        }}
                    />
                </div>

                {/* Timeline Card */}
                <div className={`${s.timelineCard} flex-grow`}>
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
