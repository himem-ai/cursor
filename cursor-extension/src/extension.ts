import * as vscode from "vscode";
import { registerCommands, getClient } from "./commands";
import { installHooks } from "./commands/installHooks";
import { promptAndConfigureMcp, configureMcp } from "./commands/configureMcp";
import { HimemStatusBar } from "./statusBar";
import { ThreadsPanelProvider } from "./sidebar/threadsPanel";

export async function activate(
  context: vscode.ExtensionContext
): Promise<void> {
  const statusBar = new HimemStatusBar();
  const threadsPanel = new ThreadsPanelProvider(context.extensionUri);

  const refreshStatus = async (): Promise<void> => {
    await statusBar.update(getClient());
  };

  context.subscriptions.push(
    statusBar,
    vscode.window.registerWebviewViewProvider(
      ThreadsPanelProvider.viewType,
      threadsPanel
    )
  );

  registerCommands(context, threadsPanel, () => {
    void refreshStatus();
  });

  const config = vscode.workspace.getConfiguration("himem");
  const apiKey = config.get<string>("apiKey") ?? "";

  if (!apiKey) {
    void vscode.window
      .showInformationMessage(
        "Configure HiMem for persistent memory across sessions?",
        "Configure",
        "Later"
      )
      .then((choice) => {
        if (choice === "Configure") {
          void promptAndConfigureMcp();
        }
      });
  } else if (config.get<boolean>("autoConfigureMcp")) {
    try {
      const project =
        config.get<string>("project") ||
        vscode.workspace.workspaceFolders?.[0]?.name ||
        "default";
      const scope = vscode.workspace.workspaceFolders?.length
        ? ("workspace" as const)
        : ("user" as const);
      await configureMcp(apiKey, project, scope);
    } catch {
      // workspace may be unavailable
    }
  }

  if (config.get<boolean>("autoInstallHooks")) {
    try {
      await installHooks(context.extensionPath);
    } catch {
      // no workspace open
    }
  }

  await refreshStatus();
}

export function deactivate(): void {}