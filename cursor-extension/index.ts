import * as vscode from "vscode";
import { promptAndConfigureMcp } from "./configureMcp";
import { installHooks } from "./installHooks";
import { HimemClient } from "../himemClient";
import { ThreadsPanelProvider } from "../sidebar/threadsPanel";

function getClient(): HimemClient | undefined {
  const config = vscode.workspace.getConfiguration("himem");
  const apiKey = config.get<string>("apiKey") ?? "";

  if (!apiKey) {
    return undefined;
  }

  const project =
    config.get<string>("project") ||
    vscode.workspace.workspaceFolders?.[0]?.name ||
    "default";

  return new HimemClient({
    apiKey,
    apiUrl: config.get<string>("apiUrl") ?? "https://api.himem.ai",
    project,
  });
}

export function registerCommands(
  context: vscode.ExtensionContext,
  threadsPanel: ThreadsPanelProvider,
  onStatusChange: () => void
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("himem.configure", async () => {
      await promptAndConfigureMcp();
      onStatusChange();
    }),

    vscode.commands.registerCommand("himem.installHooks", async () => {
      try {
        await installHooks(context.extensionPath);
        vscode.window.showInformationMessage("HiMem session hooks installed.");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to install hooks.";
        vscode.window.showErrorMessage(message);
      }
    }),

    vscode.commands.registerCommand("himem.loadContext", async () => {
      const client = getClient();
      if (!client) {
        await promptAndConfigureMcp();
        return;
      }

      const days =
        vscode.workspace.getConfiguration("himem").get<number>("contextDays") ??
        7;

      try {
        const result = await client.loadContext(days);
        const summary = client.formatContextSummary(result);
        const doc = await vscode.workspace.openTextDocument({
          content: summary,
          language: "markdown",
        });
        await vscode.window.showTextDocument(doc, { preview: true });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load context.";
        vscode.window.showErrorMessage(message);
      }
    }),

    vscode.commands.registerCommand("himem.refreshThreads", async () => {
      await threadsPanel.refresh();
      onStatusChange();
    })
  );
}

export { getClient };