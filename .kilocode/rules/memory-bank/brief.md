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
