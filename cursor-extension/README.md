# HiMem for 

Two ways to connect HiMem to Cursor:

---

## Option A — MCP URL (recommended, no install)

Paste one JSON file. Done in 30 seconds.

...mcp.json instructions...found in himem-ai/cursor/cursor

---

## Option B — VS Code Extension (full UI)

Includes status bar, threads sidebar, auto-config, and session hooks.
Requires Node + npm.

Persistent memory for Cursor — context, threads, and history across sessions.

## What's included

| Component | Purpose |
|-----------|---------|
| **VS Code extension** | Status bar, threads sidebar, MCP auto-config |
| **MCP** (`himem-mcp`) | Agent tools: remember, recall, search, threads, etc. |
| **Hooks** | Auto `load_context` on session start |
| **Rules + skill** | Guide the agent to use HiMem |

## Quick start (development)

1. Install dependencies and compile:

   ```bash
   cd himem-cursor
   npm install
   npm run compile
   ```

2. Press **F5** in VS Code/Cursor to launch Extension Development Host.

3. Run **HiMem: Configure API Key & MCP** from the command palette.

4. Reload Cursor so MCP connects.

5. Open the **HiMem** activity bar icon to view threads.

## Configuration

| Setting | Description |
|---------|-------------|
| `himem.apiKey` | API key from [himem.ai](https://himem.ai) |
| `himem.project` | Project name (defaults to workspace folder name) |
| `himem.apiUrl` | API base URL (default `https://api.himem.ai`) |
| `himem.autoConfigureMcp` | Write `.cursor/mcp.json` on activate |
| `himem.autoInstallHooks` | Copy session hooks into workspace `.cursor/` |
| `himem.contextDays` | Days of history for session start hook |

## Commands

- **HiMem: Configure API Key & MCP** — set key and write MCP config
- **HiMem: Load Project Context** — open context summary in editor
- **HiMem: Install Session Hooks** — copy hooks to `.cursor/hooks/`
- **HiMem: Refresh Threads** — refresh sidebar

## Project structure

```text
himem-cursor/
├── .cursor-plugin/plugin.json   # Cursor Marketplace manifest
├── mcp.json                       # Bundled MCP config for plugin
├── src/                           # VS Code extension (TypeScript)
├── hooks/                         # Session hooks (installed to .cursor/)
├── rules/                         # Agent rules
└── skills/himem/                  # Agent skill
```

## Hooks note

`sessionEnd` saves only when the hook payload includes `messages`. Use MCP `save_session` from the agent for full conversation persistence until Cursor exposes messages in `sessionEnd`.

## License

MIT
