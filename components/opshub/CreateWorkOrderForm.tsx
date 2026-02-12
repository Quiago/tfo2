'use client'

import { MOCK_TEAM } from '@/lib/hooks/useOpshubMockData'
import type { TaskPriority } from '@/lib/types/opshub'
import { ArrowLeft, ClipboardPlus, User, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

export interface WorkOrderFormData {
    title: string
    description: string
    equipmentName: string
    priority: TaskPriority
    facility: string
    tags: string[]
}

export interface TaskAssignmentData {
    assigneeId: string
    instructions: string
}

interface CreateWorkOrderFormProps {
    initialData?: Partial<WorkOrderFormData> // NEW: Auto-fill data
    prefillEquipment?: string
    onSubmit: (woData: WorkOrderFormData, taskData: TaskAssignmentData) => void
    onCancel: () => void
}

const PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
    { value: 'low', label: 'Low', color: 'bg-zinc-600' },
    { value: 'medium', label: 'Medium', color: 'bg-blue-500' },
    { value: 'high', label: 'High', color: 'bg-amber-500' },
    { value: 'critical', label: 'Critical', color: 'bg-red-500' },
]

const FACILITIES = [
    'Munich Paint Shop',
    'Detroit Assembly',
    'Shenzhen Electronics',
    'CDMX Stamping',
    'Riyadh Cooling Systems',
    'Tokyo Innovation Lab',
    'São Paulo Hub',
]

export function CreateWorkOrderForm({ initialData, prefillEquipment, onSubmit, onCancel }: CreateWorkOrderFormProps) {
    // Section 1: Work Order Details
    const [title, setTitle] = useState(initialData?.title || (prefillEquipment ? `Maintenance — ${prefillEquipment}` : ''))
    const [description, setDescription] = useState(initialData?.description || '')
    const [equipmentName, setEquipmentName] = useState(initialData?.equipmentName || prefillEquipment || '')
    const [priority, setPriority] = useState<TaskPriority>(initialData?.priority || 'medium')
    const [facility, setFacility] = useState(initialData?.facility || FACILITIES[0])
    const [tagInput, setTagInput] = useState('')
    const [tags, setTags] = useState<string[]>(initialData?.tags || (prefillEquipment ? ['maintenance'] : []))

    // Section 2: Initial Task Assignment
    const [assigneeId, setAssigneeId] = useState<string>('')
    const [taskInstructions, setTaskInstructions] = useState('Perform physical inspection of the bearing assembly based on the anomaly report.')

    const [errors, setErrors] = useState<Record<string, string>>({})

    // Filter relevant team members (exclude system/AI for assignment if needed, or keep all)
    const availableAssignees = MOCK_TEAM.filter(m => !m.isAI)

    // Select Reliability Engineer by default if available/matching intent
    useEffect(() => {
        // Try to find a Reliability Engineer or Maintenance Lead
        const suggested = availableAssignees.find(m => m.role.includes('Reliability')) || availableAssignees[0]
        if (suggested && !assigneeId) {
            setAssigneeId(suggested.id)
        }
    }, [availableAssignees, assigneeId])


    const addTag = useCallback(() => {
        const tag = tagInput.trim().toLowerCase()
        if (tag && !tags.includes(tag)) {
            setTags((prev) => [...prev, tag])
        }
        setTagInput('')
    }, [tagInput, tags])

    const removeTag = useCallback((tag: string) => {
        setTags((prev) => prev.filter((t) => t !== tag))
    }, [])

    const handleSubmit = useCallback(() => {
        const newErrors: Record<string, string> = {}
        if (!title.trim()) newErrors.title = 'Title is required'
        if (!equipmentName.trim()) newErrors.equipmentName = 'Equipment name is required'
        if (!assigneeId) newErrors.assignee = 'Assignee is required'
        // Description check removed or made optional? User didn't say it's optional, just not auto-filled.
        if (!description.trim()) newErrors.description = 'Description is required'
        if (!taskInstructions.trim()) newErrors.instructions = 'Instructions are required'

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        onSubmit(
            { title: title.trim(), description: description.trim(), equipmentName: equipmentName.trim(), priority, facility, tags },
            { assigneeId, instructions: taskInstructions.trim() }
        )
    }, [title, description, equipmentName, priority, facility, tags, assigneeId, taskInstructions, onSubmit])

    const inputClass = 'w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-zinc-100 placeholder:text-zinc-600'
    const labelClass = 'block text-[10px] font-medium text-zinc-400 mb-1'

    return (
        <div className="flex flex-col h-full max-w-6xl mx-auto p-4">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 flex-none">
                <button
                    onClick={onCancel}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <ClipboardPlus className="w-5 h-5 text-cyan-400" />
                        <h1 className="text-lg font-bold text-zinc-100">Create Work Order</h1>
                    </div>
                </div>
            </div>

            {/* Content - Side by Side */}
            <div className="flex-1 min-h-0 flex gap-4">

                {/* LEFT: Work Order Context (60%) */}
                <div className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/30"></div>
                    <h2 className="text-xs font-semibold text-zinc-300 mb-3 pb-2 border-b border-zinc-800/50 flex items-center gap-2 flex-none">
                        <span className="w-5 h-5 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-[10px] text-center font-bold">1</span>
                        Order Context
                    </h2>

                    <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                        {/* Title */}
                        <div>
                            <label className={labelClass}>Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: '' })) }}
                                placeholder="Order Title"
                                className={`${inputClass} ${errors.title ? 'border-red-500/50 ring-1 ring-red-500/30' : ''}`}
                            />
                            {errors.title && <span className="text-[10px] text-red-400 mt-0.5">{errors.title}</span>}
                        </div>

                        {/* Equipment & Facility */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Equipment</label>
                                <input
                                    type="text"
                                    value={equipmentName}
                                    onChange={(e) => { setEquipmentName(e.target.value); setErrors((p) => ({ ...p, equipmentName: '' })) }}
                                    className={`${inputClass} ${errors.equipmentName ? 'border-red-500/50 ring-1 ring-red-500/30' : ''}`}
                                />
                                {errors.equipmentName && <span className="text-[10px] text-red-400 mt-0.5">{errors.equipmentName}</span>}
                            </div>
                            <div>
                                <label className={labelClass}>Facility</label>
                                <select
                                    value={facility}
                                    onChange={(e) => setFacility(e.target.value)}
                                    className={inputClass}
                                >
                                    {FACILITIES.map((f) => (
                                        <option key={f} value={f}>{f}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Priority */}
                        <div>
                            <label className={labelClass}>Priority</label>
                            <div className="flex gap-1.5">
                                {PRIORITIES.map((p) => (
                                    <button
                                        key={p.value}
                                        onClick={() => setPriority(p.value)}
                                        className={`flex-1 py-1.5 text-[10px] font-medium rounded-md border transition-all ${priority === p.value
                                            ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                                            : 'border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                                            }`}
                                    >
                                        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${p.color}`} />
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className={labelClass}>Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: '' })) }}
                                placeholder="Describe the issue..."
                                rows={4}
                                className={`${inputClass} resize-none ${errors.description ? 'border-red-500/50 ring-1 ring-red-500/30' : ''}`}
                            />
                            {errors.description && <span className="text-[10px] text-red-400 mt-0.5">{errors.description}</span>}
                        </div>

                        {/* Tags */}
                        <div>
                            <label className={labelClass}>Tags</label>
                            <div className="flex items-center gap-2 mb-2">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                                    placeholder="Add tag..."
                                    className={`${inputClass}`}
                                />
                            </div>
                            <div className="flex flex-wrap gap-1.5 min-h-[24px]">
                                {tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-zinc-800 text-zinc-400 rounded-md"
                                    >
                                        {tag}
                                        <button onClick={() => removeTag(tag)} className="text-zinc-600 hover:text-zinc-300">
                                            <X size={10} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Initial Task (40%) */}
                <div className="w-[40%] bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/30"></div>
                    <h2 className="text-xs font-semibold text-zinc-300 mb-3 pb-2 border-b border-zinc-800/50 flex items-center gap-2 flex-none">
                        <span className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 text-[10px] text-center font-bold">2</span>
                        Initial Task
                    </h2>

                    <div className="space-y-3 flex-1 flex flex-col">
                        {/* Assignee */}
                        <div className="flex-none">
                            <label className={labelClass}>Assign To</label>
                            <div className="relative">
                                <select
                                    value={assigneeId}
                                    onChange={(e) => setAssigneeId(e.target.value)}
                                    className={`${inputClass} appearance-none`}
                                >
                                    <option value="" disabled>Select...</option>
                                    {availableAssignees.map(m => (
                                        <option key={m.id} value={m.id}>
                                            {m.name} — {m.role}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-2.5 pointer-events-none text-zinc-500">
                                    <User size={14} />
                                </div>
                            </div>
                            {errors.assignee && <span className="text-[10px] text-red-400 mt-0.5">{errors.assignee}</span>}
                        </div>

                        {/* Instructions */}
                        <div className="flex-1 flex flex-col mt-2">
                            <label className={labelClass}>Instructions</label>
                            <textarea
                                value={taskInstructions}
                                onChange={(e) => { setTaskInstructions(e.target.value); setErrors((p) => ({ ...p, instructions: '' })) }}
                                placeholder="Task instructions..."
                                className={`${inputClass} resize-none flex-1 ${errors.instructions ? 'border-red-500/50 ring-1 ring-red-500/30' : ''}`}
                            />
                            {errors.instructions && <span className="text-[10px] text-red-400 mt-0.5">{errors.instructions}</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800 flex-none">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-5 py-2 text-xs font-medium bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors shadow-lg shadow-cyan-500/20"
                >
                    <ClipboardPlus size={14} />
                    Create Order & Assign
                </button>
            </div>
        </div>
    )
}
