"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import Link from "next/link";

export default function Home() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const { signOut } = useAuthActions();
  const currentUser = useQuery(api.users.getCurrentUser);
  const [feedType, setFeedType] = useState<"discover" | "following">("discover");
  
  const feedData = useQuery(api.videos.getFeedVideos, {
    feedType,
    limit: 10,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/signin");
    }
    
    if (!isLoading && isAuthenticated && currentUser === null) {
      router.push("/onboarding");
    }
  }, [isAuthenticated, isLoading, currentUser, router]);

  if (isLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-green-600">Reely</h1>
          
          <nav className="flex items-center gap-6">
            <Link
              href="/upload"
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
            >
              Upload Video
            </Link>
            
            <Link
              href={`/profile/${currentUser.username}`}
              className="text-gray-700 hover:text-gray-900"
            >
              Profile
            </Link>
            
            <button
              onClick={() => signOut().then(() => router.push("/signin"))}
              className="text-gray-500 hover:text-gray-700"
            >
              Sign Out
            </button>
          </nav>
        </div>
      </header>

      {/* Feed Tabs */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setFeedType("discover")}
            className={`pb-3 px-1 font-medium transition ${
              feedType === "discover"
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => setFeedType("following")}
            className={`pb-3 px-1 font-medium transition ${
              feedType === "following"
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Following
          </button>
        </div>

        {/* Video Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feedData?.videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>

        {feedData?.videos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {feedType === "following"
                ? "Follow creators to see their videos here"
                : "No videos yet. Be the first to upload!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface VideoWithUser {
  _id: string;
  user?: {
    displayName: string;
    username: string;
    isVerified: boolean;
  } | null;
  description?: string;
  viewCount: number;
  likeCount: number;
}

function VideoCard({ video }: { video: VideoWithUser }) {
  return (
    <Link href={`/video/${video._id}`}>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
        {/* Thumbnail placeholder */}
        <div className="aspect-[9/16] bg-gray-200 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
        
        {/* Video info */}
        <div className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <div>
              <p className="font-medium text-sm">{video.user?.displayName}</p>
              <p className="text-xs text-gray-500">@{video.user?.username}</p>
            </div>
            {video.user?.isVerified && (
              <svg
                className="w-4 h-4 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          
          {video.description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {video.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{video.viewCount} views</span>
            <span>{video.likeCount} likes</span>
          </div>
        </div>
      </div>
    </Link>
  );
}