# Product Requirements Document (PRD)
# Reelly - Authentic Social Video Platform

## Executive Summary

Reelly is a trust-first social video platform that prioritizes authentic human connections over polished content. Unlike existing platforms, Reelly enforces genuine content creation through technical restrictions (in-app camera only, no uploads, no editing) and builds trust through verification systems inspired by Bluesky's decentralized approach.

## Vision Statement

"Create the most trusted space for authentic human connection through unfiltered video moments."

## Problem Statement

Current social media platforms suffer from:
- Proliferation of AI-generated and heavily edited content
- Loss of trust in content authenticity
- Parasocial relationships lacking genuine connection
- Privacy concerns with aggressive data collection
- Pressure to create "perfect" content leading to mental health issues

## Target Audience

### Primary Segment: Public Figures & Celebrities
- Celebrities seeking genuine fan engagement
- Public figures wanting to show their authentic selves
- Content creators fatigued by production pressure
- Artists and musicians connecting with fans

### Secondary Segment: Early Adopters
- Privacy-conscious users aged 18-35
- Users seeking authentic connections
- Anti-AI content advocates
- Former TikTok/Instagram users seeking less curated experiences

## Core Values

1. **Authenticity** - Only real, unedited moments
2. **Trust** - Verified users and transparent systems
3. **Privacy** - Minimal data collection, user control
4. **Simplicity** - Effortless content creation
5. **Connection** - Genuine human interactions

## Key Features

### 1. Content Creation
- **In-App Camera Only**: No video uploads, ensuring all content originates from the app
- **No Editing Tools**: Raw, unfiltered content only
- **Thumbnail Selection**: Users scroll through video frames to select thumbnail
- **Video Duration**: 15 seconds to 3 minutes
- **Real-time Recording**: No post-processing or filters

### 2. User Verification System
- **Domain Verification**: Similar to Bluesky's approach
- **Celebrity Verification**: Blue checkmark for verified public figures
- **No Bots Policy**: Aggressive bot detection and removal
- **Human Verification**: Periodic challenges to ensure human users

### 3. Feed System
- **Following Feed**: Chronological feed of followed accounts
- **Discovery Feed**: Algorithm-based popular/trending content
- **No Location-Based Feed**: Privacy-first approach
- **Topic Channels**: Optional hashtag-based discovery

### 4. Social Features
- **Follow/Unfollow**: Standard following system
- **Likes**: Heart reaction to videos
- **Comments**: Threaded discussions
- **Shares**: Share to other platforms or within Reelly
- **Bookmarks**: Private saves for later viewing
- **Direct Messages**: Optional, privacy-focused

### 5. Privacy & Security
- **No Location Tracking**: Location services disabled
- **Minimal Analytics**: Only essential app performance metrics
- **Data Portability**: Export all user data
- **Account Deletion**: Complete data removal option
- **End-to-End Encryption**: For direct messages

## Technical Requirements

### Backend Architecture
- **Platform**: Convex (https://convex.dev)
- **Database**: Convex's built-in database
- **File Storage**: Convex file storage or AWS S3 for video files
- **Authentication**: Convex Auth with social login options
- **Real-time**: WebSocket connections for live features

### Frontend - Web
- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand or React Context
- **Video Player**: Custom HTML5 player or video.js
- **Responsive Design**: Mobile-first approach
- **PWA**: Progressive Web App capabilities

### Frontend - Mobile
- **Framework Options**:
  - React Native (with Expo)
  - Flutter
  - Capacitor (for web-based approach)
- **Recommendation**: React Native for TypeScript consistency
- **Camera Integration**: Native camera APIs
- **Video Processing**: Native modules for compression

### Protocol Consideration
- **ATProto Integration**: Optional federation capability
- **Benefits**: Decentralized identity, data portability
- **Implementation**: Hybrid approach with Convex as primary, ATProto for identity

## Success Metrics

### User Metrics
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- User Retention (D1, D7, D30)
- Average Session Duration
- Videos Created per User

### Engagement Metrics
- Video Completion Rate
- Like Rate
- Comment Rate
- Share Rate
- Follow-back Rate

### Trust Metrics
- Verified User Percentage
- Bot Detection Rate
- User Report Resolution Time
- Content Authenticity Score

## Monetization Strategy

### Phase 1 (Launch - 6 months)
- No monetization, focus on growth
- Potential seed funding or grants

### Phase 2 (6-12 months)
- **Verification Badges**: Premium verification for non-celebrities
- **Pro Features**: Extended video length, analytics
- **No Ads Initially**: Maintain trust and authenticity

### Phase 3 (12+ months)
- **Creator Fund**: Revenue sharing for top creators
- **Brand Partnerships**: Authentic sponsored content
- **Premium Subscriptions**: Ad-free, exclusive features

## Branding Guidelines

### Visual Identity
- **Color Palette**: 
  - Primary: Sage green (#7C9885)
  - Secondary: Cream (#F5F5DC)
  - Accent: Deep teal (#2C5F5F)
  - Text: Charcoal (#333333)
- **Typography**: Clean, modern sans-serif (similar to images)
- **Design Philosophy**: Minimalist, organic, calming

### Voice & Tone
- Genuine and conversational
- Encouraging without pressure
- Privacy-conscious messaging
- Anti-perfection, pro-authenticity

## Launch Strategy

### Phase 1: Private Beta (Month 1-2)
- 100 invited celebrities/influencers
- 1,000 early access users
- Core feature testing
- Feedback integration

### Phase 2: Public Beta (Month 3-4)
- Open registration with waitlist
- 10,000 target users
- Marketing campaign launch
- Press coverage

### Phase 3: General Availability (Month 5+)
- Full public launch
- App store optimization
- Influencer partnerships
- Growth marketing

## Risk Mitigation

### Technical Risks
- **Video Storage Costs**: Implement smart compression and retention policies
- **Scaling Issues**: Use CDN and edge computing
- **Abuse Prevention**: ML-based content moderation

### Business Risks
- **User Adoption**: Strong celebrity partnerships
- **Competition**: Focus on unique authenticity features
- **Monetization**: Maintain balance between revenue and values

## Timeline

- **Month 1-2**: Development of core features
- **Month 3**: Private beta launch
- **Month 4**: Iterate based on feedback
- **Month 5**: Public beta
- **Month 6**: General availability
- **Month 7-12**: Growth and feature expansion

## Appendix

### Competitor Analysis
- TikTok: Highly edited, algorithm-heavy
- BeReal: Time-based authenticity
- Instagram Reels: Polished content focus
- Snapchat: Ephemeral but allows uploads

### Unique Differentiators
1. Absolutely no content uploads
2. No editing capabilities whatsoever
3. Celebrity-first approach
4. Privacy by default
5. Verification system for trust