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
      .withIndex("by_auth_user", (q) => q.eq("authUserId", authUserId))
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
        followingCount: Math.max(0, (currentUser.followingCount || 1) - 1),
      });
      await ctx.db.patch(args.targetUserId, {
        followerCount: Math.max(0, (targetUser.followerCount || 1) - 1),
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
        followingCount: (currentUser.followingCount || 0) + 1,
      });
      await ctx.db.patch(args.targetUserId, {
        followerCount: (targetUser.followerCount || 0) + 1,
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
      .withIndex("by_auth_user", (q) => q.eq("authUserId", authUserId))
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
      .withIndex("by_auth_user", (q) => q.eq("authUserId", authUserId))
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
      .withIndex("by_auth_user", (q) => q.eq("authUserId", authUserId))
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
      .withIndex("by_auth_user", (q) => q.eq("authUserId", authUserId))
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
      .withIndex("by_auth_user", (q) => q.eq("authUserId", authUserId))
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

// Add comment to video
export const addComment = mutation({
  args: { 
    videoId: v.id("videos"),
    content: v.string(),
    parentId: v.optional(v.id("comments"))
  },
  handler: async (ctx, args) => {
    const authUserId = await auth.getUserId(ctx);
    if (!authUserId) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", authUserId))
      .first();

    if (!currentUser) {
      throw new Error("User profile not found");
    }

    const video = await ctx.db.get(args.videoId);
    if (!video || video.isDeleted) {
      throw new Error("Video not found");
    }

    // Insert comment
    const commentId = await ctx.db.insert("comments", {
      userId: currentUser._id,
      videoId: args.videoId,
      content: args.content.trim(),
      parentId: args.parentId,
      likeCount: 0,
      isDeleted: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update video comment count
    await ctx.db.patch(args.videoId, {
      commentCount: video.commentCount + 1,
    });

    return commentId;
  },
});

// Get comments for a video
export const getVideoComments = query({
  args: {
    videoId: v.id("videos"),
    parentId: v.optional(v.id("comments")),
    cursor: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const cursor = args.cursor || Date.now();

    const authUserId = await auth.getUserId(ctx);
    let currentUser = null;
    if (authUserId) {
      currentUser = await ctx.db
        .query("users")
        .withIndex("by_auth_user", (q) => q.eq("authUserId", authUserId))
        .first();
    }

    // Get comments
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_video", (q) => q.eq("videoId", args.videoId))
      .filter((q) => {
        const conditions = [
          q.eq(q.field("isDeleted"), false),
          q.lt(q.field("createdAt"), cursor)
        ];
        if (args.parentId === undefined) {
          conditions.push(q.eq(q.field("parentId"), undefined));
        } else {
          conditions.push(q.eq(q.field("parentId"), args.parentId));
        }
        return q.and(...conditions);
      })
      .order("desc")
      .take(limit);

    // Get comment data with user info and like status
    const commentsWithData = await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        
        // Check if current user liked this comment
        let isLiked = false;
        if (currentUser) {
          const like = await ctx.db
            .query("likes")
            .withIndex("unique_like", (q) => 
              q.eq("userId", currentUser._id).eq("videoId", comment._id as any)
            )
            .first();
          isLiked = !!like;
        }

        // Get reply count if it's a parent comment
        let replyCount = 0;
        if (!comment.parentId) {
          const replies = await ctx.db
            .query("comments")
            .withIndex("by_parent", (q) => q.eq("parentId", comment._id))
            .filter((q) => q.eq(q.field("isDeleted"), false))
            .collect();
          replyCount = replies.length;
        }

        return {
          id: comment._id,
          user: {
            id: user?._id || "",
            username: user?.username || "deleted",
            displayName: user?.displayName,
            profileImage: user?.profileImage,
          },
          content: comment.content,
          likeCount: comment.likeCount,
          isLiked,
          createdAt: comment.createdAt,
          parentId: comment.parentId,
          replyCount,
        };
      })
    );

    return {
      comments: commentsWithData,
      hasMore: comments.length === limit,
    };
  },
});

// Toggle like on comment
export const toggleCommentLike = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const authUserId = await auth.getUserId(ctx);
    if (!authUserId) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", authUserId))
      .first();

    if (!currentUser) {
      throw new Error("User profile not found");
    }

    const comment = await ctx.db.get(args.commentId);
    if (!comment || comment.isDeleted) {
      throw new Error("Comment not found");
    }

    // Check if already liked (using video ID field for polymorphic likes)
    const existingLike = await ctx.db
      .query("likes")
      .withIndex("unique_like", (q) => 
        q.eq("userId", currentUser._id).eq("videoId", args.commentId as any)
      )
      .first();

    if (existingLike) {
      // Unlike
      await ctx.db.delete(existingLike._id);
      await ctx.db.patch(args.commentId, {
        likeCount: Math.max(0, comment.likeCount - 1),
      });
      return { action: "unliked" };
    } else {
      // Like
      await ctx.db.insert("likes", {
        userId: currentUser._id,
        videoId: args.commentId as any, // Using videoId field for comments too
        createdAt: Date.now(),
      });
      await ctx.db.patch(args.commentId, {
        likeCount: comment.likeCount + 1,
      });
      return { action: "liked" };
    }
  },
});