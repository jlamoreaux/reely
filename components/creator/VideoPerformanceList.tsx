"use client";

import { Id } from "@/convex/_generated/dataModel";

interface VideoPerformanceListProps {
  userId: Id<"users"> | null;
  timeRange: string;
}

// Mock data for demonstration
const mockVideos = [
  {
    id: "1",
    thumbnail: "/api/placeholder/120/160",
    title: "Morning routine authenticity",
    views: 45234,
    likes: 3421,
    comments: 234,
    engagement: 8.2,
    trend: "up",
  },
  {
    id: "2",
    thumbnail: "/api/placeholder/120/160",
    title: "Real talk about creativity",
    views: 38921,
    likes: 2890,
    comments: 189,
    engagement: 7.9,
    trend: "up",
  },
  {
    id: "3",
    thumbnail: "/api/placeholder/120/160",
    title: "Behind the scenes",
    views: 28456,
    likes: 1923,
    comments: 156,
    engagement: 7.3,
    trend: "down",
  },
];

export default function VideoPerformanceList({ 
  userId, 
  timeRange 
}: VideoPerformanceListProps) {
  // In a real app, this would fetch data using userId and timeRange
  
  return (
    <div className="space-y-4">
      {mockVideos.map((video) => (
        <div
          key={video.id}
          className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          {/* Thumbnail */}
          <div className="w-20 h-28 bg-gray-300 rounded-lg flex-shrink-0">
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              📹
            </div>
          </div>
          
          {/* Video Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {video.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {video.views.toLocaleString()} views
            </p>
          </div>
          
          {/* Stats */}
          <div className="flex gap-6 text-sm">
            <div className="text-center">
              <p className="text-gray-600">Likes</p>
              <p className="font-semibold">{video.likes.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600">Comments</p>
              <p className="font-semibold">{video.comments}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600">Engagement</p>
              <p className="font-semibold flex items-center gap-1">
                {video.engagement}%
                {video.trend === "up" ? (
                  <span className="text-green-600">↑</span>
                ) : (
                  <span className="text-red-600">↓</span>
                )}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}