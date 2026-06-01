import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";

export interface McpConfig {
  mcpServers: Record<
    string,
    {
      command: string;
      args?: string[];
      env?: Record<string, string>;
    }
  >;
}

export function getMcpConfigPath(scope: "workspace" | "user"): string {
  if (scope === "workspace") {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders?.length) {
      throw new Error("Open a workspace folder to configure project MCP.");
    }
    return path.join(folders[0].uri.fsPath, ".cursor", "mcp.json");
  }

  return path.join(os.homedir(), ".cursor", "mcp.json");
}

export function buildHimemMcpConfig(
  apiKey: string,
  project: string
): McpConfig {
  return {
    mcpServers: {
      himem: {
        command: "npx",
        args: ["-y", "himem-mcp"],
        env: {
          HIMEM_KEY: apiKey,
          HIMEM_PROJECT: project,
        },
      },
    },
  };
}

function mergeMcpConfig(existing: McpConfig, incoming: McpConfig): McpConfig {
  return {
    mcpServers: {
      ...existing.mcpServers,
      ...incoming.mcpServers,
    },
  };
}

function readExistingMcpConfig(configPath: string): McpConfig {
  if (!fs.existsSync(configPath)) {
    return { mcpServers: {} };
  }

  const raw = fs.readFileSync(configPath, "utf8");
  const parsed = JSON.parse(raw) as McpConfig;
  return parsed.mcpServers ? parsed : { mcpServers: {} };
}

export async function configureMcp(
  apiKey: string,
  project: string,
  scope: "workspace" | "user" = "workspace"
): Promise<string> {
  const configPath = getMcpConfigPath(scope);
  const dir = path.dirname(configPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const existing = readExistingMcpConfig(configPath);
  const merged = mergeMcpConfig(existing, buildHimemMcpConfig(apiKey, project));

  fs.writeFileSync(configPath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
  return configPath;
}

export async function promptAndConfigureMcp(): Promise<void> {
  const config = vscode.workspace.getConfiguration("himem");
  let apiKey = config.get<string>("apiKey") ?? "";

  if (!apiKey) {
    const input = await vscode.window.showInputBox({
      prompt: "Enter your HiMem API key",
      placeHolder: "Get one at https://himem.ai",
      ignoreFocusOut: true,
      password: true,
    });

    if (!input) {
      return;
    }

    apiKey = input;
    await config.update("apiKey", apiKey, vscode.ConfigurationTarget.Global);
  }

  const project =
    config.get<string>("project") ||
    vscode.workspace.workspaceFolders?.[0]?.name ||
    "default";

  const scope = vscode.workspace.workspaceFolders?.length
    ? ("workspace" as const)
    : ("user" as const);

  const configPath = await configureMcp(apiKey, project, scope);

  vscode.window.showInformationMessage(
    `HiMem MCP configured at ${configPath}. Reload Cursor to connect.`
  );
}
