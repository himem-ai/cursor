import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

export async function installHooks(extensionPath: string): Promise<void> {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders?.length) {
    throw new Error("Open a workspace folder to install HiMem hooks.");
  }

  const workspaceRoot = folders[0].uri.fsPath;
  const cursorDir = path.join(workspaceRoot, ".cursor");
  const hooksDir = path.join(cursorDir, "hooks");
  const sourceHooksDir = path.join(extensionPath, "hooks");
  const sourceHooksJson = path.join(sourceHooksDir, "hooks.json");
  const targetHooksJson = path.join(cursorDir, "hooks.json");

  if (!fs.existsSync(cursorDir)) {
    fs.mkdirSync(cursorDir, { recursive: true });
  }

  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
  }

  copyDir(path.join(sourceHooksDir, "lib"), path.join(hooksDir, "lib"));
  for (const file of ["sessionStart.js", "sessionEnd.js"]) {
    fs.copyFileSync(
      path.join(sourceHooksDir, file),
      path.join(hooksDir, file)
    );
  }

  const hooksConfig = JSON.parse(
    fs.readFileSync(sourceHooksJson, "utf8")
  ) as {
    version: number;
    hooks: Record<string, unknown[]>;
  };

  const workspaceHooks = {
    version: hooksConfig.version,
    hooks: Object.fromEntries(
      Object.entries(hooksConfig.hooks).map(([event, entries]) => [
        event,
        (entries as Array<{ command: string }>).map((entry) => ({
          ...entry,
          command: entry.command.replace(/^\.\/hooks\//, ".cursor/hooks/"),
        })),
      ])
    ),
  };

  fs.writeFileSync(
    targetHooksJson,
    `${JSON.stringify(workspaceHooks, null, 2)}\n`,
    "utf8"
  );
}

function copyDir(source: string, target: string): void {
  if (!fs.existsSync(source)) {
    return;
  }

  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name);
    const to = path.join(target, entry.name);

    if (entry.isDirectory()) {
      copyDir(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}