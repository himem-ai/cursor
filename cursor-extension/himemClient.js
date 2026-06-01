#!/usr/bin/env node
/**
 * Shared HiMem API client for Cursor hooks (Node 18+, no dependencies).
 */

const HIMEM_API = process.env.HIMEM_API || "https://api.himem.ai";
const HIMEM_KEY = process.env.HIMEM_KEY;
const HIMEM_PROJECT = process.env.HIMEM_PROJECT || "default";

async function himem(path, method = "GET", body = null) {
  if (!HIMEM_KEY) {
    throw new Error("HIMEM_KEY required. Set in .cursor/mcp.json or environment.");
  }

  const res = await fetch(`${HIMEM_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${HIMEM_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : null,
  });

  return res.json();
}

function formatContext(result) {
  let output = "";

  if (result.context) {
    output += `PROJECT CONTEXT:\n${result.context}\n\n`;
  }

  if (result.history?.length) {
    output += `RECENT HISTORY (${result.history.length} messages):\n`;
    output += result.history
      .slice(-10)
      .map(
        (m) =>
          `${String(m.role).toUpperCase()}: ${String(m.content || "").substring(0, 200)}`
      )
      .join("\n");
  }

  if (!output) {
    output = `No context found for project: ${HIMEM_PROJECT}`;
  }

  return output;
}

async function loadContext(days = 7) {
  const project = encodeURIComponent(HIMEM_PROJECT);
  const result = await himem(
    `/context/load?project=${project}&days=${days}`
  );
  return formatContext(result);
}

async function saveSession(messages) {
  return himem("/session/save", "POST", {
    project: HIMEM_PROJECT,
    messages,
  });
}

module.exports = {
  HIMEM_API,
  HIMEM_KEY,
  HIMEM_PROJECT,
  loadContext,
  saveSession,
};