# 🤖 Agent Instructions for Reelly Development

## Overview
This document provides guidelines for AI agents and developers working on the Reelly codebase. Following these instructions ensures consistent, high-quality development and prevents common issues.

## 🎯 Project Context

**Reelly** is a trust-first social video platform that enforces authentic content creation through technical restrictions:
- **Camera-only recording** (no uploads allowed)
- **No editing capabilities**
- **Anti-AI/anti-fake content measures**
- **Privacy-first approach**

## 🏗️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Backend**: Convex (Database & Functions)
- **Auth**: Convex Auth with email/password and social providers
- **Styling**: Tailwind CSS v4, CSS Custom Properties
- **UI Libraries**: @headlessui/react, @heroicons/react, Radix UI
- **Video**: HTML5 video, MediaRecorder API (browser)

## ⚡ Critical Development Rules

### 1. ALWAYS Build Before Completing Tasks

```bash
# Before marking any task as complete, run:
npm run dev        # Ensure the development server starts
npm run build      # Ensure production build succeeds
npm run lint       # Check for linting errors
npm run typecheck  # Verify TypeScript types (if available)
```

**If any of these commands fail, the task is NOT complete.**

### 2. Test Convex Functions After Schema Changes

```bash
# After modifying convex/schema.ts or any Convex functions:
npx convex dev --once  # Generate types
npm run dev:backend    # Start Convex dev server

# Check the Convex dashboard for errors
npx convex dashboard
```

### 3. Verify Database Migrations

When updating the schema:
1. Check if existing data needs migration
2. Create migration functions if needed
3. Test with sample data before deployment

## 📁 Project Structure

```
reelly/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (main)/            # Main app pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles with CSS variables
├── components/            # React components
│   ├── ui/               # Basic UI components
│   ├── video/            # Video-related components
│   └── shared/           # Shared/common components
├── convex/               # Backend (Convex)
│   ├── schema.ts         # Database schema
│   ├── auth.ts           # Authentication config
│   ├── users.ts          # User functions
│   ├── videos.ts         # Video functions
│   └── social.ts         # Social features
├── types/                # TypeScript types
│   └── index.ts          # Main type definitions
├── hooks/                # React hooks
├── lib/                  # Utility functions
├── public/               # Static assets
└── documents/            # Project documentation
```

## 🎨 Design System

### Brand Colors
- **Primary**: Sage Green `#7C9885`
- **Secondary**: Cream `#F5F5DC`
- **Accent**: Teal `#2C5F5F`
- **Text**: Charcoal `#333333`

### Key CSS Variables
All design tokens are defined in `app/globals.css`:
- Color palette: `--sage-*`, `--cream-*`, `--teal-*`
- Spacing: `--space-*`
- Typography: `--text-*`
- Animations: `--duration-*`, `--ease-*`

## 💾 Database Schema

### Core Tables
- `users`: User profiles with settings
- `videos`: Video content with metadata
- `follows`: Social graph relationships
- `likes`: Video likes
- `comments`: Video comments with threading
- `bookmarks`: Saved videos
- `views`: Video view tracking
- `reports`: Content moderation
- `notifications`: User notifications
- `searchHistory`: Search tracking

### Important Indexes
- Always check existing indexes before adding new ones
- Use compound indexes for complex queries
- Consider search indexes for text search

## 🔐 Authentication Flow

1. User signs up/in via Convex Auth
2. Automatic user profile creation in `users` table
3. Username validation (3-20 chars, alphanumeric + underscore)
4. Profile completion during onboarding

## 📹 Video System Requirements

### Critical: Camera-Only Recording
```typescript
// NEVER allow file uploads
// ALWAYS enforce in-app recording
// Validate timestamp proximity (<60 seconds)
// Check device signatures
```

### Video Processing Pipeline
1. Record via MediaRecorder API
2. No editing allowed
3. Direct upload to Convex/S3
4. Thumbnail generation from frames
5. Anti-upload validation

## ✅ Task Completion Checklist

Before marking ANY task as complete:

- [ ] Code compiles without errors (`npm run build`)
- [ ] No TypeScript errors (`npm run typecheck` or check IDE)
- [ ] No linting errors (`npm run lint`)
- [ ] Convex functions work (`npx convex dev`)
- [ ] UI components render correctly
- [ ] Responsive design works (mobile + desktop)
- [ ] Accessibility requirements met (ARIA, keyboard nav)
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Documentation/comments updated

## 🐛 Common Issues & Solutions

### Issue: Convex types not generated
```bash
npx convex dev --once
```

### Issue: Tailwind classes not working
```bash
# Check if class exists in tailwind.config.ts
# Restart dev server after config changes
```

### Issue: Auth not working
```bash
# Check .env.local for required variables
# Verify Convex Auth configuration
```

### Issue: Build fails with module errors
```bash
npm install  # Reinstall dependencies
npm run clean && npm run build  # Clean build
```

## 🚀 Development Workflow

### Starting New Feature
1. Read relevant documents in `/documents`
2. Check existing code patterns
3. Create/update types in `/types`
4. Implement feature
5. Test thoroughly
6. Run build and fix any errors
7. Commit with descriptive message

### Commit Message Format
```
feat: Add user profile editing
fix: Resolve video upload validation
chore: Update dependencies
docs: Add API documentation
```

### Pull Request Checklist
- [ ] All tests pass
- [ ] Build succeeds
- [ ] No console errors
- [ ] Feature works as expected
- [ ] Code follows project patterns
- [ ] Documentation updated

## 🔴 Red Flags - Stop and Fix

If you encounter any of these, STOP and fix before proceeding:
- Build errors
- TypeScript errors
- Console errors in browser
- Convex function errors
- Failed authentication
- Video upload accepting files (should be camera-only)
- Missing loading states
- Missing error handling

## 📚 Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Convex Docs](https://docs.convex.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- Project docs in `/documents` folder

### Project-Specific Docs
- `documents/reelly-prd.md` - Product requirements
- `documents/reelly-tech-architecture.md` - Technical architecture
- `documents/reelly-design-system.md` - Design system
- `documents/MVP-WORKSTREAMS.md` - Development roadmap

## 🤝 Working with Other Agents

When collaborating with other AI agents:
1. Always pull latest changes before starting
2. Communicate changes clearly in commits
3. Don't modify files outside your workstream without coordination
4. Test integration points thoroughly
5. Document any API changes

## ⚠️ Security Considerations

- NEVER commit secrets or API keys
- NEVER allow video file uploads
- ALWAYS validate user input
- ALWAYS use parameterized queries
- NEVER expose internal IDs to users
- ALWAYS check authentication before mutations

## 📝 Final Notes

**Remember**: A feature is not complete until it:
1. Works correctly
2. Handles errors gracefully
3. Provides good UX (loading states, feedback)
4. Builds without errors
5. Follows project conventions

**When in doubt**:
- Check existing code patterns
- Read the documentation
- Test thoroughly
- Ask for clarification

---

*Last Updated: 2024-08-28*
*Version: 1.0*