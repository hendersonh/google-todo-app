## skill-index-v1

# Active Skills Index - google-todo-app
A list of skills currently utilized and preferred for this project.
- **agent-memory-mcp**: Used for project-wide indexing and fast context recall.
- **kaizen**: The primary framework for brainstorming and continuous feature improvement.
- **concise-planning**: Used for creating atomic implementation plans for new features.
- **git-pushing**: Managed workflow for conventional commits and remote synchronization.
- **frontend-design**: Used for Google/Material-inspired UI and aesthetics.
- **systematic-debugging**: Used for diagnosing and fixing complex state/persistence issues.


**Type:** pattern  
**Tags:** meta, skills, index  
**Updated:** 4/25/2026


## pattern-auto-color-assignment

# Design Pattern: Auto-assigned Google Palette

To maintain a premium, consistent Google-inspired aesthetic without forcing users to make complex design choices, we use an auto-assignment pattern for dynamic categories.

## Implementation Details
- **Palette**: A constant `GOOGLE_PALETTE` in `TaskService.js` contains 8 curated hex codes (`#4285F4`, `#34A853`, `#FBBC05`, `#EA4335`, etc.).
- **Assignment**: On category creation, a color is randomly selected from this palette:
  ```javascript
  const randomColor = GOOGLE_PALETTE[Math.floor(Math.random() * GOOGLE_PALETTE.length)];
  ```
- **Persistence**: The color is stored in the `categories` document in Firestore.
- **Rendering**: Components like `TaskModal` and `App` use the hex code directly in inline styles for background colors or borders, ensuring total visual accuracy across the app.

## Benefits
- **Consistency**: The UI never feels cluttered or "unprofessional" from user color choices.
- **Simplicity**: One less step for the user during list creation.
- **Scalability**: New colors can be added to the palette array without changing any logic.

**Type:** pattern  
**Tags:** design-pattern, ui-design, google-palette, ux  
**Updated:** 4/26/2026


## pattern-auth-only-categories

# Pattern: Auth-Only Custom Lists
Custom categories (lists) are now strictly an authenticated feature.
- Guests see 4 default categories: Personal, Work, Urgent, Shopping.
- The `+` button in the sidebar is wrapped in a `{user && (...)}` block.
- `TaskService.addCategory` requires a `ownerUid` and will fail if the user is not authenticated (enforced by Firestore Rules).

**Type:** pattern  
**Tags:** frontend, auth, categories  
**Updated:** 4/26/2026


## filter-completed-split-v1

# Pattern: Mutually Exclusive Active/Completed Views

### Context
To maintain a clean "Inbox Zero" feel, tasks should not clutter active lists once they are finished.

### Pattern
- **Strict Filtering**: All tabs (All Tasks, Starred, Custom Lists, Schedule/Timeline) explicitly filter out completed tasks: `!task.completed`.
- **Dedicated Archive**: The "Completed" tab is the **only** place where finished tasks are displayed.
- **Dynamic Migration**: Toggling a task as "Completed" immediately removes it from the current view and moves it to the archive. Untoggling it returns it to its original category/tab.

### Implementation
Centralized in `filteredTasks` calculation within `App.jsx` and filtered queries in `TimelineView.jsx`.

**Type:** pattern  
**Tags:** ux, filtering, pattern  
**Updated:** 4/26/2026
