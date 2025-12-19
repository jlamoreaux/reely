"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useConvexAuth } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import AuthenticatedLayout from "@/components/layouts/AuthenticatedLayout";
import { Card, Text, Button, Avatar, VideoPlayer, PageContainer } from "@/components/ui";
import { CommentsSection } from "@/components/social";
import { HeartIcon, BookmarkIcon, ShareIcon, PlayIcon, CheckCircleIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

export default function VideoPage() {
  const { id } = useParams();
  const { isAuthenticated } = useConvexAuth();
  
  const video = useQuery(api.videos.getVideoById, { 
    videoId: id as Id<"videos"> 
  });
  
  const currentUser = useQuery(api.users.getCurrentUser);
  const isLiked = useQuery(
    api.social.isLiked,
    video ? { videoId: video._id } : "skip"
  );
  
  const isFollowing = useQuery(
    api.social.isFollowing,
    video?.user ? { targetUserId: video.user._id } : "skip"
  );
  
  const toggleLike = useMutation(api.social.toggleLike);
  const toggleFollow = useMutation(api.social.toggleFollow);
  const toggleBookmark = useMutation(api.social.toggleBookmark);
  const addComment = useMutation(api.social.addComment);
  const toggleCommentLike = useMutation(api.social.toggleCommentLike);
  
  const comments = useQuery(
    api.social.getVideoComments,
    video ? { videoId: video._id, limit: 10 } : "skip"
  );
  
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoFit, setVideoFit] = useState<'auto' | 'contain' | 'cover'>('cover');

  const handleLike = async () => {
    if (!video || !isAuthenticated) return;
    setIsLikeLoading(true);
    try {
      await toggleLike({ videoId: video._id });
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!video?.user) return;
    setIsFollowLoading(true);
    try {
      await toggleFollow({ targetUserId: video.user._id });
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!video || !isAuthenticated) return;
    setIsBookmarkLoading(true);
    try {
      await toggleBookmark({ videoId: video._id });
    } finally {
      setIsBookmarkLoading(false);
    }
  };

  const handleAddComment = async (content: string) => {
    if (!video) return;
    await addComment({ videoId: video._id, content });
  };

  const handleLikeComment = async (commentId: string) => {
    await toggleCommentLike({ commentId: commentId as any });
  };

  if (!video) {
    return (
      <AuthenticatedLayout className="flex items-center justify-center min-h-[80vh]">
        <Text color="tertiary">Video not found</Text>
      </AuthenticatedLayout>
    );
  }

  const isOwnVideo = currentUser?._id === video.user?._id;

  return (
    <AuthenticatedLayout>
      <PageContainer maxWidth="4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Video Player and Info */}
          <div className="lg:col-span-2">
              <Card className="overflow-hidden bg-black relative" padding="none">
                <VideoPlayer
                  src={video.videoUrl}
                  poster={video.thumbnailUrl}
                  controls
                  autoPlay
                  playsInline
                  muted
                  aspectRatio="9:16"
                  fit={videoFit}
                  rounded
                  onError={(e) => {
                    console.error('Video playback error:', e);
                    setVideoError('Failed to load video');
                  }}
                  onLoadedMetadata={(e) => {
                    const videoElement = e.target as HTMLVideoElement;
                    console.log('Video metadata:', {
                      width: videoElement.videoWidth,
                      height: videoElement.videoHeight,
                      duration: videoElement.duration,
                      aspectRatio: videoElement.videoWidth / videoElement.videoHeight
                    });
                  }}
                />
                {/* Fit toggle button */}
                <button
                  onClick={() => {
                    setVideoFit(current => {
                      if (current === 'auto') return 'contain';
                      if (current === 'contain') return 'cover';
                      return 'auto';
                    });
                  }}
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors z-10"
                  title={`Current: ${videoFit} (click to change)`}
                >
                  {videoFit === 'cover' ? (
                    <ArrowsPointingInIcon className="w-5 h-5 text-white" />
                  ) : (
                    <ArrowsPointingOutIcon className="w-5 h-5 text-white" />
                  )}
                </button>
                {videoError && (
                  <div className="absolute inset-0 flex items-center justify-center text-white bg-black/80 z-10">
                    <Text>{videoError}</Text>
                  </div>
                )}
              </Card>
              
              {/* Video Info */}
              <div className="mt-6 space-y-4">
                {/* Creator Info */}
                <div className="flex items-center justify-between">
                  <Link href={`/profile/${video.user?.username}`}>
                    <div className="flex items-center gap-3 group">
                      <Avatar size="md" />
                      <div>
                        <Text weight="medium" className="group-hover:text-sage-700 transition-colors">
                          {video.user?.displayName}
                          {video.user?.isVerified && (
                            <CheckCircleIcon className="inline-block w-4 h-4 text-sage-500 ml-1" />
                          )}
                        </Text>
                        <Text size="sm" color="tertiary">@{video.user?.username}</Text>
                      </div>
                    </div>
                  </Link>
                  
                  {!isOwnVideo && isAuthenticated && (
                    <Button
                      onClick={handleFollow}
                      disabled={isFollowLoading}
                      variant={isFollowing ? "secondary" : "primary"}
                      size="sm"
                    >
                      {isFollowLoading ? "Loading..." : isFollowing ? "Following" : "Follow"}
                    </Button>
                  )}
                </div>

                {/* Description */}
                {video.description && (
                  <Text color="secondary">{video.description}</Text>
                )}

                {/* Stats and Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Text size="sm" color="tertiary">{video.viewCount.toLocaleString()} views</Text>
                    <Text size="sm" color="tertiary">•</Text>
                    <Text size="sm" color="tertiary">
                      {new Date(video.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </Text>
                  </div>
                  
                  {isAuthenticated && (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleLike}
                        disabled={isLikeLoading}
                        variant="ghost"
                        size="sm"
                        leftIcon={isLiked ? <HeartIconSolid className="w-5 h-5 text-red-500" /> : <HeartIcon className="w-5 h-5" />}
                      >
                        {video.likeCount > 0 && video.likeCount.toLocaleString()}
                      </Button>
                      
                      <Button
                        onClick={handleBookmark}
                        disabled={isBookmarkLoading}
                        variant="ghost"
                        size="sm"
                        leftIcon={<BookmarkIcon className="w-5 h-5" />}
                      />
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<ShareIcon className="w-5 h-5" />}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Comments Section */}
              <div className="mt-8">
                <CommentsSection
                  videoId={video._id}
                  comments={comments?.comments || []}
                  totalComments={video.commentCount}
                  isLoading={!comments}
                  onAddComment={isAuthenticated ? handleAddComment : undefined}
                  onLikeComment={handleLikeComment}
                  hasMore={comments?.hasMore}
                />
              </div>
            </div>
          </div>

          {/* Right column - Related videos or additional info */}
          <div className="lg:col-span-1">
            <Card>
              <Text weight="medium" className="mb-4">More from {video.user?.displayName}</Text>
              {/* TODO: Add related videos here */}
              <Text size="sm" color="tertiary">More videos coming soon...</Text>
            </Card>
          </div>
      </PageContainer>
    </AuthenticatedLayout>
  );
}