import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

// Follow/Unfollow functionality
export const toggleFollow = mutation({
  args: { targetUserId: v.id("users") },
  handler: async (ctx, args) => {
    const authUserId = await auth.getUserId(ctx);
    if (!authUserId) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", authUserId as any))
      .first();

    if (!currentUser) {
      throw new Error("User profile not found");
    }

    if (currentUser._id === args.targetUserId) {
      throw new Error("Cannot follow yourself");
    }

    const targetUser = await ctx.db.get(args.targetUserId);
    if (!targetUser) {
      throw new Error("Target user not found");
    }

    // Check if already following
    const existingFollow = await ctx.db
      .query("follows")
      .withIndex("unique_follow", (q) => 
        q.eq("followerId", currentUser._id).eq("followingId", args.targetUserId)
      )
      .first();

    if (existingFollow) {
      // Unfollow
      await ctx.db.delete(existingFollow._id);
      
      // Update counts
      await ctx.db.patch(currentUser._id, {
        followingCount: Math.max(0, currentUser.followingCount - 1),
      });
      await ctx.db.patch(args.targetUserId, {
        followerCount: Math.max(0, targetUser.followerCount - 1),
      });

      return { action: "unfollowed" };
    } else {
      // Follow
      await ctx.db.insert("follows", {
        followerId: currentUser._id,
        followingId: args.targetUserId,
        createdAt: Date.now(),
      });

      // Update counts
      await ctx.db.patch(currentUser._id, {
        followingCount: currentUser.followingCount + 1,
      });
      await ctx.db.patch(args.targetUserId, {
        followerCount: targetUser.followerCount + 1,
      });

      return { action: "followed" };
    }
  },
});

// Check if following
export const isFollowing = query({
  args: { targetUserId: v.id("users") },
  handler: async (ctx, args) => {
    const authUserId = await auth.getUserId(ctx);
    if (!authUserId) {
      return false;
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", authUserId as any))
      .first();

    if (!currentUser) {
      return false;
    }

    const follow = await ctx.db
      .query("follows")
      .withIndex("unique_follow", (q) => 
        q.eq("followerId", currentUser._id).eq("followingId", args.targetUserId)
      )
      .first();

    return !!follow;
  },
});

// Get followers
export const getFollowers = query({
  args: { 
    userId: v.id("users"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_following", (q) => q.eq("followingId", args.userId))
      .order("desc")
      .take(limit);

    const followers = await Promise.all(
      follows.map(async (follow) => {
        const user = await ctx.db.get(follow.followerId);
        return user;
      })
    );

    return followers.filter(Boolean);
  },
});

// Get following
export const getFollowing = query({
  args: { 
    userId: v.id("users"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
      .order("desc")
      .take(limit);

    const following = await Promise.all(
      follows.map(async (follow) => {
        const user = await ctx.db.get(follow.followingId);
        return user;
      })
    );

    return following.filter(Boolean);
  },
});

// Like/Unlike video
export const toggleLike = mutation({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    const authUserId = await auth.getUserId(ctx);
    if (!authUserId) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", authUserId as any))
      .first();

    if (!currentUser) {
      throw new Error("User profile not found");
    }

    const video = await ctx.db.get(args.videoId);
    if (!video || video.isDeleted) {
      throw new Error("Video not found");
    }

    // Check if already liked
    const existingLike = await ctx.db
      .query("likes")
      .withIndex("unique_like", (q) => 
        q.eq("userId", currentUser._id).eq("videoId", args.videoId)
      )
      .first();

    if (existingLike) {
      // Unlike
      await ctx.db.delete(existingLike._id);
      
      // Update video like count
      await ctx.db.patch(args.videoId, {
        likeCount: Math.max(0, video.likeCount - 1),
      });

      return { action: "unliked" };
    } else {
      // Like
      await ctx.db.insert("likes", {
        userId: currentUser._id,
        videoId: args.videoId,
        createdAt: Date.now(),
      });

      // Update video like count
      await ctx.db.patch(args.videoId, {
        likeCount: video.likeCount + 1,
      });

      return { action: "liked" };
    }
  },
});

// Check if video is liked
export const isLiked = query({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    const authUserId = await auth.getUserId(ctx);
    if (!authUserId) {
      return false;
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", authUserId as any))
      .first();

    if (!currentUser) {
      return false;
    }

    const like = await ctx.db
      .query("likes")
      .withIndex("unique_like", (q) => 
        q.eq("userId", currentUser._id).eq("videoId", args.videoId)
      )
      .first();

    return !!like;
  },
});

// Get users who liked a video
export const getVideoLikes = query({
  args: { 
    videoId: v.id("videos"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_video", (q) => q.eq("videoId", args.videoId))
      .order("desc")
      .take(limit);

    const users = await Promise.all(
      likes.map(async (like) => {
        const user = await ctx.db.get(like.userId);
        return user;
      })
    );

    return users.filter(Boolean);
  },
});

// Toggle bookmark
export const toggleBookmark = mutation({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    const authUserId = await auth.getUserId(ctx);
    if (!authUserId) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", authUserId as any))
      .first();

    if (!currentUser) {
      throw new Error("User profile not found");
    }

    const video = await ctx.db.get(args.videoId);
    if (!video || video.isDeleted) {
      throw new Error("Video not found");
    }

    // Check if already bookmarked
    const existingBookmark = await ctx.db
      .query("bookmarks")
      .withIndex("unique_bookmark", (q) => 
        q.eq("userId", currentUser._id).eq("videoId", args.videoId)
      )
      .first();

    if (existingBookmark) {
      // Remove bookmark
      await ctx.db.delete(existingBookmark._id);
      return { action: "unbookmarked" };
    } else {
      // Add bookmark
      await ctx.db.insert("bookmarks", {
        userId: currentUser._id,
        videoId: args.videoId,
        createdAt: Date.now(),
      });
      return { action: "bookmarked" };
    }
  },
});

// Get user's bookmarked videos
export const getUserBookmarks = query({
  args: { 
    limit: v.optional(v.number()),
    cursor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const authUserId = await auth.getUserId(ctx);
    if (!authUserId) {
      return { videos: [], hasMore: false };
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", authUserId as any))
      .first();

    if (!currentUser) {
      return { videos: [], hasMore: false };
    }

    const limit = args.limit || 12;
    const cursor = args.cursor || Date.now();

    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", currentUser._id))
      .filter((q) => q.lt(q.field("createdAt"), cursor))
      .order("desc")
      .take(limit);

    const videos = await Promise.all(
      bookmarks.map(async (bookmark) => {
        const video = await ctx.db.get(bookmark.videoId);
        if (!video || video.isDeleted) return null;
        
        const user = await ctx.db.get(video.userId);
        return { ...video, user };
      })
    );

    const validVideos = videos.filter(Boolean);

    return {
      videos: validVideos,
      hasMore: bookmarks.length === limit,
    };
  },
});