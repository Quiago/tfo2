'use client'

import type { TaskPriority } from '@/lib/types/opshub'
import { ArrowLeft, ClipboardPlus, X } from 'lucide-react'
import { useCallback, useState } from 'react'

interface CreateWorkOrderFormProps {
    prefillEquipment?: string
    onSubmit: (data: WorkOrderFormData) => void
    onCancel: () => void
}

export interface WorkOrderFormData {
    title: string
    description: string
    equipmentName: string
    priority: TaskPriority
    facility: string
    tags: string[]
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

export function CreateWorkOrderForm({ prefillEquipment, onSubmit, onCancel }: CreateWorkOrderFormProps) {
    const [title, setTitle] = useState(prefillEquipment ? `Maintenance — ${prefillEquipment}` : '')
    const [description, setDescription] = useState('')
    const [equipmentName, setEquipmentName] = useState(prefillEquipment ?? '')
    const [priority, setPriority] = useState<TaskPriority>('medium')
    const [facility, setFacility] = useState(FACILITIES[0])
    const [tagInput, setTagInput] = useState('')
    const [tags, setTags] = useState<string[]>(prefillEquipment ? ['maintenance'] : [])
    const [errors, setErrors] = useState<Record<string, string>>({})

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
        if (!description.trim()) newErrors.description = 'Description is required'

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        onSubmit({ title: title.trim(), description: description.trim(), equipmentName: equipmentName.trim(), priority, facility, tags })
    }, [title, description, equipmentName, priority, facility, tags, onSubmit])

    const inputClass = 'w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-zinc-100 placeholder:text-zinc-600'
    const labelClass = 'block text-xs font-medium text-zinc-400 mb-1.5'

    return (
        <div className="max-w-2xl mx-auto py-6 px-4">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={onCancel}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                >
                    <ArrowLeft size={18} />
                </button>
                <ClipboardPlus className="w-5 h-5 text-cyan-400" />
                <h1 className="text-xl font-bold text-zinc-100">Create Work Order</h1>
            </div>

            {/* Form */}
            <div className="space-y-5 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                {/* Title */}
                <div>
                    <label className={labelClass}>Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: '' })) }}
                        placeholder="e.g. Motor A7 Bearing Replacement — Line 3"
                        className={`${inputClass} ${errors.title ? 'border-red-500/50 ring-1 ring-red-500/30' : ''}`}
                    />
                    {errors.title && <span className="text-[10px] text-red-400 mt-1">{errors.title}</span>}
                </div>

                {/* Equipment + Priority row */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Equipment</label>
                        <input
                            type="text"
                            value={equipmentName}
                            onChange={(e) => { setEquipmentName(e.target.value); setErrors((p) => ({ ...p, equipmentName: '' })) }}
                            placeholder="e.g. KUKA KR120"
                            className={`${inputClass} ${errors.equipmentName ? 'border-red-500/50 ring-1 ring-red-500/30' : ''}`}
                        />
                        {errors.equipmentName && <span className="text-[10px] text-red-400 mt-1">{errors.equipmentName}</span>}
                    </div>
                    <div>
                        <label className={labelClass}>Priority</label>
                        <div className="flex gap-1.5">
                            {PRIORITIES.map((p) => (
                                <button
                                    key={p.value}
                                    onClick={() => setPriority(p.value)}
                                    className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${
                                        priority === p.value
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
                </div>

                {/* Facility */}
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

                {/* Description */}
                <div>
                    <label className={labelClass}>Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: '' })) }}
                        placeholder="Describe the issue, context, and any relevant observations..."
                        rows={4}
                        className={`${inputClass} resize-none ${errors.description ? 'border-red-500/50 ring-1 ring-red-500/30' : ''}`}
                    />
                    {errors.description && <span className="text-[10px] text-red-400 mt-1">{errors.description}</span>}
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
                            placeholder="Add tag and press Enter"
                            className={`${inputClass} flex-1`}
                        />
                    </div>
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-zinc-800 text-zinc-400 rounded-md"
                                >
                                    {tag}
                                    <button onClick={() => removeTag(tag)} className="text-zinc-600 hover:text-zinc-300">
                                        <X size={10} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors"
                    >
                        <ClipboardPlus size={15} />
                        Create Work Order
                    </button>
                </div>
            </div>
        </div>
    )
}
