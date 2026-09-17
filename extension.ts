import * as vscode from 'vscode';

import { chat } from './chatbot/chat';

export function activate(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand(
    'playwright-agentic-devsecops.chat',
    async () => {
      const input = await vscode.window.showInputBox({
        prompt: 'Ask the Playwright Agentic Development Assistant',
        placeHolder: 'e.g. Analyze the Playwright test architecture',
      });

      if (!input?.trim()) {
        return;
      }

      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'Agent is working...',
          },
          async () => {
            const response = await chat(input.trim());

            const panel = vscode.window.createWebviewPanel(
              'playwrightAgenticResponse',
              'Agent Response',
              vscode.ViewColumn.Beside,
              {
                enableScripts: false,
              },
            );

            panel.webview.html = `
              <!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta
                  name="viewport"
                  content="width=device-width, initial-scale=1.0"
                >
                <title>Agent Response</title>
              </head>
              <body>
                <h1>Playwright Agentic Development Assistant</h1>
                <pre>${escapeHtml(response)}</pre>
              </body>
              </html>
            `;
          },
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        vscode.window.showErrorMessage(`Agent error: ${message}`);
      }
    },
  );

  context.subscriptions.push(disposable);
}

export function deactivate(): void {
  // Nothing to clean up.
}

function escapeHtml(value: string): string {
  // The webview has scripts disabled; this complete entity mapping keeps the
  // agent response as text inside the <pre> element.
  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return value.replace(/[&<>"']/g, (character) => entities[character] ?? character);
}
