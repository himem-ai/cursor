#!/usr/bin/env node
/**
 * sessionStart — loads HiMem project context and injects it for the agent.
 * Reads HIMEM_KEY / HIMEM_PROJECT from env (set via MCP config or shell).
 */

const { loadContext } = require("./lib/himemClient");

async function main() {
  let input = {};
  try {
    const raw = await readStdin();
    if (raw.trim()) {
      input = JSON.parse(raw);
    }
  } catch {
    // optional stdin
  }

  const days = Number(process.env.HIMEM_CONTEXT_DAYS || 7);

  try {
    const summary = await loadContext(days);
    const output = {
      additional_context: `[HiMem — loaded at session start]\n\n${summary}`,
    };
    process.stdout.write(JSON.stringify(output));
    process.exit(0);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stdout.write(
      JSON.stringify({
        additional_context: `[HiMem] Could not load context: ${message}`,
      })
    );
    process.exit(0);
  }
}

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => resolve(data));
  });
}

main();