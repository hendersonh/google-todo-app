const { StorageManager } = require('../.agent-memory-engine/out/mcp-server/storage');
const path = require('path');

async function testSearch() {
  const manager = new StorageManager(path.resolve(__dirname, '../.agentMemory'));
  const projectId = 'google-todo-app';
  
  console.log('--- Searching for "persistence" ---');
  const results = await manager.search(projectId, 'persistence');
  results.forEach(m => console.log(`[${m.key}] ${m.content}`));
}

testSearch().catch(console.error);
