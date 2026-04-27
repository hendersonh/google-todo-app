## bug-category-leak-v1

# Bug: Custom Category Privacy Leak (Fixed)

### Symptom
All authenticated users could see and download custom categories created by other users.

### Root Cause
- `TaskService.js`: `subscribeToCategories` lacked an `ownerUid` filter in the Firestore query.
- `firestore.rules`: Rules allowed `read: if isAuthenticated()` without owner-check.

### Fix
- Added `where("ownerUid", "==", userId)` to the subscription query.
- Updated `firestore.rules` to strictly allow `read, write` only if `resource.data.ownerUid == request.auth.uid`.

### Status
Verified and Fixed. Deployment complete.

**Type:** bug  
**Tags:** bug, security, privacy, firestore  
**Updated:** 4/26/2026


## bug-timestamp-recurrence-v1

# Bug: Recurrence Timestamp Corruption (Fixed)

### Symptom
Recurring tasks were being created with string `createdAt` fields instead of Firestore Timestamps, breaking database ordering.

### Root Cause
In `TaskService.addTask`, the `...taskData` spread was positioned after `createdAt: serverTimestamp()`. Since cloned tasks from `handleRecurrence` contain a string `createdAt`, they were overwriting the server token.

### Fix
Reordered the object assignment so `createdAt: serverTimestamp()` is the final field, ensuring Firestore always generates the timestamp regardless of incoming data.

### Status
Fixed in `TaskService.js`.

**Type:** bug  
**Tags:** bug, data-integrity, firestore, recurrence  
**Updated:** 4/26/2026


## bug-search-crash-v1

# Bug: UI Crash on Search (Fixed)

### Symptom
Application would crash with `Cannot read property 'toLowerCase' of undefined` if a task with a missing title was encountered during a search.

### Root Cause
The `filteredTasks` logic in `App.jsx` lacked null-checks for `task.title` before calling string methods.

### Fix
Added defensive `(task.title && ...)` checks to the search filter logic.

### Status
Fixed in `App.jsx`.

**Type:** bug  
**Tags:** bug, stability, ui-crash, search  
**Updated:** 4/26/2026


## bug-sidebar-collision-v1

# Bug: Sidebar Category Collision (Fixed)

### Symptom
Duplicate categories (e.g., two "Personal" lists) appeared in the sidebar if a user created a list with a default name.

### Root Cause
`App.jsx` was merging hardcoded `defaults` and `dynamicCats` from Firestore without deduplicating IDs.

### Fix
Added a filter to `uniqueDynamic` categories that removes any items with IDs already present in the `defaults` array.

### Status
Fixed in `App.jsx`.

**Type:** bug  
**Tags:** bug, ux-polish, categories, sidebar  
**Updated:** 4/26/2026
