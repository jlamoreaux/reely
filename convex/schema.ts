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
    
    // Verification and creator status
    isVerified: v.boolean(),
    isCreator: v.boolean(),
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
      allowTips: v.boolean(),
    }),
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_username", ["username"])
    .index("by_auth_user", ["authUserId"])
    .index("by_email", ["email"])
    .index("by_is_creator", ["isCreator"])
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
    tipCount: v.number(),
    
    // Status
    isDeleted: v.boolean(),
    status: v.union(
      v.literal("processing"),
      v.literal("ready"),
      v.literal("failed")
    ),
    
    // Creator features
    isLive: v.boolean(),
    isDuet: v.boolean(),
    duetWithId: v.optional(v.id("videos")),
    scheduledAt: v.optional(v.number()),
    publishedAt: v.optional(v.number()),
    
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
    .index("by_scheduled", ["scheduledAt"])
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

  // CREATOR FEATURES - Phase 4 additions

  // Analytics events for creator dashboard
  analytics: defineTable({
    videoId: v.id("videos"),
    userId: v.id("users"), // Creator user ID
    eventType: v.union(
      v.literal("view"),
      v.literal("like"),
      v.literal("comment"),
      v.literal("share"),
      v.literal("tip"),
      v.literal("watch_time")
    ),
    viewerId: v.optional(v.id("users")),
    viewerDemographics: v.optional(v.object({
      country: v.optional(v.string()),
      region: v.optional(v.string()),
      deviceType: v.optional(v.string()),
      ageRange: v.optional(v.string()),
    })),
    watchDuration: v.optional(v.number()),
    timestamp: v.number(),
    hour: v.number(), // 0-23 for best time analysis
    dayOfWeek: v.number(), // 0-6 for best time analysis
  })
    .index("by_video", ["videoId", "timestamp"])
    .index("by_user", ["userId", "timestamp"])
    .index("by_user_event", ["userId", "eventType", "timestamp"])
    .index("by_time", ["userId", "hour", "dayOfWeek"]),

  // Creator performance trends
  creatorStats: defineTable({
    userId: v.id("users"),
    date: v.string(), // YYYY-MM-DD format
    totalViews: v.number(),
    totalLikes: v.number(),
    totalComments: v.number(),
    totalShares: v.number(),
    totalTips: v.number(),
    totalWatchTime: v.number(),
    uniqueViewers: v.number(),
    newFollowers: v.number(),
    avgEngagementRate: v.number(),
    topPerformingVideoId: v.optional(v.id("videos")),
  })
    .index("by_user_date", ["userId", "date"]),

  // Tips and monetization
  tips: defineTable({
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
    videoId: v.optional(v.id("videos")),
    amount: v.number(),
    currency: v.string(),
    message: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    stripeIntentId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_sender", ["fromUserId", "createdAt"])
    .index("by_recipient", ["toUserId", "createdAt"])
    .index("by_video", ["videoId"]),

  // Creator fund and earnings
  creatorEarnings: defineTable({
    userId: v.id("users"),
    month: v.string(), // YYYY-MM format
    viewEarnings: v.number(),
    engagementEarnings: v.number(),
    tipEarnings: v.number(),
    sponsorshipEarnings: v.number(),
    totalEarnings: v.number(),
    paidOut: v.boolean(),
    paidOutAt: v.optional(v.number()),
  })
    .index("by_user_month", ["userId", "month"]),

  // Premium badges and features
  premiumBadges: defineTable({
    userId: v.id("users"),
    badgeType: v.union(
      v.literal("verified"),
      v.literal("top_creator"),
      v.literal("rising_star"),
      v.literal("community_favorite"),
      v.literal("consistent_creator")
    ),
    earnedAt: v.number(),
    expiresAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"]),

  // Live streaming sessions
  liveStreams: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    streamKey: v.string(),
    streamUrl: v.string(),
    status: v.union(
      v.literal("scheduled"),
      v.literal("live"),
      v.literal("ended"),
      v.literal("cancelled")
    ),
    scheduledAt: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
    viewerCount: v.number(),
    peakViewerCount: v.number(),
  })
    .index("by_user", ["userId", "scheduledAt"])
    .index("by_status", ["status"])
    .index("by_scheduled", ["scheduledAt"]),

  // Duet collaborations
  duetRequests: defineTable({
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
    originalVideoId: v.id("videos"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("expired")
    ),
    message: v.optional(v.string()),
    createdAt: v.number(),
    respondedAt: v.optional(v.number()),
  })
    .index("by_sender", ["fromUserId", "createdAt"])
    .index("by_recipient", ["toUserId", "status", "createdAt"]),

  // Scheduled posts
  scheduledPosts: defineTable({
    userId: v.id("users"),
    videoData: v.string(), // Base64 or storage reference
    thumbnailUrl: v.string(),
    duration: v.number(),
    description: v.optional(v.string()),
    scheduledFor: v.number(),
    status: v.union(
      v.literal("scheduled"),
      v.literal("published"),
      v.literal("cancelled"),
      v.literal("failed")
    ),
    createdAt: v.number(),
  })
    .index("by_user", ["userId", "scheduledFor"])
    .index("by_scheduled", ["scheduledFor", "status"]),

  // Sponsored content guidelines acceptance
  sponsorshipAgreements: defineTable({
    userId: v.id("users"),
    version: v.string(),
    acceptedAt: v.number(),
    ipAddress: v.optional(v.string()),
  })
    .index("by_user", ["userId", "acceptedAt"]),

  // Best time to post analysis
  postPerformance: defineTable({
    userId: v.id("users"),
    hour: v.number(), // 0-23
    dayOfWeek: v.number(), // 0-6
    avgViews: v.number(),
    avgEngagement: v.number(),
    sampleSize: v.number(),
    lastUpdated: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_time", ["userId", "hour", "dayOfWeek"]),
});