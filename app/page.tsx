export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-5xl font-bold text-slate-900 mb-2">
            TRIPOLAR
          </h1>
          <p className="text-xl text-slate-600">
            Industrial Digital Twin Platform
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Real-time monitoring and predictive analytics for industrial systems
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Quick Access to Playgrounds */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            🎮 Component Playgrounds
          </h2>
          <p className="text-slate-600 mb-6">
            Test and interact with individual components in isolation.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Timeline Playground */}
            <div className="group bg-white rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-lg transition">
              <div className="p-6">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Timeline Component
                </h3>
                <p className="text-slate-600 text-sm mb-4">
                  Financial-style time series visualization with historical data,
                  predictions, and confidence intervals. Supports zoom levels and
                  real-time streaming.
                </p>

                <div className="space-y-2 mb-6 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">✓</span>
                    <span>Brownian motion data generation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">✓</span>
                    <span>5 zoom levels (minute to year)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">✓</span>
                    <span>Pan/navigation controls</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">✓</span>
                    <span>Auto-streaming simulation</span>
                  </div>
                </div>

                <a
                  href="/playground/timeline"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition"
                >
                  Open Playground →
                </a>
              </div>
            </div>

            {/* Placeholder for Workflow */}
            <div className="group bg-white rounded-lg border border-slate-200 opacity-60">
              <div className="p-6">
                <div className="text-4xl mb-3">🔄</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Workflow Canvas
                </h3>
                <p className="text-slate-600 text-sm mb-4">
                  Node-based workflow builder with real-time preview. Coming in
                  Sprint 2.
                </p>

                <div className="px-4 py-2 bg-slate-100 text-slate-600 rounded font-medium inline-block text-sm">
                  Coming Soon
                </div>
              </div>
            </div>

            {/* Placeholder for 3D */}
            <div className="group bg-white rounded-lg border border-slate-200 opacity-60">
              <div className="p-6">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Digital Twin 3D
                </h3>
                <p className="text-slate-600 text-sm mb-4">
                  3D visualization of industrial systems synchronized with
                  Timeline. Coming in Sprint 3.
                </p>

                <div className="px-4 py-2 bg-slate-100 text-slate-600 rounded font-medium inline-block text-sm">
                  Coming Soon
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Documentation */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              📚 Documentation
            </h3>
            <p className="text-slate-600 text-sm mb-4">
              Detailed guides and technical specifications for all components.
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/docs"
                  className="text-blue-600 hover:underline"
                >
                  → Documentation Index
                </a>
              </li>
              <li>
                <a
                  href="/docs/timeline.md"
                  className="text-blue-600 hover:underline"
                >
                  → Timeline Component Guide
                </a>
              </li>
              <li>
                <a
                  href="/README.md"
                  className="text-blue-600 hover:underline"
                >
                  → Project README
                </a>
              </li>
              <li>
                <a
                  href="/CHANGELOG.md"
                  className="text-blue-600 hover:underline"
                >
                  → Version History
                </a>
              </li>
            </ul>
          </div>

          {/* Project Info */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              ℹ️ Project Information
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-slate-600">Version:</span>
                <span className="font-mono text-slate-900 ml-2">0.1.0</span>
              </div>
              <div>
                <span className="text-slate-600">Status:</span>
                <span className="font-mono text-green-600 ml-2">In Development</span>
              </div>
              <div>
                <span className="text-slate-600">Framework:</span>
                <span className="font-mono text-slate-900 ml-2">Next.js 16.1.6</span>
              </div>
              <div>
                <span className="text-slate-600">Language:</span>
                <span className="font-mono text-slate-900 ml-2">TypeScript 5.9</span>
              </div>
              <div>
                <span className="text-slate-600">Styling:</span>
                <span className="font-mono text-slate-900 ml-2">Tailwind CSS 4.1</span>
              </div>
            </div>
          </div>
        </section>

        {/* Architecture Overview */}
        <section className="bg-white rounded-lg border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            🏗️ Architecture
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Components</h3>
              <p className="text-slate-600 text-sm">
                Reusable UI components in <code className="bg-slate-100 px-2 py-1 rounded text-xs">/components</code>
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Hooks & Logic</h3>
              <p className="text-slate-600 text-sm">
                Business logic in <code className="bg-slate-100 px-2 py-1 rounded text-xs">/lib/hooks</code>
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Types & Config</h3>
              <p className="text-slate-600 text-sm">
                TypeScript types in <code className="bg-slate-100 px-2 py-1 rounded text-xs">/lib/types</code>
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-sm text-slate-500">
          <p>TRIPOLAR Industrial Digital Twin © 2024 | Sprint 1 - v0.1.0</p>
        </div>
      </footer>
    </div>
  );
}
