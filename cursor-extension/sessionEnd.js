#!/usr/bin/env node
/**
 * sessionEnd — placeholder for session persistence.
 * Full message capture requires agent/MCP save_session; extend when hook payload includes messages.
 */

const { saveSession } = require("./lib/himemClient");

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

  const messages = input.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    process.stdout.write(JSON.stringify({ ok: true, skipped: true }));
    process.exit(0);
  }

  try {
    const result = await saveSession(messages);
    process.stdout.write(JSON.stringify(result));
    process.exit(0);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`[HiMem sessionEnd] ${message}\n`);
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