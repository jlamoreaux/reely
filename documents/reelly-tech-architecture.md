# Technical Architecture Document
# Reelly - System Design & Implementation

## Overview

This document outlines the technical architecture for Reelly, focusing on scalability, security, and maintaining content authenticity through technical constraints.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Client Layer                       │
├──────────────┬─────────────────┬────────────────────┤
│  Mobile App  │   Web App       │   Admin Dashboard  │
│  (React      │   (Next.js)     │   (Next.js)        │
│   Native)    │                 │                    │
└──────┬───────┴────────┬────────┴──────────┬─────────┘
       │                │                   │
       └────────────────┼───────────────────┘
                        │
                   [HTTPS/WSS]
                        │
┌───────────────────────┴─────────────────────────────┐
│                  API Gateway                         │
│              (Convex Functions)                      │
├──────────────────────────────────────────────────────┤
│                 Business Logic Layer                 │
├─────────┬──────────┬──────────┬─────────┬──────────┤
│  Auth   │  Video   │  Social  │  Feed   │  Admin   │
│ Service │ Service  │ Service  │ Engine  │ Service  │
└─────────┴──────────┴──────────┴─────────┴──────────┘
                        │
┌───────────────────────┴─────────────────────────────┐
│                   Data Layer                         │
├──────────────┬──────────────────┬───────────────────┤
│   Convex DB  │   File Storage   │   Cache Layer     │
│   (Users,    │   (Videos,       │   (Redis/         │
│    Posts,    │    Thumbnails)   │    Memory)        │
│    Social)   │                  │                   │
└──────────────┴──────────────────┴───────────────────┘
```

## Backend Implementation (Convex)

### Database Schema

```typescript
// schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    username: v.string(),
    displayName: v.string(),
    bio: v.optional(v.string()),
    profileImage: v.optional(v.string()),
    isVerified: v.boolean(),
    verificationDomain: v.optional(v.string()),
    createdAt: v.number(),
    followerCount: v.number(),
    followingCount: v.number(),
    videoCount: v.number(),
    settings: v.object({
      isPrivate: v.boolean(),
      allowMessages: v.boolean(),
      allowComments: v.boolean(),
    }),
  })
    .index("by_username", ["username"])
    .index("by_clerk", ["clerkId"]),

  videos: defineTable({
    userId: v.id("users"),
    videoUrl: v.string(),
    thumbnailUrl: v.string(),
    duration: v.number(),
    description: v.optional(v.string()),
    viewCount: v.number(),
    likeCount: v.number(),
    commentCount: v.number(),
    shareCount: v.number(),
    isDeleted: v.boolean(),
    createdAt: v.number(),
    metadata: v.object({
      deviceType: v.string(),
      appVersion: v.string(),
      recordedAt: v.number(),
    }),
  })
    .index("by_user", ["userId", "createdAt"])
    .index("by_created", ["createdAt"])
    .index("by_popularity", ["likeCount", "createdAt"]),

  follows: defineTable({
    followerId: v.id("users"),
    followingId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_follower", ["followerId"])
    .index("by_following", ["followingId"])
    .index("unique_follow", ["followerId", "followingId"]),

  likes: defineTable({
    userId: v.id("users"),
    videoId: v.id("videos"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_video", ["videoId"])
    .index("unique_like", ["userId", "videoId"]),

  comments: defineTable({
    userId: v.id("users"),
    videoId: v.id("videos"),
    content: v.string(),
    parentId: v.optional(v.id("comments")),
    likeCount: v.number(),
    createdAt: v.number(),
    isDeleted: v.boolean(),
  })
    .index("by_video", ["videoId", "createdAt"])
    .index("by_parent", ["parentId"]),

  bookmarks: defineTable({
    userId: v.id("users"),
    videoId: v.id("videos"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId", "createdAt"])
    .index("unique_bookmark", ["userId", "videoId"]),
});
```

### Core Convex Functions

```typescript
// functions/videos.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const uploadVideo = mutation({
  args: {
    videoData: v.string(), // Base64 or blob storage reference
    thumbnailTimestamp: v.number(),
    duration: v.number(),
    description: v.optional(v.string()),
    deviceMetadata: v.object({
      deviceType: v.string(),
      appVersion: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    // Verify user authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    
    // Verify video authenticity (no uploads, only in-app)
    // This would check device signatures, timestamps, etc.
    
    // Store video file
    const videoUrl = await storeVideoFile(args.videoData);
    const thumbnailUrl = await generateThumbnail(
      videoUrl, 
      args.thumbnailTimestamp
    );
    
    // Create video record
    const videoId = await ctx.db.insert("videos", {
      userId: identity.userId,
      videoUrl,
      thumbnailUrl,
      duration: args.duration,
      description: args.description,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      isDeleted: false,
      createdAt: Date.now(),
      metadata: {
        ...args.deviceMetadata,
        recordedAt: Date.now(),
      },
    });
    
    return videoId;
  },
});
```

## Frontend Architecture

### Next.js Web Application Structure

```
reelly-web/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (main)/
│   │   ├── feed/
│   │   ├── discover/
│   │   ├── profile/[username]/
│   │   └── video/[id]/
│   ├── api/
│   │   └── webhooks/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── video/
│   │   ├── VideoPlayer.tsx
│   │   ├── VideoFeed.tsx
│   │   └── VideoRecorder.tsx
│   └── shared/
├── hooks/
│   ├── useConvex.ts
│   ├── useVideo.ts
│   └── useAuth.ts
├── lib/
│   ├── convex.ts
│   └── utils.ts
└── styles/
    └── globals.css
```

### Mobile App Architecture (React Native)

```
reelly-mobile/
├── src/
│   ├── screens/
│   │   ├── Feed/
│   │   ├── Camera/
│   │   ├── Profile/
│   │   └── Discover/
│   ├── components/
│   │   ├── Camera/
│   │   │   ├── CameraView.tsx
│   │   │   └── VideoPreview.tsx
│   │   └── Video/
│   │       └── VideoPlayer.tsx
│   ├── navigation/
│   ├── services/
│   │   ├── convex.ts
│   │   ├── camera.ts
│   │   └── storage.ts
│   ├── hooks/
│   └── utils/
├── ios/
├── android/
└── app.json
```

## Video Pipeline

### Recording Flow
1. **Camera Access**: Native camera API (no gallery access)
2. **Real-time Recording**: Direct to temporary storage
3. **Thumbnail Selection**: Frame extraction for preview
4. **Upload**: Direct to Convex/S3 with metadata
5. **Processing**: Compression and optimization
6. **Distribution**: CDN delivery

### Anti-Upload Measures
```typescript
// Verification checks
const verifyVideoAuthenticity = async (videoData: VideoUpload) => {
  // Check EXIF/metadata for app signature
  if (!videoData.metadata.appSignature) {
    throw new Error("Invalid video source");
  }
  
  // Verify timestamp proximity (must be recent)
  const timeDiff = Date.now() - videoData.metadata.recordedAt;
  if (timeDiff > 60000) { // 1 minute threshold
    throw new Error("Video must be uploaded immediately");
  }
  
  // Check for editing markers
  if (detectVideoEditing(videoData)) {
    throw new Error("Edited videos not allowed");
  }
  
  return true;
};
```

## Feed Algorithm

### Following Feed
- Chronological ordering
- Real-time updates via WebSocket
- Pagination with cursor-based loading

### Discovery Feed
```typescript
// Simplified ranking algorithm
const calculateVideoScore = (video: Video) => {
  const ageInHours = (Date.now() - video.createdAt) / 3600000;
  const engagementRate = (video.likeCount + video.commentCount * 2) / 
                         (video.viewCount || 1);
  
  // Decay factor for older content
  const timePenalty = Math.pow(0.95, ageInHours);
  
  // Boost for verified creators
  const verifiedBoost = video.user.isVerified ? 1.5 : 1;
  
  return engagementRate * timePenalty * verifiedBoost;
};
```

## Security Measures

### Authentication & Authorization
- Clerk or Auth0 for user authentication
- JWT tokens with short expiration
- Role-based access control (User, Verified, Admin)

### Content Security
```typescript
// Content validation pipeline
const validateContent = async (video: VideoUpload) => {
  // Check for AI-generated content
  const aiScore = await detectAIContent(video);
  if (aiScore > 0.8) {
    throw new Error("AI-generated content detected");
  }
  
  // NSFW detection
  const nsfwScore = await detectNSFW(video);
  if (nsfwScore > 0.9) {
    throw new Error("Inappropriate content detected");
  }
  
  // Copyright detection (audio)
  const copyrightCheck = await checkCopyright(video.audio);
  if (copyrightCheck.matched) {
    throw new Error("Copyrighted content detected");
  }
  
  return true;
};
```

## Scalability Considerations

### Video Storage Strategy
- **Upload**: Direct to S3 via presigned URLs
- **Processing**: Lambda functions for compression
- **Delivery**: CloudFront CDN
- **Retention**: 90-day policy for inactive videos

### Database Optimization
- Indexed queries for common access patterns
- Denormalized counters for performance
- Read replicas for heavy read operations
- Caching layer for hot content

### Performance Targets
- Video upload: < 10 seconds for 60-second video
- Feed load: < 500ms initial load
- Video playback: < 1 second to first frame
- API response: < 200ms p95

## Monitoring & Analytics

### Key Metrics to Track
- API latency and error rates
- Video upload success rate
- User engagement metrics
- Storage utilization
- CDN cache hit ratio

### Logging Strategy
```typescript
// Structured logging
interface VideoEvent {
  eventType: 'upload' | 'view' | 'like' | 'share';
  userId: string;
  videoId: string;
  timestamp: number;
  metadata: Record<string, any>;
}

const logEvent = async (event: VideoEvent) => {
  // Send to analytics service
  await analytics.track(event);
  
  // Store in Convex for internal analytics
  await ctx.db.insert("events", event);
};
```

## Deployment Strategy

### Infrastructure
- **Hosting**: Vercel for Next.js
- **Backend**: Convex Cloud
- **Storage**: AWS S3 + CloudFront
- **Monitoring**: Datadog or New Relic

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: vercel --prod
      
  deploy-convex:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy Convex Functions
        run: npx convex deploy
```

## API Rate Limiting

```typescript
// Rate limiting configuration
const rateLimits = {
  videoUpload: { requests: 10, window: '1h' },
  like: { requests: 100, window: '1m' },
  comment: { requests: 30, window: '1m' },
  follow: { requests: 50, window: '1h' },
};
```

## Disaster Recovery

- Daily backups of Convex database
- Video files replicated across regions
- Failover strategy for critical services
- Incident response playbook