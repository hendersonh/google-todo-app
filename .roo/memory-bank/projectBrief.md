## firestore_schema_tasks

# Firestore Data Schema - tasks collection
The main collection used in the application is `tasks`.

## Document Structure
| Field | Type | Description |
|-------|------|-------------|
| `title` | string | The title of the task |
| `details` | string | Detailed description |
| `completed` | boolean | Completion status |
| `starred` | boolean | Priority/starred status |
| `category` | string | e.g., 'personal', 'work' |
| `recurrence` | string | 'none', 'daily', 'weekly', 'monthly' |
| `subtasks` | array | Array of objects: `{ id, text, completed }` |
| `createdAt` | timestamp | Server timestamp |
| `dueDate` | string | YYYY-MM-DD format (used for recurrence calculation) |

## Implementation Details
- Managed by `TaskService.js`.
- Uses `onSnapshot` for real-time updates.
- Recurrence logic is handled client-side before adding the next instance.

**Type:** architecture  
**Tags:** firestore, schema, tasks  
**Updated:** 4/25/2026


## project-architecture-v2

# Project Architecture - Google Todo App

The application is a premium SPA built with Vite, React, and Firebase, designed for real-time multi-tab synchronization and a seamless Google-inspired UX.

## Core Services
- **Firebase Authentication**: Manages user sessions and identity.
- **Cloud Firestore**: Acts as the single source of truth for all data.
- **`TaskService.js`**: The central engine for data mutations, recurrence logic, and real-time subscriptions (`onSnapshot`).

## Data Model
### `tasks` collection
- Tracks task title, details, status (`completed`), priority (`starred`), and subtasks.
- References `categories` via ID.
- Stores `dueDate` in YYYY-MM-DD format for timeline and recurrence calculations.

### `categories` collection
- Stores custom user lists with `label` and auto-assigned `color` (hex).
- Filtered by `ownerUid` for privacy.

## UI Architecture
- **State Management**: Uses React `useState` and `useEffect` hooks to bridge Firestore real-time streams with the UI.
- **Sidebar**: A flexible layout with a scrollable navigation area for custom lists and a pinned authentication footer.
- **Modals**: Atomic components (`TaskModal`, `CategoryModal`) handle complex input flows.
- **Timeline**: A specialized view for scheduling and visualizing task distribution over 7 days.

## Design Philosophy
- **Premium Aesthetics**: Harmonious Google palette, smooth transitions, and subtle micro-animations.
- **Auto-Assigned Colors**: Prevents visual clutter by managing color consistency server-side.

**Type:** architecture  
**Tags:** architecture, overview, firebase  
**Updated:** 4/26/2026


## perm-shared-read-v1

# Architecture: Shared-Read / Private-Write Permissions

### Overview
The application implements a "Community Task Board" feel where all authenticated users can see each other's tasks, but only the creator can modify or delete them.

### Implementation Details
- **Firestore Rules**: 
  - `tasks`: `allow read: if isAuthenticated()`.
  - `tasks`: `allow create, update, delete: if isOwner(resource.data.userId)`.
- **Frontend Enforcement**:
  - `TaskModal` receives an `isReadOnly` prop (`task.userId !== user.uid`).
  - Read-only mode hides "Save" and "Delete" buttons and disables input fields.
  - Quick actions (toggle completed, star) are guarded in `App.jsx` and trigger a `StatusModal` if the user is not the owner.
- **Identity Display**:
  - Shared tasks display a "Shared by [Email/Name]" badge.
  - Uses `task.ownerName` field (synced from `user.displayName` or `user.email` at creation time).

### Rationale
Encourages collaboration and visibility while maintaining data integrity and security.

**Type:** architecture  
**Tags:** security, architecture, permissions, firestore  
**Updated:** 4/26/2026
