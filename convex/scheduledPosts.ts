import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Schedule a post for future publishing
export const schedulePost = mutation({
  args: {
    userId: v.id("users"),
    videoData: v.string(), // Base64 or storage reference
    thumbnailUrl: v.string(),
    duration: v.number(),
    description: v.optional(v.string()),
    scheduledFor: v.number(), // Timestamp
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    
    // Check if this is the authenticated user
    if (args.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }
    
    // Validate scheduled time is in the future
    if (args.scheduledFor <= Date.now()) {
      throw new Error("Scheduled time must be in the future");
    }
    
    // Check if user has too many scheduled posts
    const existingScheduled = await ctx.db
      .query("scheduledPosts")
      .withIndex("by_user", q => 
        q.eq("userId", args.userId)
         .gte("scheduledFor", Date.now())
      )
      .filter(q => q.eq(q.field("status"), "scheduled"))
      .collect();
    
    if (existingScheduled.length >= 10) {
      throw new Error("Maximum 10 scheduled posts allowed");
    }
    
    // Create scheduled post
    const scheduledPostId = await ctx.db.insert("scheduledPosts", {
      userId: args.userId,
      videoData: args.videoData,
      thumbnailUrl: args.thumbnailUrl,
      duration: args.duration,
      description: args.description,
      scheduledFor: args.scheduledFor,
      status: "scheduled",
      createdAt: Date.now(),
    });
    
    return { 
      scheduledPostId,
      message: `Post scheduled for ${new Date(args.scheduledFor).toLocaleString()}`
    };
  },
});

// Get scheduled posts for a profile
export const getScheduledPosts = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    
    // Check if this is the authenticated user
    if (args.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }
    
    const scheduledPosts = await ctx.db
      .query("scheduledPosts")
      .withIndex("by_user", q => 
        q.eq("userId", args.userId)
         .gte("scheduledFor", Date.now())
      )
      .filter(q => q.eq(q.field("status"), "scheduled"))
      .order("asc")
      .collect();
    
    return scheduledPosts.map(post => ({
      ...post,
      scheduledDate: new Date(post.scheduledFor).toLocaleDateString(),
      scheduledTime: new Date(post.scheduledFor).toLocaleTimeString(),
    }));
  },
});

// Cancel a scheduled post
export const cancelScheduledPost = mutation({
  args: {
    scheduledPostId: v.id("scheduledPosts"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const scheduledPost = await ctx.db.get(args.scheduledPostId);
    if (!scheduledPost) throw new Error("Scheduled post not found");
    
    const user = await ctx.db.get(scheduledPost.userId);
    if (!user) throw new Error("User not found");
    
    // Check if user owns this scheduled post
    if (scheduledPost.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }
    
    // Check if post is still scheduled
    if (scheduledPost.status !== "scheduled") {
      throw new Error("Post is no longer scheduled");
    }
    
    // Cancel the post
    await ctx.db.patch(args.scheduledPostId, {
      status: "cancelled",
    });
    
    return { message: "Scheduled post cancelled" };
  },
});

// Update a scheduled post
export const updateScheduledPost = mutation({
  args: {
    scheduledPostId: v.id("scheduledPosts"),
    description: v.optional(v.string()),
    scheduledFor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const scheduledPost = await ctx.db.get(args.scheduledPostId);
    if (!scheduledPost) throw new Error("Scheduled post not found");
    
    const user = await ctx.db.get(scheduledPost.userId);
    if (!user) throw new Error("User not found");
    
    // Check if user owns this scheduled post
    if (scheduledPost.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }
    
    // Check if post is still scheduled
    if (scheduledPost.status !== "scheduled") {
      throw new Error("Post is no longer scheduled");
    }
    
    // Validate new scheduled time if provided
    if (args.scheduledFor && args.scheduledFor <= Date.now()) {
      throw new Error("Scheduled time must be in the future");
    }
    
    // Update the post
    const updates: any = {};
    if (args.description !== undefined) updates.description = args.description;
    if (args.scheduledFor !== undefined) updates.scheduledFor = args.scheduledFor;
    
    await ctx.db.patch(args.scheduledPostId, updates);
    
    return { message: "Scheduled post updated" };
  },
});

// Internal mutation to publish scheduled posts (called by cron job)
export const publishScheduledPosts = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // Get posts that should be published
    const postsToPublish = await ctx.db
      .query("scheduledPosts")
      .withIndex("by_scheduled", q => 
        q.lte("scheduledFor", now)
         .eq("status", "scheduled")
      )
      .collect();
    
    for (const post of postsToPublish) {
      try {
        // Get user
        const user = await ctx.db.get(post.userId);
        if (!user) {
          await ctx.db.patch(post._id, { status: "failed" });
          continue;
        }
        
        // Create the video post
        const videoId = await ctx.db.insert("videos", {
          userId: post.userId,
          videoUrl: post.videoData, // This would be processed/uploaded
          thumbnailUrl: post.thumbnailUrl,
          duration: post.duration,
          description: post.description,
          viewCount: 0,
          likeCount: 0,
          commentCount: 0,
          shareCount: 0,
          tipCount: 0,
          isDeleted: false,
          isLive: false,
          isDuet: false,
          scheduledAt: post.scheduledFor,
          publishedAt: now,
          createdAt: now,
          metadata: {
            deviceType: "scheduled",
            appVersion: "1.0",
            recordedAt: post.createdAt,
          },
        });
        
        // Update scheduled post status
        await ctx.db.patch(post._id, {
          status: "published",
        });
        
        // Update profile video count
        await ctx.db.patch(post.userId, {
          videoCount: user.videoCount + 1,
        });
        
      } catch (error) {
        // Mark as failed if there's an error
        await ctx.db.patch(post._id, {
          status: "failed",
        });
      }
    }
  },
});

// Get scheduling analytics
export const getSchedulingAnalytics = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    
    // Check if this is the authenticated user
    if (args.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }
    
    // Get all scheduled posts
    const allScheduledPosts = await ctx.db
      .query("scheduledPosts")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .collect();
    
    // Calculate stats
    const stats = {
      totalScheduled: allScheduledPosts.filter(p => p.status === "scheduled").length,
      totalPublished: allScheduledPosts.filter(p => p.status === "published").length,
      totalCancelled: allScheduledPosts.filter(p => p.status === "cancelled").length,
      totalFailed: allScheduledPosts.filter(p => p.status === "failed").length,
      upcomingThisWeek: 0,
      mostScheduledDay: "",
      mostScheduledTime: "",
    };
    
    // Calculate upcoming this week
    const weekFromNow = Date.now() + 7 * 24 * 60 * 60 * 1000;
    stats.upcomingThisWeek = allScheduledPosts.filter(
      p => p.status === "scheduled" && 
           p.scheduledFor > Date.now() && 
           p.scheduledFor < weekFromNow
    ).length;
    
    // Find most popular scheduling times
    const dayFrequency: Record<string, number> = {};
    const hourFrequency: Record<number, number> = {};
    
    allScheduledPosts
      .filter(p => p.status === "published")
      .forEach(post => {
        const date = new Date(post.scheduledFor);
        const day = date.toLocaleDateString("en-US", { weekday: "long" });
        const hour = date.getHours();
        
        dayFrequency[day] = (dayFrequency[day] || 0) + 1;
        hourFrequency[hour] = (hourFrequency[hour] || 0) + 1;
      });
    
    // Find most frequent day
    const mostFrequentDay = Object.entries(dayFrequency)
      .sort(([, a], [, b]) => b - a)[0];
    if (mostFrequentDay) {
      stats.mostScheduledDay = mostFrequentDay[0];
    }
    
    // Find most frequent hour
    const mostFrequentHour = Object.entries(hourFrequency)
      .sort(([, a], [, b]) => b - a)[0];
    if (mostFrequentHour) {
      const hour = parseInt(mostFrequentHour[0]);
      stats.mostScheduledTime = hour === 0 ? "12 AM" : 
                                hour === 12 ? "12 PM" :
                                hour < 12 ? `${hour} AM` : 
                                `${hour - 12} PM`;
    }
    
    return stats;
  },
});