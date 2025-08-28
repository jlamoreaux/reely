"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Id } from "@/convex/_generated/dataModel";

export default function VideoPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  
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
  
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);

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

  if (!video) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Video not found</p>
      </div>
    );
  }

  const isOwnVideo = currentUser?._id === video.user?._id;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold text-green-600">Reely</h1>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link
              href="/upload"
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
            >
              Upload Video
            </Link>
            
            {currentUser && (
              <Link
                href={`/profile/${currentUser.username}`}
                className="text-gray-700 hover:text-gray-900"
              >
                Profile
              </Link>
            )}
            
            {isAuthenticated && (
              <button
                onClick={() => signOut().then(() => router.push("/signin"))}
                className="text-gray-500 hover:text-gray-700"
              >
                Sign Out
              </button>
            )}
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-lg aspect-[9/16] max-h-[80vh] relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-white opacity-50"
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
          </div>

          {/* Video Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Creator Info */}
              <div className="mb-6">
                <Link href={`/profile/${video.user?.username}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                    <div>
                      <p className="font-medium">{video.user?.displayName}</p>
                      <p className="text-sm text-gray-500">@{video.user?.username}</p>
                    </div>
                    {video.user?.isVerified && (
                      <svg
                        className="w-5 h-5 text-blue-500"
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
                </Link>
                
                {!isOwnVideo && isAuthenticated && (
                  <button
                    onClick={handleFollow}
                    disabled={isFollowLoading}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition ${
                      isFollowing
                        ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        : "bg-green-600 text-white hover:bg-green-700"
                    } disabled:opacity-50`}
                  >
                    {isFollowLoading
                      ? "Loading..."
                      : isFollowing
                      ? "Following"
                      : "Follow"}
                  </button>
                )}
              </div>

              {/* Description */}
              {video.description && (
                <div className="mb-6">
                  <p className="text-gray-700">{video.description}</p>
                </div>
              )}

              {/* Stats */}
              <div className="mb-6 py-4 border-y border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Views</span>
                  <span className="font-medium">{video.viewCount}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500">Likes</span>
                  <span className="font-medium">{video.likeCount}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500">Comments</span>
                  <span className="font-medium">{video.commentCount}</span>
                </div>
              </div>

              {/* Action Buttons */}
              {isAuthenticated && (
                <div className="flex gap-2">
                  <button
                    onClick={handleLike}
                    disabled={isLikeLoading}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                      isLiked
                        ? "bg-red-100 text-red-600 hover:bg-red-200"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } disabled:opacity-50`}
                  >
                    {isLiked ? "❤️ Liked" : "🤍 Like"}
                  </button>
                  
                  <button
                    onClick={handleBookmark}
                    disabled={isBookmarkLoading}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50"
                  >
                    🔖 Save
                  </button>
                  
                  <button
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                  >
                    📤 Share
                  </button>
                </div>
              )}

              {/* Metadata */}
              <div className="mt-6 text-xs text-gray-500">
                <p>Uploaded {new Date(video.createdAt).toLocaleDateString()}</p>
                <p>Duration: {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}