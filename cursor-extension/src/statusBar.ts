import * as vscode from "vscode";
import { HimemClient } from "./himemClient";

export class HimemStatusBar {
  private readonly item: vscode.StatusBarItem;

  constructor() {
    this.item = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    this.item.command = "himem.configure";
  }

  async update(client?: HimemClient): Promise<void> {
    if (!client) {
      this.item.text = "$(database) HiMem: not configured";
      this.item.tooltip = "Click to configure HiMem API key";
      this.item.show();
      return;
    }

    try {
      const status = await client.status();

      this.item.text = `$(database) HiMem: ${client.project} (${status.plan ?? "?"})`;
      this.item.tooltip = `HiMem connected — ${status.email ?? "unknown"}`;
      this.item.command = "himem.refreshThreads";
    } catch {
      this.item.text = "$(warning) HiMem: offline";
      this.item.tooltip = "HiMem API unreachable — check key and network";
      this.item.command = "himem.configure";
    }

    this.item.show();
  }

  dispose(): void {
    this.item.dispose();
  }
}