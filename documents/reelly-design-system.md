# Design System & UI Components
# Reelly - Visual Identity & Component Library

## Brand Philosophy

**"Authenticity through simplicity"** - Every design decision should reduce friction between the user and genuine content creation. The interface should feel organic, calming, and trustworthy.

## Color System

### Primary Palette
```css
--sage-50: #F3F5F4;
--sage-100: #E8EDE9;
--sage-200: #D1DBD4;
--sage-300: #A5BAAC;
--sage-400: #7C9885;  /* Primary Brand Color */
--sage-500: #5F7A67;
--sage-600: #4A6051;
--sage-700: #3B4D41;
--sage-800: #2F3D34;
--sage-900: #1F2922;
```

### Secondary Palette
```css
--cream-50: #FEFEF9;
--cream-100: #FDFDF3;
--cream-200: #FAF9E6;
--cream-300: #F5F5DC;  /* Background */
--cream-400: #E8E5C8;

--teal-400: #4A8B8B;
--teal-500: #3A7575;
--teal-600: #2C5F5F;  /* Accent */
--teal-700: #224A4A;
--teal-800: #1A3838;
```

### Semantic Colors
```css
--text-primary: #333333;
--text-secondary: #666666;
--text-tertiary: #999999;
--text-inverse: #FFFFFF;

--success: #5CB85C;
--warning: #F0AD4E;
--error: #D9534F;
--info: #5BC0DE;

--border-light: #E0E0E0;
--border-medium: #CCCCCC;
--shadow: rgba(0, 0, 0, 0.08);
```

## Typography

### Font Stack
```css
--font-primary: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 
                'Segoe UI', 'Roboto', sans-serif;
--font-mono: 'SF Mono', 'Monaco', 'Courier New', monospace;
```

### Type Scale
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

### Font Weights
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

## Spacing System

```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

## Component Library

### Navigation Header
```tsx
// Mobile & Web Header
<Header>
  <BackButton />
  <Title>Reelly</Title>
  <ActionButton />
</Header>

// Styling
.header {
  height: 56px;
  background: var(--cream-300);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-4);
}
```

### Video Card Component
```tsx
interface VideoCardProps {
  thumbnail: string;
  user: {
    name: string;
    avatar: string;
    isVerified: boolean;
  };
  timestamp: string;
  description?: string;
  likes: number;
}

// Layout structure
<VideoCard>
  <VideoThumbnail>
    <PlayButton />
  </VideoThumbnail>
  <VideoMeta>
    <UserInfo>
      <Avatar />
      <Username />
      <VerifiedBadge />
    </UserInfo>
    <Timestamp />
    <Description />
  </VideoMeta>
  <VideoActions>
    <LikeButton />
    <CommentButton />
    <ShareButton />
    <BookmarkButton />
  </VideoActions>
</VideoCard>
```

### Button System
```css
/* Primary Button */
.btn-primary {
  background: var(--sage-400);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: 24px;
  font-weight: var(--font-semibold);
  transition: all 0.2s ease;
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: var(--sage-600);
  border: 1px solid var(--sage-400);
  padding: var(--space-3) var(--space-6);
  border-radius: 24px;
}

/* Icon Button */
.btn-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cream-100);
}
```

### Camera Interface
```tsx
// Camera view structure
<CameraView>
  <CameraPreview />
  <CameraControls>
    <CloseButton />
    <RecordButton />
    <FlipCameraButton />
  </CameraControls>
  <RecordingIndicator />
</CameraView>

// Record button states
.record-button {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 4px solid white;
  background: var(--error);
  transition: transform 0.2s;
}

.record-button.recording {
  transform: scale(0.8);
  border-radius: 8px;
}
```

### Feed Layout
```css
/* Vertical scroll feed (mobile) */
.feed-container {
  height: 100vh;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
}

.video-item {
  height: 100vh;
  scroll-snap-align: start;
  position: relative;
}

/* Grid layout (web/tablet) */
.feed-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-4);
  padding: var(--space-4);
}
```

### Profile Page
```tsx
// Profile header structure
<ProfileHeader>
  <Avatar size="large" />
  <ProfileInfo>
    <Username>
      <VerifiedBadge />
    </Username>
    <Bio />
    <Stats>
      <Followers />
      <Following />
      <Videos />
    </Stats>
  </ProfileInfo>
  <ActionButtons>
    <FollowButton />
    <MessageButton />
  </ActionButtons>
</ProfileHeader>

// Video grid
<VideoGrid>
  {videos.map(video => (
    <VideoThumbnail key={video.id} />
  ))}
</VideoGrid>
```

## Icons

### Custom Icon Set
- Home (feed)
- Discover (compass)
- Camera (record)
- Profile (user)
- Heart (like)
- Comment (bubble)
- Share (arrow)
- Bookmark (save)
- Verified (checkmark)
- Settings (gear)
- Back (chevron-left)
- More (ellipsis)

### Icon Guidelines
```css
.icon {
  width: 24px;
  height: 24px;
  stroke: var(--text-primary);
  stroke-width: 2;
  fill: none;
}

.icon-small {
  width: 16px;
  height: 16px;
}

.icon-large {
  width: 32px;
  height: 32px;
}
```

## Animation & Transitions

### Timing Functions
```css
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0.0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Standard Animations
```css
/* Like animation */
@keyframes like-bounce {
  0% { transform: scale(1); }
  25% { transform: scale(0.8); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* Loading spinner */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

## Responsive Breakpoints

```css
--mobile: 320px;
--mobile-lg: 428px;
--tablet: 768px;
--desktop: 1024px;
--desktop-lg: 1440px;
```

## Accessibility

### Focus States
```css
:focus-visible {
  outline: 2px solid var(--sage-400);
  outline-offset: 2px;
}
```

### Touch Targets
- Minimum 44x44px for all interactive elements
- 8px minimum spacing between targets

### Color Contrast
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: 3:1 minimum

## Component States

### Loading States
```tsx
<Skeleton>
  <SkeletonAvatar />
  <SkeletonText lines={3} />
  <SkeletonImage aspectRatio="16:9" />
</Skeleton>
```

### Empty States
```tsx
<EmptyState>
  <EmptyIcon />
  <EmptyTitle>No videos yet</EmptyTitle>
  <EmptyDescription>
    Start recording to share your authentic moments
  </EmptyDescription>
  <EmptyAction>
    <Button>Record Video</Button>
  </EmptyAction>
</EmptyState>
```

### Error States
```tsx
<ErrorState>
  <ErrorIcon />
  <ErrorTitle>Something went wrong</ErrorTitle>
  <ErrorDescription>
    We couldn't load this content. Please try again.
  </ErrorDescription>
  <ErrorAction>
    <Button onClick={retry}>Try Again</Button>
  </ErrorAction>
</ErrorState>
```

## Motion Principles

1. **Purposeful**: Every animation should have a clear purpose
2. **Fast**: Animations should be 200-300ms for most transitions
3. **Smooth**: Use easing functions for natural movement
4. **Consistent**: Similar actions should have similar animations

## Platform-Specific Considerations

### iOS
- Respect safe areas
- Use native gestures (swipe back)
- Support Dynamic Type
- Haptic feedback for key actions

### Android
- Material Design principles where appropriate
- Support back button navigation
- Respect system font scaling
- Follow Android gesture navigation

### Web
- Hover states for desktop
- Keyboard navigation support
- Responsive layouts
- Progressive enhancement

## Dark Mode (Future)
```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: #1A1A1A;
    --text-primary: #FFFFFF;
    --sage-400: #8FA798;
    /* Additional dark mode variables */
  }
}
```