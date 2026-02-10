'use client'

import { useOpshubStore } from '@/lib/store/opshub-store'
import { Building2, ChevronDown } from 'lucide-react'
import { OpshubFeed } from './OpshubFeed'
import { TotalRiskPanel } from './TotalRiskPanel'
import { WorkOrderShortcutList } from './WorkOrderShortcutList'

export function OpshubHome() {
    const factories = useOpshubStore(s => s.factories)
    const selectedFactoryId = useOpshubStore(s => s.selectedFactoryId)
    const setSelectedFactory = useOpshubStore(s => s.setSelectedFactory)

    const selectedFactory = selectedFactoryId
        ? factories.find(f => f.id === selectedFactoryId)
        : null

    return (
        <div className="flex gap-6 h-full w-full bg-zinc-950 px-6 py-6">
            {/* Left Sidebar - Factory Selector + Work Orders */}
            <div className="w-[240px] flex-shrink-0">
                <div className="sticky top-6">
                    {/* Factory Selector */}
                    <div className="mb-4">
                        <label className="text-xs text-zinc-500 font-medium uppercase tracking-wide mb-2 block">
                            Facility
                        </label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                            <select
                                value={selectedFactoryId || ''}
                                onChange={(e) => setSelectedFactory(e.target.value || null)}
                                className="w-full pl-9 pr-8 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200 appearance-none cursor-pointer hover:border-zinc-700 focus:outline-none focus:border-cyan-500 transition-colors"
                            >
                                <option value="">All Facilities</option>
                                {factories.map(factory => (
                                    <option key={factory.id} value={factory.id}>
                                        {factory.displayName}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                        </div>

                        {/* Selected Factory Metrics */}
                        {selectedFactory && (
                            <div className="mt-3 p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <p className="text-zinc-500">Efficiency</p>
                                        <p className="text-zinc-200 font-semibold">{selectedFactory.metrics.efficiency}%</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-500">Uptime</p>
                                        <p className="text-zinc-200 font-semibold">{selectedFactory.metrics.uptime}%</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Work Order Shortcuts */}
                    <WorkOrderShortcutList />
                </div>
            </div>

            {/* Center Feed */}
            <div className="flex-1 min-w-0">
                <OpshubFeed />
            </div>

            {/* Right Sidebar - Total Risk Panel */}
            <div className="flex-shrink-0">
                <TotalRiskPanel />
            </div>
        </div>
    )
}
