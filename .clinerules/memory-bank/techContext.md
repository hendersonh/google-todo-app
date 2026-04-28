## mcp-config-v1

Registered the agent-memory-mcp server in /home/ubuntu/.gemini/antigravity/mcp_config.json for automatic lifecycle management. The server is configured with project ID 'google-todo-app' and workspace path '/home/ubuntu/todolist'. It exposes tools like memory_write, memory_search, and memory_read. This eliminates the need for manual server startup and integrates the memory bank natively into the Antigravity agent toolkit.

**Type:** decision  
**Tags:** mcp, config, automation, setup  
**Updated:** 4/25/2026


## mb-preference-v1

'MB' is the user's preferred shorthand for the Agent Memory Bank (agent-memory-mcp). Use this abbreviation for indexing, searching, and recall when the user refers to 'MB'.

**Type:** decision  
**Tags:** preference, shorthand, ui  
**Updated:** 4/25/2026


## chrome-wayland-config

# Chrome Configuration for Wayland

On Ubuntu 20.04 systems using Wayland, the standard Antigravity browser launcher may fail because Chrome requires specific flags and environment variables to initialize correctly.

## Problem
- Error: `[BrowserLauncherMain] No Chrome with CDP found on port 9222`.
- Cause: Chrome fails to start without Wayland-specific configuration in a Wayland environment.

## Solution
Create a wrapper script and configure Antigravity to use it.

### 1. Wrapper Script
A script was created at `.agent/chrome_wrapper.sh`:
```bash
#!/bin/bash
export WAYLAND_DISPLAY=wayland-0
export XDG_RUNTIME_DIR=/run/user/1000
exec /usr/local/bin/chrome --ozone-platform=wayland --enable-features=WaylandWindowDecorations "$@"
```

### 2. Antigravity Settings
Update `~/.config/Antigravity/User/settings.json` to point to the wrapper:
```json
{
  "antigravity.browser.chromeExecutablePath": "/home/ubuntu/todolist/.agent/chrome_wrapper.sh",
  "antigravity.browser.chromeArgs": [
    "--ozone-platform=wayland",
    "--enable-features=WaylandWindowDecorations"
  ]
}
```

This configuration ensures that any browser subagent correctly launches Chrome with the necessary display environment and hardware acceleration flags.

**Type:** decision  
**Tags:** browser, wayland, configuration, linux  
**Updated:** 4/26/2026


## dynamic-categories-decision

# Decision: Dynamic Categories & Auto-assigned Colors

### Context
Categories were previously hardcoded in `App.jsx`. To improve user personalization, we are moving to a Firestore-backed dynamic category system.

### Decision
- Users will be able to create custom lists (categories).
- Colors will be **auto-assigned** from a curated Google-inspired palette to maintain design consistency and a premium feel.
- Categories will be stored in a top-level `categories` collection in Firestore, keyed by `ownerUid`.

### Rationale
Auto-assignment prevents users from picking clashing colors, ensuring the UI remains visually harmonious while still providing organizational flexibility.

### Plan
Follows the "Dynamic Categories" action items including Firestore subscription and a new CategoryModal.

**Type:** decision  
**Tags:** architecture, ui-design, firestore  
**Updated:** 4/26/2026


## decision-plus-button-discoverability

# Decision: Enhanced Button Discoverability (Plus Button)

### Problem
The "Add List" (+) button was originally only visible on hover (`opacity-0`), leading to confusion about how to create new categories.

### Decision
Change the default state of the button to be partially visible (`opacity-40`) at all times.
- **Normal State**: `opacity-40`
- **Hover/Header Hover**: `opacity-100`

### Rationale
This provides a visual "hint" that functionality exists in that area without cluttering the clean sidebar design. It balances Google's minimalist aesthetic with essential discoverability for core features.

**Type:** decision  
**Tags:** ux-improvement, ui-design, discoverability  
**Updated:** 4/26/2026


## decision-privacy-filtering-v1

# Privacy and Security: Task Filtering
Added strict privacy filtering for tasks and categories.
- Tasks are now filtered by `userId` in `TaskService.subscribeToTasks`.
- Categories are filtered by `ownerUid` in `TaskService.subscribeToCategories`.
- Guest users (unauthenticated) see an empty task list and default categories only.
- Custom list creation (+) is hidden for unauthenticated users.

## Required Composite Indexes
- `categories`: `ownerUid` (ASC), `createdAt` (ASC)
- `tasks`: `userId` (ASC), `createdAt` (DESC)

**Type:** decision  
**Tags:** security, firestore, privacy  
**Updated:** 4/26/2026


## auth-auto-signup-v1

# Decision: Seamless Auto-Signup Flow (Email/Password)

### Context
To simplify the user onboarding experience and avoid the clunky "Sign In" vs "Sign Up" toggle, a unified "Continue" flow was implemented for email/password authentication.

### Decision
- **Unified Action**: The UI provides a single email/password form and a "Continue" button.
- **Logic Chain**: 
  1. Attempt `signInWithEmailAndPassword`.
  2. If the error code is `auth/user-not-found` or `auth/invalid-credential` (modern Firebase error), automatically attempt `createUserWithEmailAndPassword`.
  3. Log the user in immediately upon creation.
- **UI Fallback**: If sign-in/sign-up fails for other reasons (e.g., `auth/weak-password`), a standard error message is shown.

### Rationale
Reduces friction for new users who may not know if they have an account yet, while maintaining security. This "Just Works" approach aligns with premium UX principles.

### File
`src/App.jsx` - `handleEmailAuth` function.

**Type:** decision  
**Tags:** auth, ux, firebase, decision  
**Updated:** 4/26/2026


## privacy-categories-v1

# Decision: Private Custom Categories (Lists)

### Context
Initially, categories were shared like tasks. This caused visual clutter as users saw dozens of lists they didn't create.

### Decision
- **Strict Privacy**: Custom categories (lists) are strictly private to the creator. 
- **Implementation**: `TaskService.subscribeToCategories` filters by `where("ownerUid", "==", userId)`.
- **Database Backup**: Firestore rules are also set to restrict read access for `categories` to the owner, ensuring data privacy even at the API level.
- **Shared Tasks**: If a user views a shared task belonging to a category they don't own, the UI gracefully handles the missing category metadata (defaults to ID or raw label).

### Rationale
Ensures the sidebar remains relevant to the current user while allowing the global task board to function.

**Type:** decision  
**Tags:** privacy, security, categories, decision  
**Updated:** 4/26/2026


## session-status-2026-04-26-v1

# Session Summary: 2026-04-26 (Post-Debug & Hosting Plan)

### Accomplishments
- **Systematic Debugging Pass**: Identified and fixed 4 critical bugs:
    1. **Privacy Leak**: Custom categories were public; now secured via `ownerUid` query and Firestore rules.
    2. **Timestamp Corruption**: Fixed `addTask` to prevent recurring tasks from overwriting server timestamps with local strings.
    3. **Search Crash**: Added null-checks for task titles in `App.jsx`.
    4. **Sidebar Deduplication**: Prevented ID collisions between default and dynamic lists.
- **Hosting Plan**: Created a 7-step plan to deploy the app to Firebase Cloud Hosting (Classic).

### Current State
- **Firestore Rules**: Deployed version includes privacy enforcement for categories.
- **Codebase**: Stable and ready for production build.
- **Artifacts**: 
    - `debugging_report.md` (Detailed bug analysis)
    - `hosting_plan.md` (Step-by-step deploy strategy)

### Next Steps
1. Execute **Step 1** of the hosting plan: `npm run build` and verify the `dist/` bundle.
2. Initialize and deploy to Firebase Hosting.
3. (Optional) Set up GitHub Actions for CI/CD.

### Session Metadata
- **Status**: PAUSED
- **Last Action**: Systematic debugging pass confirmed and indexed.

**Type:** decision  
**Tags:** session-summary, progress-report, debugging, hosting-plan  
**Updated:** 4/26/2026


## infrastructure-optimization-v1

# Production Infrastructure Optimization (Spark Tier)

Decision to optimize delivery and security without transitioning to the Blaze (Paid) tier.

## Optimized Components
- **Hosting Headers**: Configured custom headers in `firebase.json` for security and performance.
- **Static Asset Caching**: 1-year cache (`max-age=31536000`) for immutable JS/CSS/Images.
- **SPA Routing**: Wildcard rewrites (`**` -> `index.html`) to support deep-linking in the Single Page Application.
- **App Check Decision**: Deferred App Check (reCAPTCHA) implementation to avoid billing dependencies while remaining secure via Firestore Rules.

## Impact
- Reduced latency for returning users via aggressive caching.
- Hardened protection against common web attacks (Clickjacking, MIME-sniffing).
- Maintained 100% free-tier status.


**Type:** decision  
**Tags:** infrastructure, performance, firebase-hosting, decision  
**Updated:** 4/27/2026
