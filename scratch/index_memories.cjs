const { StorageManager } = require('../.agent-memory-engine/out/mcp-server/storage');
const path = require('path');

async function indexMemories() {
  const manager = new StorageManager(path.resolve(__dirname, '../.agentMemory'));
  const projectId = 'google-todo-app';
  
  const memories = [
    {
      key: 'persistence-v1',
      type: 'decision',
      content: 'Implemented a Single Source of Truth persistence layer. State is initialized directly from localStorage. A useEffect hook watches the tasks state and persists changes instantly. Added a window storage event listener to synchronize tasks across multiple browser tabs.',
      tags: ['persistence', 'localStorage', 'sync', 'architecture'],
      metadata: { importance: 'critical', file: 'App.jsx' }
    },
    {
      key: 'categorization-v1',
      type: 'pattern',
      content: 'Added color-coded task categorization (Personal, Work, Urgent, Shopping). Implemented context-aware filtering where the sidebar acts as a list switcher, filtering the main view based on the task.category field.',
      tags: ['categorization', 'filtering', 'ui'],
      metadata: { importance: 'high', component: 'TaskModal' }
    },
    {
      key: 'search-v1',
      type: 'feature',
      content: 'Universal real-time search implemented in the header. Filters tasks by matching searchQuery against both title and details. Integrated into the main task filtering pipeline to work alongside category and status filters.',
      tags: ['search', 'ux'],
      metadata: { importance: 'medium', component: 'App.jsx' }
    },
    {
      key: 'insights-v1',
      type: 'feature',
      content: 'Productivity Insights dashboard calculates real-time completion rates and categorical focus breakdown. Uses CSS-only progress bars for focus analysis. Updates dynamically as tasks are completed.',
      tags: ['analytics', 'insights', 'dashboard'],
      metadata: { importance: 'medium', component: 'StatsDashboard' }
    }
  ];

  for (const memory of memories) {
    await manager.write(projectId, {
      ...memory,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: { ...memory.metadata, accessCount: 0 }
    });
    console.log(`Indexed memory: ${memory.key}`);
  }
}

indexMemories().catch(console.error);
