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
