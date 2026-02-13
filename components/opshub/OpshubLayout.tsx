'use client'

import { MOCK_TEAM, useOpshubMockData } from '@/lib/hooks/useOpshubMockData'
import { useOpshubStore } from '@/lib/store/opshub-store'
import { CreateWorkOrderForm, type WorkOrderFormData } from './CreateWorkOrderForm'
import { OpshubHome } from './feed/OpshubHome'
import { WorkOrderDetail } from './work-orders/WorkOrderDetail'
import { WorkOrderList } from './work-orders/WorkOrderList'

export function OpshubLayout() {
    useOpshubMockData()

    const activeTab = useOpshubStore(s => s.activeTab)
    const setActiveTab = useOpshubStore(s => s.setActiveTab)
    const selectedWorkOrderId = useOpshubStore(s => s.selectedWorkOrderId)
    const setSelectedWorkOrderId = useOpshubStore(s => s.setSelectedWorkOrderId)
    const pendingCreateWorkOrder = useOpshubStore(s => s.pendingCreateWorkOrder)
    const setPendingCreateWorkOrder = useOpshubStore(s => s.setPendingCreateWorkOrder)
    const addWorkOrder = useOpshubStore(s => s.addWorkOrder)
    const currentUser = useOpshubStore(s => s.currentUser)

    // Priority 1: Creating a work order (from DT overlay or summary bar)
    const createWorkOrderWithTask = useOpshubStore(s => s.createWorkOrderWithTask)

    if (pendingCreateWorkOrder) {
        return (
            <div className="flex flex-col h-full w-full bg-zinc-950 overflow-y-auto">
                <CreateWorkOrderForm
                    initialData={pendingCreateWorkOrder} // Pass auto-fill data
                    prefillEquipment={pendingCreateWorkOrder.equipmentName}
                    onSubmit={(woData: WorkOrderFormData, taskData) => {
                        const owner = currentUser ?? {
                            id: 'demo-user',
                            name: 'Demo Operator',
                            role: 'Plant Manager',
                            facility: woData.facility,
                            avatarInitials: 'DO',
                            avatarColor: 'bg-cyan-500',
                            status: 'available',
                        }

                        const assignee = MOCK_TEAM.find(m => m.id === taskData.assigneeId) || owner

                        // Use the new atomic action
                        createWorkOrderWithTask(
                            { ...woData, owner },
                            {
                                title: `Initial Investigation`,
                                description: taskData.instructions,
                                assignee: assignee,
                                assignedBy: owner,
                                priority: woData.priority
                            }
                        )

                        setPendingCreateWorkOrder(null)
                        setActiveTab('work-orders')
                    }}
                    onCancel={() => setPendingCreateWorkOrder(null)}
                />
            </div>
        )
    }

    // Priority 2: Viewing a specific work order detail
    if (selectedWorkOrderId) {
        return (
            <div className="flex flex-col h-full w-full bg-zinc-950">
                <WorkOrderDetail
                    workOrderId={selectedWorkOrderId}
                    onBack={() => {
                        setSelectedWorkOrderId(null)
                        // Stay on work-orders list if that's where we came from
                    }}
                />
            </div>
        )
    }

    // Priority 3: Work orders list view
    if (activeTab === 'work-orders') {
        return (
            <div className="flex flex-col h-full w-full bg-zinc-950">
                <WorkOrderList
                    onSelectWorkOrder={setSelectedWorkOrderId}
                    onBack={() => setActiveTab('home')}
                />
            </div>
        )
    }

    // Default: Feed / Home view
    return (
        <div className="flex flex-col h-full w-full bg-zinc-950">
            <OpshubHome />
        </div>
    )
}
