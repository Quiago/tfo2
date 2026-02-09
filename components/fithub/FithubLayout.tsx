'use client'

import { useFithubMockData } from '@/lib/hooks/useFithubMockData'
import { ChangelogPanel } from './ChangelogPanel'
import { FactoryReposSidebar } from './FactoryReposSidebar'
import { FithubFeed } from './FithubFeed'

/**
 * FithubLayout: GitHub-inspired 3-column layout
 * - Left (240px): Factory repos sidebar
 * - Center (flex-1): Feed with input bar
 * - Right (280px): Changelog panel
 */
export function FithubLayout() {
    // Initialize mock data
    useFithubMockData()

    return (
        <div className="flex h-full w-full bg-slate-50 dark:bg-slate-950">
            {/* Left Sidebar - Factory Repos */}
            <aside className="w-60 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto">
                <FactoryReposSidebar />
            </aside>

            {/* Main Content - Feed */}
            <main className="flex-1 overflow-y-auto">
                <FithubFeed />
            </main>

            {/* Right Sidebar - Changelog */}
            <aside className="w-72 flex-shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto hidden lg:block">
                <ChangelogPanel />
            </aside>
        </div>
    )
}
