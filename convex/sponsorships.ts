import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Accept sponsorship guidelines
export const acceptGuidelines = mutation({
  args: {
    userId: v.id("users"),
    version: v.string(),
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
    
    // Check if already accepted this version
    const existing = await ctx.db
      .query("sponsorshipAgreements")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .order("desc")
      .first();
    
    if (existing && existing.version === args.version) {
      return { message: "Guidelines already accepted" };
    }
    
    // Record acceptance
    await ctx.db.insert("sponsorshipAgreements", {
      userId: args.userId,
      version: args.version,
      acceptedAt: Date.now(),
      ipAddress: ctx.request?.headers?.get("x-forwarded-for") || undefined,
    });
    
    return { message: "Guidelines accepted successfully" };
  },
});

// Check if user has accepted current guidelines
export const hasAcceptedGuidelines = query({
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
    
    const currentVersion = "1.0"; // This would be stored in config
    
    const agreement = await ctx.db
      .query("sponsorshipAgreements")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .order("desc")
      .first();
    
    return {
      hasAccepted: agreement?.version === currentVersion,
      acceptedAt: agreement?.acceptedAt,
      version: agreement?.version,
    };
  },
});