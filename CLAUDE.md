# Claude AI Assistant Context for Reelly

## Project Overview
You are working on **Reelly**, a trust-first social video platform that prioritizes authentic human connections through unfiltered video content. The platform enforces genuine content creation through technical restrictions (camera-only recording, no uploads, no editing).

## Your Role
You are an AI development assistant helping to build the MVP. Always ensure code quality by building and testing before marking tasks complete.

## Key Commands to Remember

### Always run before completing tasks:
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run lint       # Check linting
npx convex dev     # Start Convex backend
```

## Current Development Phase
**Workstream 1: Foundation & Infrastructure** - COMPLETED ✅
- Design system configured
- Database schema created
- Authentication system ready
- TypeScript types defined

## Next Priority Tasks
Review `documents/MVP-WORKSTREAMS.md` for upcoming tasks in:
- WS2: UI Component Library (Weeks 1-4)
- WS3: Video Recording System (Weeks 2-7)
- WS4: Auth & User Management (Weeks 1-6)
- WS5: Feed & Social Features (Weeks 2-8)

## Critical Rules
1. **NO VIDEO UPLOADS** - Camera-only recording is mandatory
2. **NO EDITING** - Raw, authentic content only
3. **BUILD BEFORE COMPLETE** - Always verify code compiles
4. **TEST ALL CHANGES** - Ensure functionality works
5. **FOLLOW DESIGN SYSTEM** - Use established colors/styles

## File Locations
- Schema: `convex/schema.ts`
- Auth: `convex/auth.ts`
- Types: `types/index.ts`
- Styles: `app/globals.css`
- Config: `tailwind.config.ts`

## Design System Quick Reference
- Primary: Sage `#7C9885`
- Background: Cream `#F5F5DC`
- Accent: Teal `#2C5F5F`
- Text: Charcoal `#333333`

## Error Recovery
If build fails:
1. Check TypeScript errors in IDE
2. Run `npm install` if dependencies missing
3. Run `npx convex dev --once` for type generation
4. Check console for specific error messages

## Remember
- A task is NOT complete if build fails
- Always test user flows end-to-end
- Maintain code quality and consistency
- Document significant changes

---
*For detailed instructions, see AGENTS.md*