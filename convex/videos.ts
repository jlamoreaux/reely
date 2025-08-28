import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

export const uploadVideo = mutation({
  args: {
    videoUrl: v.string(),
    thumbnailUrl: v.string(),
    duration: v.number(),
    description: v.optional(v.string()),
    deviceMetadata: v.object({
      deviceType: v.string(),
      appVersion: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const authUserId = await auth.getUserId(ctx);
    if (!authUserId) {
      throw new Error("Not authenticated");
    }

    // Get the user profile
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", authUserId as any))
      .first();

    if (!user) {
      throw new Error("User profile not found. Please complete your profile first.");
    }

    // Create video record
    const videoId = await ctx.db.insert("videos", {
      userId: user._id,
      videoUrl: args.videoUrl,
      thumbnailUrl: args.thumbnailUrl,
      duration: args.duration,
      description: args.description,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      isDeleted: false,
      status: "ready",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: {
        ...args.deviceMetadata,
        recordedAt: Date.now(),
      },
    });

    // Update user's video count
    await ctx.db.patch(user._id, {
      videoCount: (user.videoCount || 0) + 1,
    });

    return videoId;
  },
});

export const getVideoById = query({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.videoId);
    if (!video || video.isDeleted) {
      return null;
    }

    const user = await ctx.db.get(video.userId);

    return {
      ...video,
      user,
    };
  },
});

// Separate mutation to record a video view
export const recordView = mutation({
  args: { 
    videoId: v.id("videos"),
    watchTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const authUserId = await auth.getUserId(ctx);
    
    const video = await ctx.db.get(args.videoId);
    if (!video || video.isDeleted) {
      throw new Error("Video not found");
    }

    // Increment view count
    await ctx.db.patch(args.videoId, {
      viewCount: video.viewCount + 1,
    });

    // Record view in views table if user is authenticated
    if (authUserId) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_auth_user", (q) => q.eq("authUserId", authUserId as any))
        .first();
      
      if (user) {
        await ctx.db.insert("views", {
          userId: user._id,
          videoId: args.videoId,
          watchTime: args.watchTime || 0,
          completed: false,
          sessionId: `${user._id}-${Date.now()}`,
          createdAt: Date.now(),
        });
      }
    }

    return { success: true };
  },
});

export const getFeedVideos = query({
  args: {
    feedType: v.union(v.literal("following"), v.literal("discover")),
    cursor: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const authUserId = await auth.getUserId(ctx);
    const limit = args.limit || 10;
    const cursor = args.cursor || Date.now();

    if (args.feedType === "following" && authUserId) {
      // Get current user
      const currentUser = await ctx.db
        .query("users")
        .withIndex("by_auth_user", (q) => q.eq("authUserId", authUserId as any))
        .first();

      if (!currentUser) {
        return { videos: [], hasMore: false };
      }

      // Get list of users the current user follows
      const follows = await ctx.db
        .query("follows")
        .withIndex("by_follower", (q) => q.eq("followerId", currentUser._id))
        .collect();

      const followingIds = follows.map((f) => f.followingId);
      
      // Get videos from followed users
      const allVideos = [];
      for (const userId of followingIds) {
        const userVideos = await ctx.db
          .query("videos")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .filter((q) => 
            q.and(
              q.eq(q.field("isDeleted"), false),
              q.lt(q.field("createdAt"), cursor)
            )
          )
          .order("desc")
          .take(limit);
        allVideos.push(...userVideos);
      }

      // Sort all videos by createdAt and take the limit
      const sortedVideos = allVideos
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit);

      // Fetch user data for each video
      const videosWithUsers = await Promise.all(
        sortedVideos.map(async (video) => {
          const user = await ctx.db.get(video.userId);
          return { ...video, user };
        })
      );

      return {
        videos: videosWithUsers,
        hasMore: sortedVideos.length === limit,
      };
    } else {
      // Discovery feed - show popular/recent videos
      const videos = await ctx.db
        .query("videos")
        .withIndex("by_created")
        .filter((q) => 
          q.and(
            q.eq(q.field("isDeleted"), false),
            q.lt(q.field("createdAt"), cursor)
          )
        )
        .order("desc")
        .take(limit);

      // Fetch user data for each video
      const videosWithUsers = await Promise.all(
        videos.map(async (video) => {
          const user = await ctx.db.get(video.userId);
          return { ...video, user };
        })
      );

      return {
        videos: videosWithUsers,
        hasMore: videos.length === limit,
      };
    }
  },
});

export const getUserVideos = query({
  args: { 
    userId: v.id("users"),
    cursor: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 12;
    const cursor = args.cursor || Date.now();

    const videos = await ctx.db
      .query("videos")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => 
        q.and(
          q.eq(q.field("isDeleted"), false),
          q.lt(q.field("createdAt"), cursor)
        )
      )
      .order("desc")
      .take(limit);

    const user = await ctx.db.get(args.userId);

    const videosWithUser = videos.map((video) => ({
      ...video,
      user,
    }));

    return {
      videos: videosWithUser,
      hasMore: videos.length === limit,
    };
  },
});

export const deleteVideo = mutation({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    const authUserId = await auth.getUserId(ctx);
    if (!authUserId) {
      throw new Error("Not authenticated");
    }

    const video = await ctx.db.get(args.videoId);
    if (!video) {
      throw new Error("Video not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", authUserId as any))
      .first();

    if (!user || video.userId !== user._id) {
      throw new Error("Not authorized to delete this video");
    }

    // Soft delete the video
    await ctx.db.patch(args.videoId, {
      isDeleted: true,
    });

    // Update user's video count
    await ctx.db.patch(user._id, {
      videoCount: Math.max(0, (user.videoCount || 1) - 1),
    });

    return { success: true };
  },
});