---
name: himem
description: Persistent memory for Cursor via HiMem MCP. Use for load_context, remember, recall, search, threads, and save_session across sessions.
---

# HiMem Skill

## When to use

- Starting a new agent session on a project with HiMem configured
- User asks what was decided or discussed previously
- User wants to save architecture, decisions, or facts permanently
- Tracking open vs resolved work across sessions

## Instructions

1. Call `load_context` with the workspace project name at session start.
2. Use `get_threads` to see open and recently resolved topics.
3. Use `search` for natural-language queries over past sessions.
4. Use `remember` / `recall` for key-value facts.
5. Use `save_session` before ending substantive work sessions.
6. Use `resolve_thread` when a topic is complete.

## MCP tools

`remember`, `recall`, `list_memories`, `forget`, `load_context`, `save_context`, `save_session`, `search`, `get_threads`, `resolve_thread`, `status`