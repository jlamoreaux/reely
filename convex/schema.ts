import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  
  users: defineTable({
    // Auth linkage
    authUserId: v.optional(v.id("authUsers")),
    email: v.optional(v.string()),
    
    // Profile information
    username: v.string(),
    displayName: v.string(),
    bio: v.optional(v.string()),
    profileImage: v.optional(v.string()),
    
    // Verification
    isVerified: v.boolean(),
    verificationDomain: v.optional(v.string()),
    
    // Statistics (denormalized for performance)
    followerCount: v.number(),
    followingCount: v.number(),
    videoCount: v.number(),
    
    // Settings
    settings: v.object({
      isPrivate: v.boolean(),
      allowMessages: v.boolean(),
      allowComments: v.boolean(),
    }),
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_username", ["username"])
    .index("by_auth_user", ["authUserId"])
    .index("by_email", ["email"])
    .searchIndex("search_users", {
      searchField: "username",
      filterFields: ["isVerified"],
    }),

  videos: defineTable({
    // Owner
    userId: v.id("users"),
    
    // Media files
    videoUrl: v.string(),
    thumbnailUrl: v.string(),
    
    // Video properties
    duration: v.number(), // in seconds
    description: v.optional(v.string()),
    
    // Statistics (denormalized)
    viewCount: v.number(),
    likeCount: v.number(),
    commentCount: v.number(),
    shareCount: v.number(),
    
    // Status
    isDeleted: v.boolean(),
    status: v.union(
      v.literal("processing"),
      v.literal("ready"),
      v.literal("failed")
    ),
    
    // Metadata for anti-upload enforcement
    metadata: v.object({
      deviceType: v.string(),
      appVersion: v.string(),
      recordedAt: v.number(),
      signature: v.optional(v.string()), // For authenticity verification
    }),
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId", "createdAt"])
    .index("by_created", ["createdAt"])
    .index("by_status", ["status", "createdAt"])
    .index("by_popularity", ["likeCount", "createdAt"]),

  follows: defineTable({
    followerId: v.id("users"),
    followingId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_follower", ["followerId", "createdAt"])
    .index("by_following", ["followingId", "createdAt"])
    .index("unique_follow", ["followerId", "followingId"]),

  likes: defineTable({
    userId: v.id("users"),
    videoId: v.id("videos"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId", "createdAt"])
    .index("by_video", ["videoId", "createdAt"])
    .index("unique_like", ["userId", "videoId"]),

  comments: defineTable({
    userId: v.id("users"),
    videoId: v.id("videos"),
    content: v.string(),
    parentId: v.optional(v.id("comments")), // For replies
    likeCount: v.number(),
    isDeleted: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_video", ["videoId", "createdAt"])
    .index("by_user", ["userId", "createdAt"])
    .index("by_parent", ["parentId", "createdAt"]),

  bookmarks: defineTable({
    userId: v.id("users"),
    videoId: v.id("videos"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId", "createdAt"])
    .index("unique_bookmark", ["userId", "videoId"]),

  // Views table - for tracking video views
  views: defineTable({
    userId: v.optional(v.id("users")), // Optional for anonymous views
    videoId: v.id("videos"),
    watchTime: v.number(), // Seconds watched
    completed: v.boolean(), // Watched >80% of video
    sessionId: v.string(), // For duplicate detection
    createdAt: v.number(),
  })
    .index("by_video", ["videoId", "createdAt"])
    .index("by_user", ["userId", "createdAt"])
    .index("by_session", ["sessionId", "videoId"]),

  // Reports table - content moderation
  reports: defineTable({
    reporterId: v.id("users"),
    targetType: v.union(v.literal("video"), v.literal("user"), v.literal("comment")),
    targetId: v.string(), // Generic ID since it could be different types
    reason: v.union(
      v.literal("spam"),
      v.literal("inappropriate"),
      v.literal("copyright"),
      v.literal("harassment"),
      v.literal("false_info"),
      v.literal("other")
    ),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("reviewing"),
      v.literal("resolved"),
      v.literal("dismissed")
    ),
    createdAt: v.number(),
    resolvedAt: v.optional(v.number()),
  })
    .index("by_status", ["status", "createdAt"])
    .index("by_target", ["targetType", "targetId"])
    .index("by_reporter", ["reporterId"]),

  // Notifications table
  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("follow"),
      v.literal("like"),
      v.literal("comment"),
      v.literal("mention"),
      v.literal("video_ready"),
      v.literal("system")
    ),
    title: v.string(),
    message: v.string(),
    metadata: v.optional(v.any()), // Flexible data based on notification type
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId", "read", "createdAt"])
    .index("by_created", ["createdAt"]),

  // Search history table
  searchHistory: defineTable({
    userId: v.id("users"),
    query: v.string(),
    resultCount: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId", "createdAt"]),
});
