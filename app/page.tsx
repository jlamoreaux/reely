"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import AuthenticatedLayout from "@/components/layouts/AuthenticatedLayout";
import { Card, Text, PageContainer } from "@/components/ui";

export default function Home() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
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
      <AuthenticatedLayout className="flex items-center justify-center min-h-[80vh]">
        <Text color="tertiary">Loading...</Text>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <PageContainer maxWidth="6xl">
        {/* Feed Tabs */}
        <div className="mt-6 mb-6">
        <div className="flex gap-8 mb-6 border-b border-sage-200/50">
          <button
            onClick={() => setFeedType("discover")}
            className={`pb-4 px-1 font-medium transition-colors duration-200 ${
              feedType === "discover"
                ? "text-sage-700 border-b-2 border-sage-600"
                : "text-sage-500 hover:text-sage-700"
            }`}
          >
            <Text size="sm" weight={feedType === "discover" ? "medium" : "normal"}>
              Discover
            </Text>
          </button>
          <button
            onClick={() => setFeedType("following")}
            className={`pb-4 px-1 font-medium transition-colors duration-200 ${
              feedType === "following"
                ? "text-sage-700 border-b-2 border-sage-600"
                : "text-sage-500 hover:text-sage-700"
            }`}
          >
            <Text size="sm" weight={feedType === "following" ? "medium" : "normal"}>
              Following
            </Text>
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
            <Text size="lg" color="tertiary" weight="light" className="text-center">
              {feedType === "following"
                ? "Follow creators to see their videos here"
                : "No videos yet. Be the first to upload!"}
            </Text>
          </div>
        )}
        </div>
      </PageContainer>
    </AuthenticatedLayout>
  );
}

interface VideoWithUser {
  _id: string;
  user?: {
    displayName: string;
    username: string;
    isVerified: boolean;
  };
  description?: string;
  viewCount: number;
  likeCount: number;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
}

function VideoCard({ video }: { video: VideoWithUser }) {
  return (
    <Link href={`/video/${video._id}`}>
      <Card className="overflow-hidden hover:shadow-soft transition-all duration-300 cursor-pointer" padding="none">
        {/* Thumbnail */}
        <div className="aspect-[9/16] bg-black relative overflow-hidden">
          <img 
            src={video.thumbnailUrl} 
            alt={video.description || 'Video thumbnail'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* Duration overlay */}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
          </div>
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-sage-700 ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Video info */}
        <div className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-sage-200/50 rounded-full"></div>
            <div className="flex-1">
              <Text size="sm" weight="medium">{video.user?.displayName}</Text>
              <Text size="xs" color="tertiary">@{video.user?.username}</Text>
            </div>
            {video.user?.isVerified && (
              <svg
                className="w-4 h-4 text-sage-500"
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
            <Text size="sm" color="secondary" className="mb-2 line-clamp-2">
              {video.description}
            </Text>
          )}
          
          <div className="flex items-center gap-4">
            <Text size="xs" color="tertiary">{video.viewCount} views</Text>
            <Text size="xs" color="tertiary">{video.likeCount} likes</Text>
          </div>
        </div>
      </Card>
    </Link>
  );
}