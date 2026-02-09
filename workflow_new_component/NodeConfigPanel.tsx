// /components/features/workflow-builder/NodeConfigPanel.tsx
'use client'

import { useMemo } from 'react'
import { useWorkflowStore } from '@/lib/store/workflow-store'
import { NODE_REGISTRY } from '@/lib/types/workflow'
import * as LucideIcons from 'lucide-react'
import { X, Trash2 } from 'lucide-react'

function getIcon(name: string, size = 16) {
  const Icon = (LucideIcons as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[name]
  return Icon ? <Icon size={size} /> : null
}

export function NodeConfigPanel() {
  const { workflow, selectedNodeId, selectNode, updateNode, removeNode } = useWorkflowStore()

  const node = useMemo(
    () => workflow?.nodes.find(n => n.id === selectedNodeId) ?? null,
    [workflow?.nodes, selectedNodeId]
  )

  if (!node) return null

  const meta = NODE_REGISTRY[node.type]

  const handleLabelChange = (label: string) => {
    updateNode(node.id, { label })
  }

  const handleDelete = () => {
    removeNode(node.id)
  }

  const handleClose = () => {
    selectNode(null)
  }

  // Render config fields based on node type
  const renderConfigFields = () => {
    const config = node.config as Record<string, unknown>

    switch (node.type) {
      case 'voice_trigger':
        return (
          <ConfigField label="Keywords">
            <input
              type="text"
              defaultValue={(config.keywords as string[] | undefined)?.join(', ') ?? ''}
              onChange={(e) => updateNode(node.id, {
                config: { ...config, keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean) }
              })}
              placeholder="vibration, gravel, noise"
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-zinc-500"
            />
          </ConfigField>
        )

      case 'decision':
        return (
          <>
            <ConfigField label="Condition">
              <input
                type="text"
                defaultValue={(config.condition as string) ?? ''}
                onChange={(e) => updateNode(node.id, {
                  config: { ...config, condition: e.target.value }
                })}
                placeholder="temperature > 85"
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-zinc-500"
              />
            </ConfigField>
            <div className="flex gap-2">
              <ConfigField label="True Label" className="flex-1">
                <input
                  type="text"
                  defaultValue={(config.trueLabel as string) ?? 'Yes'}
                  onChange={(e) => updateNode(node.id, {
                    config: { ...config, trueLabel: e.target.value }
                  })}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-zinc-500"
                />
              </ConfigField>
              <ConfigField label="False Label" className="flex-1">
                <input
                  type="text"
                  defaultValue={(config.falseLabel as string) ?? 'No'}
                  onChange={(e) => updateNode(node.id, {
                    config: { ...config, falseLabel: e.target.value }
                  })}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-zinc-500"
                />
              </ConfigField>
            </div>
          </>
        )

      case 'send_alert':
        return (
          <>
            <ConfigField label="Channel">
              <select
                defaultValue={(config.channel as string) ?? 'slack'}
                onChange={(e) => updateNode(node.id, {
                  config: { ...config, channel: e.target.value }
                })}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-zinc-500"
              >
                <option value="slack">Slack</option>
                <option value="email">Email</option>
                <option value="telegram">Telegram</option>
                <option value="push">Push Notification</option>
              </select>
            </ConfigField>
            <ConfigField label="Recipient">
              <input
                type="text"
                defaultValue={(config.recipient as string) ?? ''}
                onChange={(e) => updateNode(node.id, {
                  config: { ...config, recipient: e.target.value }
                })}
                placeholder="#channel or email@example.com"
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-zinc-500"
              />
            </ConfigField>
            <ConfigField label="Message Template">
              <textarea
                defaultValue={(config.messageTemplate as string) ?? ''}
                onChange={(e) => updateNode(node.id, {
                  config: { ...config, messageTemplate: e.target.value }
                })}
                placeholder="🚨 Alert: {{description}}"
                rows={3}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-zinc-500"
              />
            </ConfigField>
          </>
        )

      case 'create_ticket':
        return (
          <>
            <ConfigField label="Service">
              <select
                defaultValue={(config.service as string) ?? 'jira'}
                onChange={(e) => updateNode(node.id, {
                  config: { ...config, service: e.target.value }
                })}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-zinc-500"
              >
                <option value="jira">Jira Cloud</option>
                <option value="servicenow">ServiceNow</option>
                <option value="email_fallback">Email (Fallback)</option>
              </select>
            </ConfigField>
            <ConfigField label="Title Template">
              <input
                type="text"
                defaultValue={(config.titleTemplate as string) ?? ''}
                onChange={(e) => updateNode(node.id, {
                  config: { ...config, titleTemplate: e.target.value }
                })}
                placeholder="{{issue_type}} — {{asset.model}}"
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-zinc-500"
              />
            </ConfigField>
            <ConfigField label="Priority">
              <select
                defaultValue={(config.priority as string) ?? 'medium'}
                onChange={(e) => updateNode(node.id, {
                  config: { ...config, priority: e.target.value }
                })}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-zinc-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </ConfigField>
          </>
        )

      case 'generate_report':
        return (
          <>
            <ConfigField label="Format">
              <select
                defaultValue={(config.format as string) ?? 'pdf'}
                onChange={(e) => updateNode(node.id, {
                  config: { ...config, format: e.target.value }
                })}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-zinc-500"
              >
                <option value="pdf">PDF</option>
                <option value="xlsx">Excel (.xlsx)</option>
              </select>
            </ConfigField>
            <ConfigField label="Include Photos">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  defaultChecked={(config.includePhotos as boolean) ?? false}
                  onChange={(e) => updateNode(node.id, {
                    config: { ...config, includePhotos: e.target.checked }
                  })}
                  className="rounded border-zinc-600"
                />
                <span className="text-xs text-zinc-300">Attach captured photos</span>
              </label>
            </ConfigField>
          </>
        )

      default:
        // Generic JSON view for unconfigured types
        return (
          <ConfigField label="Configuration (JSON)">
            <textarea
              defaultValue={JSON.stringify(config, null, 2)}
              rows={4}
              readOnly
              className="w-full rounded-md border border-zinc-700 bg-zinc-800/50 px-2 py-1.5 font-mono text-[10px] text-zinc-400 outline-none"
            />
          </ConfigField>
        )
    }
  }

  return (
    <div className="flex w-72 shrink-0 flex-col border-l border-zinc-800 bg-zinc-900/60">
      {/* Panel Header */}
      <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2">
        <span className={`flex h-7 w-7 items-center justify-center rounded bg-${meta.color}-500/15 text-${meta.color}-400`}>
          {getIcon(meta.icon, 14)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            {meta.label}
          </p>
          <p className="truncate text-xs text-zinc-300">{node.id}</p>
        </div>
        <button
          onClick={handleClose}
          className="flex h-6 w-6 items-center justify-center rounded text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
        >
          <X size={14} />
        </button>
      </div>

      {/* Config Form */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* Node Label */}
        <ConfigField label="Label">
          <input
            type="text"
            value={node.label}
            onChange={(e) => handleLabelChange(e.target.value)}
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-zinc-500"
          />
        </ConfigField>

        <div className="my-3 border-t border-zinc-800" />

        {/* Type-specific config */}
        {renderConfigFields()}
      </div>

      {/* Delete button */}
      <div className="border-t border-zinc-800 p-3">
        <button
          onClick={handleDelete}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 py-2 text-xs font-medium text-rose-400 transition-colors hover:bg-rose-500/10"
        >
          <Trash2 size={12} />
          Delete Node
        </button>
      </div>
    </div>
  )
}

// ─── Reusable Config Field Wrapper ───────────────────────────────
function ConfigField({ label, children, className = '' }: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`mb-3 ${className}`}>
      <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </label>
      {children}
    </div>
  )
}
