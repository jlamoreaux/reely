import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

// Track a view event when a video is watched
export const trackView = mutation({
  args: {
    videoId: v.id("videos"),
    watchDuration: v.optional(v.number()),
    viewerDemographics: v.optional(v.object({
      country: v.optional(v.string()),
      region: v.optional(v.string()),
      deviceType: v.optional(v.string()),
      ageRange: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const video = await ctx.db.get(args.videoId);
    if (!video) throw new Error("Video not found");
    
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    
    // Track the view event
    await ctx.db.insert("analytics", {
      videoId: args.videoId,
      userId: video.userId,
      eventType: "view",
      viewerId: identity.subject as Id<"users">,
      viewerDemographics: args.viewerDemographics,
      watchDuration: args.watchDuration,
      timestamp: Date.now(),
      hour,
      dayOfWeek,
    });
    
    // Increment video view count
    await ctx.db.patch(args.videoId, {
      viewCount: video.viewCount + 1,
    });
  },
});

// Track engagement events (like, comment, share, tip)
export const trackEngagement = mutation({
  args: {
    videoId: v.id("videos"),
    eventType: v.union(
      v.literal("like"),
      v.literal("comment"),
      v.literal("share"),
      v.literal("tip")
    ),
    amount: v.optional(v.number()), // For tips
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const video = await ctx.db.get(args.videoId);
    if (!video) throw new Error("Video not found");
    
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    
    // Track the engagement event
    await ctx.db.insert("analytics", {
      videoId: args.videoId,
      userId: video.userId,
      eventType: args.eventType,
      viewerId: identity.subject as Id<"users">,
      timestamp: Date.now(),
      hour,
      dayOfWeek,
    });
    
    // Update video counters
    const updates: Partial<Doc<"videos">> = {};
    switch (args.eventType) {
      case "like":
        updates.likeCount = video.likeCount + 1;
        break;
      case "comment":
        updates.commentCount = video.commentCount + 1;
        break;
      case "share":
        updates.shareCount = video.shareCount + 1;
        break;
      case "tip":
        updates.tipCount = video.tipCount + 1;
        break;
    }
    
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(args.videoId, updates);
    }
  },
});

// Get creator analytics for dashboard
export const getCreatorAnalytics = query({
  args: {
    userId: v.id("users"),
    timeRange: v.union(
      v.literal("day"),
      v.literal("week"),
      v.literal("month"),
      v.literal("year")
    ),
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
    
    // Calculate time range
    const now = Date.now();
    let startTime = now;
    switch (args.timeRange) {
      case "day":
        startTime = now - 24 * 60 * 60 * 1000;
        break;
      case "week":
        startTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case "month":
        startTime = now - 30 * 24 * 60 * 60 * 1000;
        break;
      case "year":
        startTime = now - 365 * 24 * 60 * 60 * 1000;
        break;
    }
    
    // Get analytics events in time range
    const events = await ctx.db
      .query("analytics")
      .withIndex("by_user", q => 
        q.eq("userId", args.userId)
         .gte("timestamp", startTime)
      )
      .collect();
    
    // Calculate metrics
    const metrics = {
      totalViews: events.filter(e => e.eventType === "view").length,
      totalLikes: events.filter(e => e.eventType === "like").length,
      totalComments: events.filter(e => e.eventType === "comment").length,
      totalShares: events.filter(e => e.eventType === "share").length,
      totalTips: events.filter(e => e.eventType === "tip").length,
      uniqueViewers: new Set(events.filter(e => e.viewerId).map(e => e.viewerId)).size,
      totalWatchTime: events
        .filter(e => e.eventType === "view" && e.watchDuration)
        .reduce((sum, e) => sum + (e.watchDuration || 0), 0),
      engagementRate: 0,
    };
    
    // Calculate engagement rate
    if (metrics.totalViews > 0) {
      metrics.engagementRate = 
        ((metrics.totalLikes + metrics.totalComments + metrics.totalShares) / 
         metrics.totalViews) * 100;
    }
    
    return metrics;
  },
});

// Get audience demographics
export const getAudienceDemographics = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const profile = await ctx.db.get(args.userId);
    if (!profile) throw new Error("Profile not found");
    
    // Check authorization
    if (user._id !== identity.subject) {
      throw new Error("Unauthorized");
    }
    
    // Get recent viewer demographics
    const recentEvents = await ctx.db
      .query("analytics")
      .withIndex("by_user", q => 
        q.eq("userId", args.userId)
         .gte("timestamp", Date.now() - 30 * 24 * 60 * 60 * 1000)
      )
      .filter(q => q.eq(q.field("eventType"), "view"))
      .collect();
    
    // Aggregate demographics
    const demographics = {
      countries: {} as Record<string, number>,
      regions: {} as Record<string, number>,
      deviceTypes: {} as Record<string, number>,
      ageRanges: {} as Record<string, number>,
    };
    
    recentEvents.forEach(event => {
      if (event.viewerDemographics) {
        const demo = event.viewerDemographics;
        if (demo.country) {
          demographics.countries[demo.country] = 
            (demographics.countries[demo.country] || 0) + 1;
        }
        if (demo.region) {
          demographics.regions[demo.region] = 
            (demographics.regions[demo.region] || 0) + 1;
        }
        if (demo.deviceType) {
          demographics.deviceTypes[demo.deviceType] = 
            (demographics.deviceTypes[demo.deviceType] || 0) + 1;
        }
        if (demo.ageRange) {
          demographics.ageRanges[demo.ageRange] = 
            (demographics.ageRanges[demo.ageRange] || 0) + 1;
        }
      }
    });
    
    return demographics;
  },
});

// Get best time to post analysis
export const getBestTimeToPost = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const profile = await ctx.db.get(args.userId);
    if (!profile) throw new Error("Profile not found");
    
    // Check authorization
    if (user._id !== identity.subject) {
      throw new Error("Unauthorized");
    }
    
    // Get post performance data
    const performanceData = await ctx.db
      .query("postPerformance")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .collect();
    
    // If we have cached data, return it
    if (performanceData.length > 0) {
      // Sort by engagement rate
      const sorted = performanceData.sort((a, b) => b.avgEngagement - a.avgEngagement);
      
      // Get top 3 time slots
      const bestTimes = sorted.slice(0, 3).map(slot => ({
        hour: slot.hour,
        dayOfWeek: slot.dayOfWeek,
        avgViews: slot.avgViews,
        avgEngagement: slot.avgEngagement,
        dayName: getDayName(slot.dayOfWeek),
        timeString: getTimeString(slot.hour),
      }));
      
      return {
        bestTimes,
        heatmap: createHeatmapData(performanceData),
      };
    }
    
    // If no cached data, calculate from raw analytics
    const events = await ctx.db
      .query("analytics")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .collect();
    
    // Group by hour and day
    const timeSlots = {} as Record<string, {
      views: number;
      engagements: number;
    }>;
    
    events.forEach(event => {
      const key = `${event.hour}-${event.dayOfWeek}`;
      if (!timeSlots[key]) {
        timeSlots[key] = { views: 0, engagements: 0 };
      }
      
      if (event.eventType === "view") {
        timeSlots[key].views += 1;
      } else {
        timeSlots[key].engagements += 1;
      }
    });
    
    // Convert to array and sort
    const timeSlotArray = Object.entries(timeSlots).map(([key, data]) => {
      const [hour, day] = key.split("-").map(Number);
      return {
        hour,
        dayOfWeek: day,
        avgViews: data.views,
        avgEngagement: data.views > 0 ? (data.engagements / data.views) * 100 : 0,
        dayName: getDayName(day),
        timeString: getTimeString(hour),
      };
    });
    
    timeSlotArray.sort((a, b) => b.avgEngagement - a.avgEngagement);
    
    return {
      bestTimes: timeSlotArray.slice(0, 3),
      heatmap: createHeatmapData(timeSlotArray),
    };
  },
});

// Get performance trends over time
export const getPerformanceTrends = query({
  args: {
    userId: v.id("users"),
    period: v.union(v.literal("week"), v.literal("month"), v.literal("year")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const profile = await ctx.db.get(args.userId);
    if (!profile) throw new Error("Profile not found");
    
    // Check authorization
    if (user._id !== identity.subject) {
      throw new Error("Unauthorized");
    }
    
    // Determine date range
    const now = new Date();
    let startDate: Date;
    let groupBy: "day" | "week" | "month";
    
    switch (args.period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = "day";
        break;
      case "month":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupBy = "day";
        break;
      case "year":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        groupBy = "month";
        break;
    }
    
    // Get stats in date range
    const stats = await ctx.db
      .query("creatorStats")
      .withIndex("by_user_date", q => 
        q.eq("userId", args.userId)
         .gte("date", startDate.toISOString().split("T")[0])
      )
      .collect();
    
    // Format for chart display
    const trends = stats.map(stat => ({
      date: stat.date,
      views: stat.totalViews,
      likes: stat.totalLikes,
      comments: stat.totalComments,
      shares: stat.totalShares,
      tips: stat.totalTips,
      engagementRate: stat.avgEngagementRate,
      followers: stat.newFollowers,
    }));
    
    return {
      trends,
      summary: calculateSummary(trends),
    };
  },
});

// Helper functions
function getDayName(day: number): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[day];
}

function getTimeString(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

function createHeatmapData(data: any[]): any {
  const heatmap = Array(7).fill(null).map(() => Array(24).fill(0));
  
  data.forEach(slot => {
    if (slot.dayOfWeek >= 0 && slot.dayOfWeek < 7 && 
        slot.hour >= 0 && slot.hour < 24) {
      heatmap[slot.dayOfWeek][slot.hour] = slot.avgEngagement;
    }
  });
  
  return heatmap;
}

function calculateSummary(trends: any[]): any {
  if (trends.length === 0) return null;
  
  const latest = trends[trends.length - 1];
  const previous = trends[trends.length - 2];
  
  if (!previous) return null;
  
  return {
    viewsChange: ((latest.views - previous.views) / previous.views) * 100,
    likesChange: ((latest.likes - previous.likes) / previous.likes) * 100,
    engagementChange: latest.engagementRate - previous.engagementRate,
    followersChange: latest.followers - previous.followers,
  };
}

// Internal mutation to update daily stats (would be called by a cron job)
export const updateDailyStats = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Get all creator users
    const creators = await ctx.db
      .query("users")
      .withIndex("by_is_creator", q => q.eq("isCreator", true))
      .collect();
    
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const yesterdayStart = yesterday.setHours(0, 0, 0, 0);
    const yesterdayEnd = yesterday.setHours(23, 59, 59, 999);
    
    for (const creator of creators) {
      // Get yesterday's events
      const events = await ctx.db
        .query("analytics")
        .withIndex("by_user", q => 
          q.eq("userId", creator._id)
           .gte("timestamp", yesterdayStart)
           .lte("timestamp", yesterdayEnd)
        )
        .collect();
      
      // Calculate stats
      const stats = {
        userId: creator._id,
        date: today,
        totalViews: events.filter(e => e.eventType === "view").length,
        totalLikes: events.filter(e => e.eventType === "like").length,
        totalComments: events.filter(e => e.eventType === "comment").length,
        totalShares: events.filter(e => e.eventType === "share").length,
        totalTips: events.filter(e => e.eventType === "tip").length,
        totalWatchTime: events
          .filter(e => e.eventType === "view" && e.watchDuration)
          .reduce((sum, e) => sum + (e.watchDuration || 0), 0),
        uniqueViewers: new Set(events.filter(e => e.viewerId).map(e => e.viewerId)).size,
        newFollowers: 0, // Would need to track follows
        avgEngagementRate: 0,
        topPerformingVideoId: undefined,
      };
      
      // Calculate engagement rate
      if (stats.totalViews > 0) {
        stats.avgEngagementRate = 
          ((stats.totalLikes + stats.totalComments + stats.totalShares) / 
           stats.totalViews) * 100;
      }
      
      // Find top performing video
      const videoPerformance = {} as Record<string, number>;
      events.forEach(event => {
        const videoId = event.videoId;
        if (!videoPerformance[videoId]) {
          videoPerformance[videoId] = 0;
        }
        if (event.eventType !== "view") {
          videoPerformance[videoId] += 1;
        }
      });
      
      const topVideo = Object.entries(videoPerformance)
        .sort(([, a], [, b]) => b - a)[0];
      
      if (topVideo) {
        stats.topPerformingVideoId = topVideo[0] as Id<"videos">;
      }
      
      // Check if stats for this date already exist
      const existing = await ctx.db
        .query("creatorStats")
        .withIndex("by_user_date", q => 
          q.eq("userId", creator._id)
           .eq("date", today)
        )
        .first();
      
      if (existing) {
        await ctx.db.patch(existing._id, stats);
      } else {
        await ctx.db.insert("creatorStats", stats);
      }
    }
  },
});