"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useConvexAuth } from "convex/react";
import AuthenticatedLayout from "@/components/layouts/AuthenticatedLayout";
import { Card, Text, Button, Avatar, PageContainer } from "@/components/ui";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { PlayCircleIcon } from "@heroicons/react/24/outline";

export default function ProfilePage() {
  const { username } = useParams();
  const { isAuthenticated } = useConvexAuth();
  
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
      <AuthenticatedLayout className="flex items-center justify-center min-h-[80vh]">
        <Text color="tertiary">User not found</Text>
      </AuthenticatedLayout>
    );
  }

  const isOwnProfile = currentUser?._id === user._id;

  return (
    <AuthenticatedLayout>
      <PageContainer maxWidth="6xl">
      {/* Profile Header */}
      <Card className="mb-8" padding="lg">
        <div className="flex items-start gap-6">
          {/* Profile Picture */}
          <Avatar size="xl" />
          
          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Text as="h1" size="3xl" weight="medium">{user.displayName}</Text>
              {user.isVerified && (
                <CheckCircleIcon className="w-7 h-7 text-sage-500" />
              )}
            </div>
            
            <Text color="tertiary" className="mb-4">@{user.username}</Text>
            
            {user.bio && (
              <Text color="secondary" className="mb-6 max-w-2xl">{user.bio}</Text>
            )}
            
            {/* Stats */}
            <div className="flex items-center gap-8 mb-6">
              <div>
                <Text weight="semibold" size="lg" as="span">{user.videoCount}</Text>
                <Text color="tertiary" as="span" className="ml-2">videos</Text>
              </div>
              <div>
                <Text weight="semibold" size="lg" as="span">{user.followerCount}</Text>
                <Text color="tertiary" as="span" className="ml-2">followers</Text>
              </div>
              <div>
                <Text weight="semibold" size="lg" as="span">{user.followingCount}</Text>
                <Text color="tertiary" as="span" className="ml-2">following</Text>
              </div>
            </div>
            
            {/* Action Buttons */}
            {!isOwnProfile && isAuthenticated && (
              <Button
                onClick={handleFollow}
                disabled={isFollowLoading}
                variant={isFollowing ? "secondary" : "primary"}
                size="md"
              >
                {isFollowLoading ? "Loading..." : isFollowing ? "Following" : "Follow"}
              </Button>
            )}
            
            {isOwnProfile && (
              <Button
                as={Link}
                href="/settings"
                variant="secondary"
                size="md"
              >
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Videos Section */}
      <div className="space-y-6">
        <Text as="h2" size="2xl" weight="medium">Videos</Text>
        
        {userVideos?.videos && userVideos.videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userVideos.videos.map((video) => (
              <Link key={video._id} href={`/video/${video._id}`}>
                <Card 
                  className="overflow-hidden hover:shadow-medium transition-all duration-300 cursor-pointer" 
                  padding="none"
                >
                  {/* Thumbnail placeholder */}
                  <div className="aspect-[9/16] bg-sage-100/50 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PlayCircleIcon className="w-12 h-12 text-sage-400/40" />
                    </div>
                  </div>
                  
                  <div className="p-4">
                    {video.description && (
                      <Text size="sm" color="secondary" className="mb-3 line-clamp-2">
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
            ))}
          </div>
        ) : (
          <Card className="text-center py-16">
            <Text color="tertiary" size="lg">
              {isOwnProfile
                ? "You haven't uploaded any videos yet"
                : "No videos yet"}
            </Text>
          </Card>
        )}
      </div>
      </PageContainer>
    </AuthenticatedLayout>
  );
}