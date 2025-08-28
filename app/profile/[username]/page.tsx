"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";

export default function ProfilePage() {
  const { username } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  
  const user = useQuery(api.users.getUserByUsername, { 
    username: username as string 
  });
  
  const currentUser = useQuery(api.users.getCurrentUser);
  const isFollowing = useQuery(
    api.social.isFollowing,
    user ? { targetUserId: user._id } : "skip"
  );
  
  const userVideos = useQuery(
    api.videos.getUserVideos,
    user ? { userId: user._id, limit: 12 } : "skip"
  );
  
  const toggleFollow = useMutation(api.social.toggleFollow);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const handleFollow = async () => {
    if (!user) return;
    setIsFollowLoading(true);
    try {
      await toggleFollow({ targetUserId: user._id });
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  const isOwnProfile = currentUser?._id === user._id;

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

      {/* Profile Section */}
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start gap-6">
            {/* Profile Picture */}
            <div className="w-24 h-24 bg-gray-300 rounded-full flex-shrink-0"></div>
            
            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{user.displayName}</h2>
                {user.isVerified && (
                  <svg
                    className="w-6 h-6 text-blue-500"
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
              
              <p className="text-gray-600 mb-4">@{user.username}</p>
              
              {user.bio && (
                <p className="text-gray-700 mb-4">{user.bio}</p>
              )}
              
              {/* Stats */}
              <div className="flex items-center gap-6 mb-4">
                <div>
                  <span className="font-bold">{user.videoCount}</span>
                  <span className="text-gray-600 ml-1">videos</span>
                </div>
                <div>
                  <span className="font-bold">{user.followerCount}</span>
                  <span className="text-gray-600 ml-1">followers</span>
                </div>
                <div>
                  <span className="font-bold">{user.followingCount}</span>
                  <span className="text-gray-600 ml-1">following</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              {!isOwnProfile && isAuthenticated && (
                <button
                  onClick={handleFollow}
                  disabled={isFollowLoading}
                  className={`px-6 py-2 rounded-lg font-medium transition ${
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
              
              {isOwnProfile && (
                <Link
                  href="/settings"
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                >
                  Edit Profile
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Videos Grid */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Videos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userVideos?.videos.map((video) => (
              <Link key={video._id} href={`/video/${video._id}`}>
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
                  
                  <div className="p-3">
                    {video.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {video.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{video.viewCount} views</span>
                      <span>{video.likeCount} likes</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {userVideos?.videos.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {isOwnProfile
                  ? "You haven't uploaded any videos yet"
                  : "No videos yet"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}