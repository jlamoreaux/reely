"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import StatsCard from "@/components/creator/StatsCard";
import PerformanceChart from "@/components/creator/PerformanceChart";
import VideoPerformanceList from "@/components/creator/VideoPerformanceList";

type TimeRange = "day" | "week" | "month" | "year";

export default function CreatorDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  
  // In a real app, you'd get the userId from the authenticated user
  // For now, we'll use a placeholder
  useEffect(() => {
    // This would normally come from auth context
    // setProfileId(userProfile._id);
  }, []);
  
  const analytics = useQuery(
    api.analytics.getCreatorAnalytics,
    userId ? { userId, timeRange } : "skip"
  );
  
  const trends = useQuery(
    api.analytics.getPerformanceTrends,
    userId ? { userId, period: timeRange === "day" ? "week" : timeRange } : "skip"
  );
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Track your content performance and audience engagement
          </p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex gap-2 bg-white rounded-lg p-1">
          {(["day", "week", "month", "year"] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-md capitalize transition-colors ${
                timeRange === range
                  ? "bg-sage-400 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Views"
          value={analytics?.totalViews || 0}
          change={trends?.summary?.viewsChange}
          icon="👁️"
        />
        <StatsCard
          title="Engagement Rate"
          value={`${(analytics?.engagementRate || 0).toFixed(1)}%`}
          change={trends?.summary?.engagementChange}
          icon="💫"
        />
        <StatsCard
          title="Total Watch Time"
          value={formatWatchTime(analytics?.totalWatchTime || 0)}
          icon="⏱️"
        />
        <StatsCard
          title="Unique Viewers"
          value={analytics?.uniqueViewers || 0}
          icon="👥"
        />
      </div>
      
      {/* Engagement Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Likes"
          value={analytics?.totalLikes || 0}
          change={trends?.summary?.likesChange}
          icon="❤️"
          size="small"
        />
        <StatsCard
          title="Comments"
          value={analytics?.totalComments || 0}
          icon="💬"
          size="small"
        />
        <StatsCard
          title="Shares"
          value={analytics?.totalShares || 0}
          icon="🔄"
          size="small"
        />
      </div>
      
      {/* Performance Chart */}
      {trends && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Performance Trends
          </h2>
          <PerformanceChart data={trends.trends} />
        </div>
      )}
      
      {/* Top Performing Videos */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Top Performing Videos
        </h2>
        <VideoPerformanceList userId={userId} timeRange={timeRange} />
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="bg-sage-400 text-white rounded-lg p-4 hover:bg-sage-500 transition-colors">
          <span className="text-2xl mb-2 block">📹</span>
          <span className="font-semibold">Record New Video</span>
        </button>
        <button className="bg-teal-600 text-white rounded-lg p-4 hover:bg-teal-700 transition-colors">
          <span className="text-2xl mb-2 block">📅</span>
          <span className="font-semibold">Schedule Post</span>
        </button>
        <button className="bg-purple-600 text-white rounded-lg p-4 hover:bg-purple-700 transition-colors">
          <span className="text-2xl mb-2 block">🎥</span>
          <span className="font-semibold">Start Live Stream</span>
        </button>
      </div>
    </div>
  );
}

function formatWatchTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}