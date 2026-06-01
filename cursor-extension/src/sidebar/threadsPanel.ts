import * as vscode from "vscode";
import { HimemClient } from "../himemClient";
import { getClient } from "../commands";

export class ThreadsPanelProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "himem.threadsPanel";

  private view?: vscode.WebviewView;

  constructor(private readonly extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this.view = webviewView;

    webviewView.webview.options = {
      enableScripts: false,
    };

    webviewView.webview.onDidReceiveMessage(async (message) => {
      if (message?.type === "refresh") {
        await this.refresh();
      }
    });

    void this.refresh();
  }

  async refresh(): Promise<void> {
    if (!this.view) {
      return;
    }

    const client = getClient();

    if (!client) {
      this.view.webview.html = this.renderHtml(
        "HiMem not configured",
        "Run **HiMem: Configure API Key & MCP** from the command palette."
      );
      return;
    }

    try {
      const result = await client.getThreads();
      const body = client.formatThreadsSummary(result);
      this.view.webview.html = this.renderHtml("Threads", body);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load threads.";
      this.view.webview.html = this.renderHtml("Error", message);
    }
  }

  private renderHtml(title: string, body: string): string {
    const escaped = body
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      padding: 12px;
      margin: 0;
      white-space: pre-wrap;
      line-height: 1.5;
    }
    h2 {
      margin: 0 0 12px;
      font-size: 1.1em;
    }
  </style>
</head>
<body>
  <h2>${title}</h2>
  <pre>${escaped}</pre>
</body>
</html>`;
  }
}