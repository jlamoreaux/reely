import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

// Generate upload URL for video/thumbnail storage
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const authUserId = await auth.getUserId(ctx);
    if (!authUserId) {
      throw new Error("Not authenticated");
    }

    // Generate and return upload URL
    return await ctx.storage.generateUploadUrl();
  },
});

// Upload video with authentication and validation
export const uploadAuthenticatedVideo = mutation({
  args: {
    videoStorageId: v.string(),
    thumbnailStorageId: v.string(),
    duration: v.number(),
    description: v.optional(v.string()),
    metadata: v.object({
      recordedAt: v.number(),
      uploadedAt: v.number(),
      deviceInfo: v.object({
        userAgent: v.string(),
        platform: v.string(),
        screenResolution: v.string(),
        timezone: v.string(),
      }),
      recordingSession: v.string(),
    }),
    signature: v.object({
      hash: v.string(),
      size: v.number(),
      deviceFingerprint: v.string(),
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
      .withIndex("by_auth_user", (q) => q.eq("authUserId", authUserId))
      .first();

    if (!user) {
      throw new Error("User profile not found. Please complete your profile first.");
    }

    // Validate upload timing (must be within 60 seconds of recording)
    const uploadDelay = args.metadata.uploadedAt - args.metadata.recordedAt;
    if (uploadDelay > 60000) {
      throw new Error("Video must be uploaded within 60 seconds of recording");
    }

    // Validate video duration
    if (args.duration < 5) {
      throw new Error("Video must be at least 5 seconds long");
    }
    if (args.duration > 180) {
      throw new Error("Video cannot exceed 3 minutes");
    }

    // Get storage URLs for the uploaded files
    const videoUrl = await ctx.storage.getUrl(args.videoStorageId);
    const thumbnailUrl = await ctx.storage.getUrl(args.thumbnailStorageId);

    if (!videoUrl || !thumbnailUrl) {
      throw new Error("Failed to process uploaded files");
    }

    // Create video record with authentication metadata
    const videoId = await ctx.db.insert("videos", {
      userId: user._id,
      videoUrl,
      thumbnailUrl,
      duration: args.duration,
      description: args.description,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      tipCount: 0,
      isDeleted: false,
      isLive: false,
      isDuet: false,
      status: "processing",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: {
        ...args.metadata.deviceInfo,
        recordedAt: args.metadata.recordedAt,
        uploadedAt: args.metadata.uploadedAt,
        recordingSession: args.metadata.recordingSession,
        signature: args.signature,
      },
    });

    // Update user's video count
    await ctx.db.patch(user._id, {
      videoCount: (user.videoCount || 0) + 1,
    });

    // Mark video as ready after basic validation
    // In production, you might want to process the video first
    await ctx.db.patch(videoId, {
      status: "ready",
    });

    return videoId;
  },
});

// Stage a video upload (upload immediately but don't publish)
export const stageVideoUpload = mutation({
  args: {
    videoStorageId: v.string(),
    thumbnailStorageId: v.string(),
    duration: v.number(),
    metadata: v.object({
      recordedAt: v.number(),
      uploadedAt: v.number(),
      deviceInfo: v.object({
        userAgent: v.string(),
        platform: v.string(),
        screenResolution: v.string(),
        timezone: v.string(),
      }),
      recordingSession: v.string(),
    }),
    signature: v.object({
      hash: v.string(),
      size: v.number(),
      deviceFingerprint: v.string(),
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
      .withIndex("by_auth_user", (q) => q.eq("authUserId", authUserId))
      .first();

    if (!user) {
      throw new Error("User profile not found. Please complete your profile first.");
    }

    // Validate upload timing (must be within 60 seconds of recording)
    const uploadDelay = args.metadata.uploadedAt - args.metadata.recordedAt;
    if (uploadDelay > 60000) {
      throw new Error("Video must be uploaded within 60 seconds of recording");
    }

    // Validate video duration
    if (args.duration < 5) {
      throw new Error("Video must be at least 5 seconds long");
    }
    if (args.duration > 180) {
      throw new Error("Video cannot exceed 3 minutes");
    }

    // Get storage URLs for the uploaded files
    const videoUrl = await ctx.storage.getUrl(args.videoStorageId);
    const thumbnailUrl = await ctx.storage.getUrl(args.thumbnailStorageId);

    if (!videoUrl || !thumbnailUrl) {
      throw new Error("Failed to process uploaded files");
    }

    // Create staged video record (not published yet)
    const stagedVideoId = await ctx.db.insert("videos", {
      userId: user._id,
      videoUrl,
      thumbnailUrl,
      duration: args.duration,
      description: undefined, // Will be set on confirm
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      tipCount: 0,
      isDeleted: false,
      isLive: false,
      isDuet: false,
      status: "staged", // New status for staged videos
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: {
        ...args.metadata.deviceInfo,
        recordedAt: args.metadata.recordedAt,
        uploadedAt: args.metadata.uploadedAt,
        recordingSession: args.metadata.recordingSession,
        signature: args.signature,
        storageIds: {
          video: args.videoStorageId,
          thumbnail: args.thumbnailStorageId,
        },
      },
    });

    return {
      stagedVideoId,
      videoStorageId: args.videoStorageId,
      thumbnailStorageId: args.thumbnailStorageId,
    };
  },
});

// Confirm and publish a staged video
export const confirmVideoUpload = mutation({
  args: {
    stagedVideoId: v.id("videos"),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const authUserId = await auth.getUserId(ctx);
    if (!authUserId) {
      throw new Error("Not authenticated");
    }

    // Get the staged video
    const stagedVideo = await ctx.db.get(args.stagedVideoId);
    if (!stagedVideo) {
      throw new Error("Staged video not found");
    }

    // Verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", authUserId))
      .first();

    if (!user || stagedVideo.userId !== user._id) {
      throw new Error("Not authorized to confirm this video");
    }

    // Update video to published status
    await ctx.db.patch(args.stagedVideoId, {
      status: "ready",
      description: args.description,
      updatedAt: Date.now(),
    });

    // Update user's video count
    await ctx.db.patch(user._id, {
      videoCount: (user.videoCount || 0) + 1,
    });

    return args.stagedVideoId;
  },
});

// Cancel a staged video upload
export const cancelVideoUpload = mutation({
  args: {
    stagedVideoId: v.id("videos"),
    videoStorageId: v.string(),
    thumbnailStorageId: v.string(),
  },
  handler: async (ctx, args) => {
    const authUserId = await auth.getUserId(ctx);
    if (!authUserId) {
      throw new Error("Not authenticated");
    }

    // Get the staged video
    const stagedVideo = await ctx.db.get(args.stagedVideoId);
    if (!stagedVideo) {
      // Already deleted, just try to clean up storage
      try {
        await ctx.storage.delete(args.videoStorageId);
        await ctx.storage.delete(args.thumbnailStorageId);
      } catch (err) {
        // Storage might already be deleted
      }
      return { success: true };
    }

    // Verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", authUserId))
      .first();

    if (!user || stagedVideo.userId !== user._id) {
      throw new Error("Not authorized to cancel this video");
    }

    // Delete the video record
    await ctx.db.delete(args.stagedVideoId);

    // Delete files from storage
    try {
      await ctx.storage.delete(args.videoStorageId);
      await ctx.storage.delete(args.thumbnailStorageId);
    } catch (err) {
      console.error("Failed to delete storage files:", err);
    }

    return { success: true };
  },
});

// Legacy upload function (to be deprecated)
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
      .withIndex("by_auth_user", (q) => q.eq("authUserId", authUserId))
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
      tipCount: 0,
      isDeleted: false,
      isLive: false,
      isDuet: false,
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
    
    // Note: View count increment should be done via the incrementViewCount mutation
    // Queries are read-only in Convex

    return {
      ...video,
      user,
    };
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
        .withIndex("by_auth_user", (q) => q.eq("authUserId", authUserId))
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
              q.eq(q.field("status"), "ready"),
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
            q.neq(q.field("status"), "staged"),
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
          q.eq(q.field("status"), "ready"),
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

// Increment view count mutation
export const incrementViewCount = mutation({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.videoId);
    if (!video || video.isDeleted) {
      return null;
    }

    await ctx.db.patch(args.videoId, {
      viewCount: video.viewCount + 1,
    });

    return video.viewCount + 1;
  },
});

// Debug query to see all videos
export const debugAllVideos = query({
  args: {},
  handler: async (ctx) => {
    const videos = await ctx.db
      .query("videos")
      .order("desc")
      .take(20);
    
    return videos.map(video => ({
      ...video,
      _id: video._id,
      status: video.status,
      createdAt: video.createdAt,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
      description: video.description,
    }));
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
      .withIndex("by_auth_user", (q) => q.eq("authUserId", authUserId))
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