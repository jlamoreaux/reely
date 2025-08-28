import Link from "next/link";

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream-300">
      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 min-h-screen bg-white border-r border-gray-200">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-sage-600 mb-6">
              Creator Studio
            </h2>
            <nav className="space-y-2">
              <Link
                href="/creator"
                className="block px-4 py-2 rounded-lg hover:bg-sage-50 text-gray-700 transition-colors"
              >
                📊 Analytics Overview
              </Link>
              <Link
                href="/creator/audience"
                className="block px-4 py-2 rounded-lg hover:bg-sage-50 text-gray-700 transition-colors"
              >
                👥 Audience Insights
              </Link>
              <Link
                href="/creator/best-time"
                className="block px-4 py-2 rounded-lg hover:bg-sage-50 text-gray-700 transition-colors"
              >
                ⏰ Best Time to Post
              </Link>
              <Link
                href="/creator/earnings"
                className="block px-4 py-2 rounded-lg hover:bg-sage-50 text-gray-700 transition-colors"
              >
                💰 Earnings & Tips
              </Link>
              <Link
                href="/creator/schedule"
                className="block px-4 py-2 rounded-lg hover:bg-sage-50 text-gray-700 transition-colors"
              >
                📅 Scheduled Posts
              </Link>
              <Link
                href="/creator/live"
                className="block px-4 py-2 rounded-lg hover:bg-sage-50 text-gray-700 transition-colors"
              >
                🎥 Live Streaming
              </Link>
              <Link
                href="/creator/collaborations"
                className="block px-4 py-2 rounded-lg hover:bg-sage-50 text-gray-700 transition-colors"
              >
                🤝 Collaborations
              </Link>
              <Link
                href="/creator/badges"
                className="block px-4 py-2 rounded-lg hover:bg-sage-50 text-gray-700 transition-colors"
              >
                🏆 Badges & Achievements
              </Link>
              <Link
                href="/creator/guidelines"
                className="block px-4 py-2 rounded-lg hover:bg-sage-50 text-gray-700 transition-colors"
              >
                📜 Sponsorship Guidelines
              </Link>
            </nav>
          </div>
        </aside>
        
        {/* Main Content Area */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}