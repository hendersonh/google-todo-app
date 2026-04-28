## recurring-tasks-plan-v1

# Implementation Plan: Recurring Tasks
Add the ability for users to set tasks to repeat daily, weekly, or monthly. When a recurring task is completed, a new instance is created for the next interval.
## Scope
- In: recurrence field, TaskService recurrence engine, TaskModal UI selector.
- Out: Complex rules, notifications.
## Action Items
1. Modify Task schema to support recurrence.
2. Add UI selection in TaskModal.
3. Implement handleRecurrence in TaskService to calculate next dueDate.
4. Update toggleTask logic in App.jsx to trigger recurrence.
5. Add visual 'Repeat' icon to tasks.


**Type:** feature  
**Tags:** plan, recurring-tasks, roadmap  
**Updated:** 4/25/2026


## subtasks-plan-v1

# Implementation Plan: Sub-tasks (Nested Checklists)
Enable one-level nesting of tasks. Users can add a list of checklist items within a single task to track granular progress.
## Scope
- In: subtasks array [{id, title, completed}], Modal UI for management, Progress fraction in main list.
- Out: Deep nesting, sub-task due dates.
## Action Items
1. Update Task schema with subtasks array.
2. Build Sub-task management UI in TaskModal.
3. Implement progress tracking logic (completed/total).
4. Show "X/Y" progress indicator in task rows.


**Type:** feature  
**Tags:** plan, subtasks, roadmap  
**Updated:** 4/25/2026


## firestore-migration-v1

# Implementation Plan: Firestore Migration
Migrate data layer from localStorage to Google Cloud Firestore.
## Approach
Refactor TaskService to use Firebase JS SDK (v10+). Implement real-time synchronization via Firestore onSnapshot.
## Key Tasks
1. Firebase SDK installation.
2. Initialize Firebase in src/firebase.js.
3. Refactor TaskService for Firestore CRUD.
4. Replace storage listener in App.jsx with onSnapshot.
5. Migrate existing localStorage data to Firestore.


**Type:** feature  
**Tags:** plan, firestore, migration, database  
**Updated:** 4/25/2026


## timeline-view-v1

# Feature: Timeline View
A new navigation tab ("Schedule") has been added that renders a 7-day horizontal timeline.
- **Component**: `src/components/TimelineView.jsx`
- **Logic**: Filters tasks by `dueDate` and organizes them into daily columns.
- **Integration**: Accessed via the sidebar; replaces the main list view when the 'schedule' tab is active.

**Type:** feature  
**Tags:** feature, timeline, navigation, ui  
**Updated:** 4/25/2026


## list-visuals-v1

# Feature: Sub-tasks & Recurrence Visualization
Enhanced the main task list with granular progress and status indicators.
- **Sub-tasks**: Displays "X/Y" progress indicator in the task row when sub-tasks are present.
- **Recurrence**: Shows a "RotateCcw" icon and recurrence interval (e.g., 'daily') for repeating tasks.
- **UI**: Implemented in the main task list mapping within `App.jsx`.

**Type:** feature  
**Tags:** feature, ui, subtasks, recurrence  
**Updated:** 4/25/2026


## overdue-highlight-v1

# Feature: Overdue Task Highlighting
Tasks that are past their `dueDate` and not yet `completed` are now visually highlighted.
- **Visual**: The task title text color changes to `google-red` (#EA4335).
- **Implementation**: Added conditional logic in `App.jsx` using a string comparison between `task.dueDate` (YYYY-MM-DD) and the current local date (`new Date().toISOString().split('T')[0]`).
- **Styles**: Utilizes the `text-google-red` and `font-medium` Tailwind/Vite classes.

**Type:** feature  
**Tags:** feature, ui, overdue, ux  
**Updated:** 4/25/2026


## dynamic-categories-implementation

# Dynamic Categories (Custom Lists)

Implemented a Firestore-backed system for custom task lists, moving away from hardcoded categories.

## Architecture
- **Collection**: `categories`
- **Fields**: `label` (string), `color` (hex), `ownerUid` (string), `createdAt` (timestamp)
- **Syncing**: Real-time listener in `App.jsx` using `subscribeToCategories`.

## Key Decisions
- **Auto-Color Assignment**: To maintain a premium Google aesthetic, the app auto-assigns colors from a curated `GOOGLE_PALETTE` hex constant in `TaskService.js`. Users do not manually pick colors.
- **State Management**: Categories are managed at the `App` level and passed as props to `TaskModal` and `CategoryModal`.
- **Filtering**: Sidebar and main list views dynamically filter based on any category `id` found in the state, allowing for infinite list scalability.

## Security
- Firestore rules restrict read/write access to the `ownerUid`.
- Tasks reference categories by ID, ensuring referential integrity in the UI.

**Type:** feature  
**Tags:** feature, firestore, ui  
**Updated:** 4/26/2026


## ui-status-modal-v1

# UI Component: StatusModal (Premium Alerts)

### Overview
Replaces generic browser `alert()` calls with a premium, Material-styled modal for permission errors and status updates.

### Features
- **Visuals**: Centered overlay, subtle animations, Google-blue action buttons.
- **Contextual Icons**: Uses `Lock`, `AlertCircle`, etc., to provide visual cues for the error type.
- **Usage**: Used primarily for "Access Restricted" messages when a user attempts to modify a task owned by someone else.

### File
`src/components/StatusModal.jsx`

### Pattern
Controlled by a `statusModal` state object in `App.jsx`:
```javascript
const [statusModal, setStatusModal] = useState({ isOpen: false, title: '', message: '' });
```

**Type:** feature  
**Tags:** ui-design, component, premium-ux  
**Updated:** 4/26/2026


## feature-deletion-safety

# Deletion Safety (Confirm Deletion Modal)

### Description
Implemented a "Poka-Yoke" (error-proofing) pattern to prevent accidental task deletion. 

### Implementation Details
- **Component**: `ConfirmDeletionModal.jsx`.
- **Logic**: Users must type the word "yes" (case-insensitive) into an input field to enable the "Delete Forever" button.
- **Context**: The modal displays the specific title of the task being deleted.
- **Integration**: Triggered from `App.jsx`'s `deleteTask` function.

### Rationale
High-risk, irreversible actions should require intentional effort (Friction by Design). This prevents accidental clicks from causing data loss.

**Type:** feature  
**Tags:** feature, ux, safety, poka-yoke  
**Updated:** 4/27/2026


## feature-shared-task-magic-links-v1

# Feature: Shared Task Magic Links (Phase 3 Collaboration)

## Overview
Owners can share any task via a time-limited, public read-only URL. No login required for recipients.

## Architecture: Token Vault Pattern
- **Collection**: `shared_links/{linkId}` (flat, top-level)
- **Document Fields**:
  | Field | Type | Description |
  |---|---|---|
  | `taskId` | string | Source task document ID |
  | `ownerId` | string | Firebase Auth UID of the sharer |
  | `expiresAt` | Timestamp | 7 days from creation |
  | `createdAt` | serverTimestamp | Write time |
  | `taskSnapshot` | map | Frozen copy of task data at share time |
- **Snapshot fields stored**: `title`, `details`, `completed`, `category`, `starred`, `dueDate`, `subtasks[]`

## Firestore Security Rules
```
match /shared_links/{linkId} {
  // Guests can read unexpired links without auth
  allow read: if request.time < resource.data.expiresAt;
  // Only authenticated owner can create/delete
  allow create: if request.auth != null && request.resource.data.ownerId == request.auth.uid;
  allow delete: if request.auth != null && resource.data.ownerId == request.auth.uid;
}
```
**Critical bug history**: `isAuthenticated()` helper was wrapping the `request.auth != null` check but caused intermittent failures in browser auth state propagation. Fixed by using inline `request.auth != null &&` check directly — more reliable in Firestore rules evaluation.

## Service Layer
- **File**: `src/services/SharingService.js`
- **`createLink(task, ownerId)`**: Generates a `crypto.randomUUID()` linkId, writes snapshot to Firestore, returns linkId.
- **`getSharedTask(linkId)`**: Reads the document, checks expiry client-side, returns `taskSnapshot`.
- **Key**: `ownerId` is always taken from `currentUserId` prop (Firebase Auth UID), NEVER from `task.userId` — prevents ownership mismatch.

## UI Integration
- **Share Button**: Added to `TaskModal.jsx` bottom action bar (alongside Delete). Shows loading spinner → green "Link Copied!" checkmark on success. Only visible for non-read-only, existing tasks.
- **`currentUserId` prop**: `App.jsx` passes `user?.uid` to `TaskModal` to guarantee the auth UID is used for sharing, not the task's stored `userId`.

## Guest View
- **Route**: `/shared/:linkId`
- **Component**: `src/pages/SharedTaskPage.jsx`
- **Router**: `react-router-dom` added; `BrowserRouter` wraps app in `main.jsx`. Route `/shared/:linkId` renders guest page; `/*` renders main `App`.
- **Vite Config**: `server.historyApiFallback: true` added for SPA deep link support.
- **Firebase Hosting**: `firebase.json` rewrites rule `** → /index.html` already handles production routing.
- **Guest view renders**: Task title, details, Important star, category pill (colored), due date chip (blue), subtask list with progress bar, "Completed" badge if applicable, "7-day expiry" notice.
- **No auth required** — intentional, by design.

## Kaizen Improvement (Post-launch)
After initial launch, `dueDate` was missing from the snapshot and guest view. Fixed atomically:
1. `SharingService.js`: Added `dueDate: task.dueDate || null` to `taskSnapshot`.
2. `SharedTaskPage.jsx`: Added blue "Due [date]" chip in meta section using `toLocaleDateString`.

## Known Gotchas
- **Stale links**: Links created during the debugging phase (when snapshot was temporarily simplified to `{title}` only) only show the task title. Re-sharing the task generates a new full-data link.
- **No revocation UI**: Owner can't invalidate a link from the app (deletion requires direct Firestore access). Future enhancement.
- **Expiry**: `expiresAt` is checked at read time by Firestore rules. Expired links return a permission error, not a 404 — handled gracefully in `SharedTaskPage` with an "expired link" error state.

**Type:** feature  
**Tags:** feature, phase3, collaboration, sharing, firestore, routing, react-router  
**Updated:** 4/27/2026
