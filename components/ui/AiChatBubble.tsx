import { MOCK_TEAM } from '@/lib/hooks/useOpshubMockData'
import { useOpshubStore } from '@/lib/store/opshub-store'
import { ArrowUp, Minus, Sparkles, Square, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
}

const SUGGESTIONS = [
    'Summarize recent alerts',
    'Generate a report based on timeline data and the associated Munich incident context. Assign a specific task to the Maintenance Engineer (User 3).',
    'Show energy report',
]

export function AiChatBubble() {
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [typing, setTyping] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    // Store access for demo actions
    const selectedWorkOrderId = useOpshubStore(s => s.selectedWorkOrderId)
    const workOrders = useOpshubStore(s => s.workOrders)
    const addTask = useOpshubStore(s => s.addTask)
    const currentUser = useOpshubStore(s => s.currentUser)

    const scrollToBottom = useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages, typing, scrollToBottom])

    useEffect(() => {
        if (open) inputRef.current?.focus()
    }, [open])

    const handleSend = useCallback((text?: string) => {
        const content = (text ?? input).trim()
        if (!content) return

        const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content }
        setMessages((prev) => [...prev, userMsg])
        setInput('')
        setTyping(true)

        // DEMO LOGIC: Intercept specific prompt
        const isDemoPrompt = content.includes('Munich incident') && content.includes('Maintenance Engineer')

        setTimeout(() => {
            let aiResponse = `I'll help you with that. Analyzing "${content}"...`

            if (isDemoPrompt) {
                // Find target Work Order (Selected OR Latest)
                const targetWoId = selectedWorkOrderId || workOrders[workOrders.length - 1]?.id

                if (targetWoId) {
                    // Find Maintenance Engineer (User 3 - Ahmed or similar)
                    // In mock data: 'ahmed-nasser' is Maintenance Lead, close enough. 
                    const maintenanceEng = MOCK_TEAM.find(m => m.role.includes('Maintenance')) || MOCK_TEAM[2]

                    if (maintenanceEng) {
                        // Create the task
                        addTask(targetWoId, {
                            type: 'repair',
                            title: 'Replace Bearing Assembly (AI Generated)',
                            description: 'Based on the cross-facility analysis of the Munich incident, the bearing assembly shows 87% similarity in vibration patterns pre-failure. Immediate replacement recommended to prevent seizure.',
                            assignee: maintenanceEng,
                            assignedBy: currentUser || MOCK_TEAM[0], // Current user or default
                            priority: 'high'
                        })

                        aiResponse = `Analysis complete. I've detected a high correlation (87%) with the Munich incident. \n\nI have automatically created a **Repair Task** for **${maintenanceEng.name}** to replace the bearing assembly immediately.`
                    } else {
                        aiResponse = "I could not find a Maintenance Engineer to assign the task to."
                    }
                } else {
                    aiResponse = "Please open a Work Order first to assign tasks."
                }
            } else if (content.includes('Summarize')) {
                aiResponse = "Recent alerts show a spike in vibration on Motor A7 and minor temperature fluctuations in the Cooling System. Overall facility health is 92%."
            }

            const aiMsg: Message = {
                id: `a-${Date.now()}`,
                role: 'assistant',
                content: aiResponse,
            }
            setMessages((prev) => [...prev, aiMsg])
            setTyping(false)
        }, 1500)
    }, [input, addTask, selectedWorkOrderId, workOrders, currentUser])

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }, [handleSend])

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open) setOpen(false)
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [open])

    const isEmpty = messages.length === 0

    return (
        <>
            {/* Chat Popup */}
            {open && (
                <div className="fixed bottom-20 right-5 z-[100] w-[400px] h-[520px] rounded-2xl border border-zinc-700/80 bg-zinc-900 shadow-2xl shadow-black/50 flex flex-col overflow-hidden animate-in">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-zinc-200">OpsFlow AI</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-medium">Auto</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setOpen(false)}
                                className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                            >
                                <Minus size={14} />
                            </button>
                            <button
                                onClick={() => { setOpen(false); setMessages([]) }}
                                className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                        {isEmpty && !typing && (
                            <div className="flex flex-col items-center justify-center h-full gap-4">
                                <div className="h-10 w-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
                                    <Sparkles size={20} className="text-cyan-400" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-zinc-200">OpsFlow AI Assistant</p>
                                    <p className="text-xs text-zinc-500 mt-1">Ask me anything about your facility</p>
                                </div>
                                <div className="w-full space-y-1.5 mt-2">
                                    {SUGGESTIONS.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => handleSend(s)}
                                            className="w-full text-left px-3 py-2 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${msg.role === 'user'
                                        ? 'bg-cyan-500/15 text-cyan-100'
                                        : 'bg-zinc-800 text-zinc-300'
                                    }`}>
                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                </div>
                            </div>
                        ))}

                        {typing && (
                            <div className="flex justify-start">
                                <div className="bg-zinc-800 rounded-xl px-3 py-2 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:0ms]" />
                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:150ms]" />
                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:300ms]" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-zinc-800">
                        <div className="flex items-end gap-2 bg-zinc-800 rounded-xl px-3 py-2 border border-zinc-700 focus-within:border-cyan-500/50 transition-colors">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask OpsFlow AI..."
                                rows={1}
                                className="flex-1 bg-transparent text-xs text-zinc-200 placeholder:text-zinc-500 resize-none outline-none max-h-20"
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={!input.trim()}
                                className={`p-1 rounded-lg transition-colors flex-shrink-0 ${input.trim()
                                        ? 'bg-cyan-500 text-white hover:bg-cyan-400'
                                        : 'bg-zinc-700 text-zinc-500'
                                    }`}
                            >
                                <ArrowUp size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={() => setOpen(!open)}
                className={`fixed bottom-5 right-5 z-[100] h-10 w-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${open
                        ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300 scale-90'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-white hover:scale-105'
                    }`}
            >
                {open ? <Square size={15} /> : <Sparkles size={18} />}
            </button>

            <style jsx global>{`
                @keyframes animateIn {
                    from { opacity: 0; transform: translateY(12px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-in { animation: animateIn 0.2s ease-out; }
            `}</style>
        </>
    )
}
