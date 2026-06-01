# HiMem — Cursor Plugin

Persistent memory for Cursor. Load and save project context across every session.

## Setup

1. Get your API key at [himem.ai](https://himem.ai)
2. Copy `mcp.json` to one of:
   - `~/.cursor/mcp.json` — works in all projects
   - `.cursor/mcp.json` — works in this project only
3. Replace `YOUR_HIMEM_KEY_HERE` with your `hm_live_...` key
4. Restart Cursor

## Usage

Cursor will automatically have access to these tools:

- `load_context` — load project memory at session start
- `save_context` — save important decisions and progress
- `remember` / `recall` — store and retrieve key/value memory
- `search` — semantic search over conversation history
- `get_threads` — view open and resolved threads
- `status` — check connection status

## No install required

The plugin connects directly to `mcp.himem.ai` — no Node, no npm, no CLI.
Always the latest version automatically.

## LICENSE

MIT
