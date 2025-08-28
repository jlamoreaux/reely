import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Send a tip to a creator
export const sendTip = mutation({
  args: {
    toUserId: v.id("users"),
    videoId: v.optional(v.id("videos")),
    amount: v.number(),
    currency: v.string(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Validate amount
    if (args.amount < 1) {
      throw new Error("Minimum tip amount is $1");
    }
    if (args.amount > 500) {
      throw new Error("Maximum tip amount is $500");
    }
    
    // Get recipient profile
    const recipientProfile = await ctx.db.get(args.toUserId);
    if (!recipientProfile) {
      throw new Error("Recipient not found");
    }
    
    // Check if tips are enabled for this creator
    if (!recipientProfile.settings.allowTips) {
      throw new Error("This creator has not enabled tips");
    }
    
    // Create tip record
    const tipId = await ctx.db.insert("tips", {
      fromUserId: identity.subject as Id<"users">,
      toUserId: args.toUserId,
      videoId: args.videoId,
      amount: args.amount,
      currency: args.currency,
      message: args.message,
      status: "pending",
      createdAt: Date.now(),
    });
    
    // Track tip event if associated with a video
    if (args.videoId) {
      const video = await ctx.db.get(args.videoId);
      if (video) {
        const now = new Date();
        await ctx.db.insert("analytics", {
          videoId: args.videoId,
          profileId: video.profileId,
          eventType: "tip",
          viewerId: identity.subject as Id<"users">,
          timestamp: Date.now(),
          hour: now.getHours(),
          dayOfWeek: now.getDay(),
        });
        
        // Update video tip count
        await ctx.db.patch(args.videoId, {
          tipCount: video.tipCount + 1,
        });
      }
    }
    
    return { tipId, message: "Tip sent successfully!" };
  },
});

// Process tip payment (would be called after Stripe payment)
export const processTipPayment = mutation({
  args: {
    tipId: v.id("tips"),
    stripeIntentId: v.string(),
    status: v.union(v.literal("completed"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    const tip = await ctx.db.get(args.tipId);
    if (!tip) throw new Error("Tip not found");
    
    // Update tip status
    await ctx.db.patch(args.tipId, {
      stripeIntentId: args.stripeIntentId,
      status: args.status,
    });
    
    // If successful, update creator earnings
    if (args.status === "completed") {
      const month = new Date().toISOString().slice(0, 7); // YYYY-MM format
      
      // Check if earnings record exists for this month
      const existingEarnings = await ctx.db
        .query("creatorEarnings")
        .withIndex("by_user_month", q => 
          q.eq("userId", tip.toUserId)
           .eq("month", month)
        )
        .first();
      
      if (existingEarnings) {
        await ctx.db.patch(existingEarnings._id, {
          tipEarnings: existingEarnings.tipEarnings + tip.amount,
          totalEarnings: existingEarnings.totalEarnings + tip.amount,
        });
      } else {
        await ctx.db.insert("creatorEarnings", {
          userId: tip.toUserId,
          month,
          viewEarnings: 0,
          engagementEarnings: 0,
          tipEarnings: tip.amount,
          sponsorshipEarnings: 0,
          totalEarnings: tip.amount,
          paidOut: false,
        });
      }
    }
  },
});

// Get tips received by a creator
export const getReceivedTips = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
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
    
    const limit = args.limit || 50;
    
    const tips = await ctx.db
      .query("tips")
      .withIndex("by_recipient", q => q.eq("toUserId", args.userId))
      .order("desc")
      .take(limit);
    
    // Get sender information
    const tipsWithSenders = await Promise.all(
      tips.map(async (tip) => {
        const sender = await ctx.db.get(tip.fromUserId);
        const video = tip.videoId ? await ctx.db.get(tip.videoId) : null;
        
        return {
          ...tip,
          senderName: sender?.name || "Anonymous",
          videoTitle: video?.description || "Direct tip",
        };
      })
    );
    
    return tipsWithSenders;
  },
});

// Get tips sent by a user
export const getSentTips = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const limit = args.limit || 50;
    
    const tips = await ctx.db
      .query("tips")
      .withIndex("by_sender", q => 
        q.eq("fromUserId", identity.subject as Id<"users">)
      )
      .order("desc")
      .take(limit);
    
    // Get recipient information
    const tipsWithRecipients = await Promise.all(
      tips.map(async (tip) => {
        const recipient = await ctx.db.get(tip.toUserId);
        const video = tip.videoId ? await ctx.db.get(tip.videoId) : null;
        
        return {
          ...tip,
          recipientName: recipient?.displayName || "Unknown",
          videoTitle: video?.description || "Direct tip",
        };
      })
    );
    
    return tipsWithRecipients;
  },
});

// Get tip statistics for a creator
export const getTipStats = query({
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
    
    // Get all completed tips
    const tips = await ctx.db
      .query("tips")
      .withIndex("by_recipient", q => q.eq("toUserId", args.userId))
      .filter(q => q.eq(q.field("status"), "completed"))
      .collect();
    
    // Calculate statistics
    const stats = {
      totalTips: tips.length,
      totalAmount: tips.reduce((sum, tip) => sum + tip.amount, 0),
      averageTip: tips.length > 0 
        ? tips.reduce((sum, tip) => sum + tip.amount, 0) / tips.length 
        : 0,
      largestTip: tips.length > 0 
        ? Math.max(...tips.map(tip => tip.amount)) 
        : 0,
      uniqueTippers: new Set(tips.map(tip => tip.fromUserId)).size,
      thisMonth: 0,
      lastMonth: 0,
    };
    
    // Calculate monthly stats
    const now = new Date();
    const thisMonth = now.toISOString().slice(0, 7);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      .toISOString().slice(0, 7);
    
    tips.forEach(tip => {
      const tipMonth = new Date(tip.createdAt).toISOString().slice(0, 7);
      if (tipMonth === thisMonth) {
        stats.thisMonth += tip.amount;
      } else if (tipMonth === lastMonth) {
        stats.lastMonth += tip.amount;
      }
    });
    
    return stats;
  },
});

// Toggle tips enabled/disabled for a profile
export const toggleTips = mutation({
  args: {
    userId: v.id("users"),
    enabled: v.boolean(),
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
    
    // Update settings
    await ctx.db.patch(args.userId, {
      settings: {
        ...user.settings,
        allowTips: args.enabled,
      },
    });
    
    return { success: true };
  },
});