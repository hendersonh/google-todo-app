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
