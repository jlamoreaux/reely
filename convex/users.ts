import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

export const createOrUpdateUser = mutation({
  args: {
    username: v.string(),
    displayName: v.string(),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if username is already taken
    const existingUsername = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", userId))
      .first();

    if (existingUsername && existingUsername.authUserId !== userId) {
      throw new Error("Username already taken");
    }

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        username: args.username,
        displayName: args.displayName,
        bio: args.bio,
      });
      return existingUser._id;
    } else {
      // Create new user
      const newUserId = await ctx.db.insert("users", {
        authUserId: userId,
        username: args.username,
        displayName: args.displayName,
        bio: args.bio,
        isVerified: false,
        createdAt: Date.now(),
        followerCount: 0,
        followingCount: 0,
        videoCount: 0,
      });
      return newUserId;
    }
  },
});

export const getCurrentUser = query({
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", userId))
      .first();

    return user;
  },
});

export const getUserByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    return user;
  },
});

export const searchUsers = query({
  args: { 
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const searchTerm = args.searchTerm.toLowerCase();

    // Get all users and filter by username or display name
    const users = await ctx.db
      .query("users")
      .take(100);

    const filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm) ||
        user.displayName.toLowerCase().includes(searchTerm)
    );

    return filtered.slice(0, limit);
  },
});

export const updateProfileImage = mutation({
  args: {
    profileImage: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      profileImage: args.profileImage,
    });

    return user._id;
  },
});