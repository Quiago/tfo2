'use client'

import { useFithubStore } from '@/lib/store/fithub-store'
import { ChevronDown, GitFork, Plus, Search, Star } from 'lucide-react'

/**
 * FactoryReposSidebar: Left panel showing factories and their workflow repos
 * Inspired by GitHub's repository sidebar
 */
export function FactoryReposSidebar() {
    const {
        factories,
        selectedFactoryId,
        setSelectedFactory,
        getFilteredRepos,
        searchQuery,
        setSearchQuery,
    } = useFithubStore()

    const filteredRepos = getFilteredRepos()
    const selectedFactory = factories.find(f => f.id === selectedFactoryId)

    // Language/type colors (like GitHub language colors)
    const languageColors: Record<string, string> = {
        Motors: 'bg-amber-500',
        HVAC: 'bg-sky-500',
        Robotics: 'bg-purple-500',
        Paint: 'bg-rose-500',
        Welding: 'bg-orange-500',
        Assembly: 'bg-emerald-500',
        Vision: 'bg-indigo-500',
        Energy: 'bg-green-500',
        Analytics: 'bg-blue-500',
        Environment: 'bg-teal-500',
        General: 'bg-slate-500',
    }

    return (
        <div className="h-full flex flex-col">
            {/* Factory Selector */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-800">
                <div className="relative">
                    <button
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                        onClick={() => setSelectedFactory(selectedFactoryId ? null : factories[0]?.id || null)}
                    >
                        {selectedFactory ? (
                            <>
                                <span className="text-lg">{selectedFactory.avatar}</span>
                                <span className="truncate flex-1 text-left">{selectedFactory.displayName}</span>
                            </>
                        ) : (
                            <>
                                <span className="text-lg">🏭</span>
                                <span className="truncate flex-1 text-left">All Factories</span>
                            </>
                        )}
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                    </button>

                    {/* Simple dropdown - factories */}
                    {!selectedFactoryId && (
                        <div className="mt-2 space-y-1">
                            {factories.map(factory => (
                                <button
                                    key={factory.id}
                                    onClick={() => setSelectedFactory(factory.id)}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
                                >
                                    <span>{factory.avatar}</span>
                                    <span className="truncate">{factory.displayName}</span>
                                    <span className="ml-auto text-xs text-slate-400">{factory.location}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Top Repositories Header */}
            <div className="px-3 py-2 flex items-center justify-between">
                <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Top Workflows
                </h2>
                <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition">
                    <Plus className="w-4 h-4 text-slate-500" />
                </button>
            </div>

            {/* Search */}
            <div className="px-3 pb-2">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Find a workflow..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* Repos List */}
            <div className="flex-1 overflow-y-auto px-1">
                {filteredRepos.length === 0 ? (
                    <div className="px-3 py-4 text-center text-sm text-slate-400">
                        No workflows found
                    </div>
                ) : (
                    <ul className="space-y-0.5">
                        {filteredRepos.map(repo => {
                            const factory = factories.find(f => f.id === repo.factoryId)
                            return (
                                <li key={repo.id}>
                                    <button className="w-full flex items-start gap-2 px-2 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition group">
                                        {/* Repo icon */}
                                        <div className="mt-0.5 w-4 h-4 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs">
                                            📦
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            {/* Factory/Repo name */}
                                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                                                <span className="text-slate-500 dark:text-slate-400">{factory?.name || 'unknown'}/</span>
                                                {repo.name}
                                            </div>
                                            {/* Language dot + adoption metrics */}
                                            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                                {repo.language && (
                                                    <span className="flex items-center gap-1">
                                                        <span className={`w-2 h-2 rounded-full ${languageColors[repo.language] || 'bg-slate-400'}`} />
                                                        {repo.language}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-0.5" title="Facilities that adopted this workflow">
                                                    <Star className="w-3 h-3" />
                                                    {repo.stars} adopted
                                                </span>
                                                <span className="flex items-center gap-0.5" title="Facilities that adapted to their context">
                                                    <GitFork className="w-3 h-3" />
                                                    {repo.forks} adapted
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>

            {/* Show more link */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800">
                <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    Show more
                </button>
            </div>
        </div>
    )
}
