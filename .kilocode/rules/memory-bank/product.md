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
