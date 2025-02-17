import { bemhtml } from "bem-xjst";
import { readFileSync } from "fs";
import { basename, join, resolve } from "path";

import * as vscode from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient";

const previewPath: string = resolve(__dirname, "../preview/index.html");
const previewHtml: string = readFileSync(previewPath).toString();
const template = bemhtml.compile();

let client: LanguageClient;
const PANELS: Record<string, vscode.WebviewPanel> = {};

const createLanguageClient = (
  context: vscode.ExtensionContext
): LanguageClient => {
  const serverModulePath = context.asAbsolutePath(join("out", "server.js"));

  const serverOptions: ServerOptions = {
    debug: {
      module: serverModulePath,
      options: { execArgv: ["--nolazy", "--inspect=6009"] },
      transport: TransportKind.ipc,
    },
    run: {
      module: serverModulePath,
      transport: TransportKind.ipc,
    },
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      {
        language: "json",
        scheme: "file",
      },
      {
        language: "jsonc",
        scheme: "file",
      },
    ],
    synchronize: {
      configurationSection: "example",
    },
  };

  client = new LanguageClient(
    "languageServerExample",
    "Language Server Example",
    serverOptions,
    clientOptions
  );

  return client;
};

const setPreviewContent = (
  doc: vscode.TextDocument,
  context: vscode.ExtensionContext
) => {
  const panel = PANELS[doc.uri.path];

  if (panel) {
    const mediaPath = vscode.Uri.file(context.extensionPath)
      .with({
        scheme: "vscode-resource",
      })
      .toString();

    try {
      const json = doc.getText();
      const data = JSON.parse(json);
      const html = template.apply(data);
      panel.webview.html = previewHtml
        .replace("{{content}}", html)
        .replace("{{mediaPath}}", mediaPath);
    } catch (e) {
      console.error("HTML embedding error");
    }
  }
};

const initPreviewPanel = (document: vscode.TextDocument) => {
  const fileName = basename(document.fileName);

  const panel = vscode.window.createWebviewPanel(
    "example.preview",
    `Preview: ${fileName}`,
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
    }
  );

  PANELS[document.uri.path] = panel;

  const e = panel.onDidDispose(() => {
    delete PANELS[document.uri.path];
    e.dispose();
  });

  return panel;
};

const openPreview = (context: vscode.ExtensionContext) => {
  const editor = vscode.window.activeTextEditor;

  if (editor !== undefined) {
    const document: vscode.TextDocument = editor.document;

    const path = document.uri.fsPath;
    const panel = PANELS[path];

    if (panel) {
      panel.reveal();
    } else {
      const panel = initPreviewPanel(document);
      setPreviewContent(document, context);
      context.subscriptions.push(panel);
    }
  }
};

export function activate(context: vscode.ExtensionContext) {
  console.info("Congratulations, your extension is now active!");

  client = createLanguageClient(context);

  client.start();

  const eventChange: vscode.Disposable = vscode.workspace.onDidChangeTextDocument(
    (e: vscode.TextDocumentChangeEvent) =>
      setPreviewContent(e.document, context)
  );

  const previewCommand = vscode.commands.registerCommand(
    "example.showPreviewToSide",
    () => openPreview(context)
  );

  context.subscriptions.push(previewCommand, eventChange);
}

export function deactivate() {
  client.stop();
}
