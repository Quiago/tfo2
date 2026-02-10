'use client'

import { UserAvatar } from './UserAvatar'

interface AvatarStackProps {
    members: { initials: string; color: string }[]
    max?: number
}

export function AvatarStack({ members, max = 4 }: AvatarStackProps) {
    const visible = members.slice(0, max)
    const overflow = members.length - max

    return (
        <div className="flex items-center -space-x-2">
            {visible.map((m, i) => (
                <div key={i} className="ring-2 ring-zinc-900 rounded-full">
                    <UserAvatar initials={m.initials} color={m.color} size="sm" />
                </div>
            ))}
            {overflow > 0 && (
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-700 text-zinc-300 text-[10px] font-medium ring-2 ring-zinc-900">
                    +{overflow}
                </div>
            )}
        </div>
    )
}
