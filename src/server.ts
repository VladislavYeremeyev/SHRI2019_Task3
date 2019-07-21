import {
  createConnection,
  Diagnostic,
  DiagnosticSeverity,
  DidChangeConfigurationParams,
  ProposedFeatures,
  TextDocument,
  TextDocuments,
} from "vscode-languageserver";

import { basename } from "path";

import * as jsonToAst from "json-to-ast";

import { IExampleConfiguration, RuleKeys, Severity } from "./configuration";
import { ILinterProblem, makeLint } from "./linter";

const conn = createConnection(ProposedFeatures.all);
const docs = new TextDocuments();
let conf: IExampleConfiguration | undefined;

conn.onInitialize(() => {
  return {
    capabilities: {
      textDocumentSync: docs.syncKind,
    },
  };
});

conn.onDidChangeConfiguration(({ settings }: DidChangeConfigurationParams) => {
  conf = settings.example;
  validateAll();
});

function getDiagnosticMessage(key: RuleKeys): string {
  switch (key) {
    case RuleKeys.UppercaseNamesIsForbidden:
      return "Uppercase properties are forbidden!";
    case RuleKeys.BlockNameIsRequired:
      return "Field named 'block' is required!";
    default:
      return `Unknown problem type '${key}'`;
  }
}

function getDiagnosticSeverity(key: RuleKeys): DiagnosticSeverity | undefined {
  if (!conf || !conf.severity) {
    return undefined;
  }

  const severity: Severity = conf.severity[key];

  switch (severity) {
    case Severity.Error:
      return DiagnosticSeverity.Error;
    case Severity.Warning:
      return DiagnosticSeverity.Warning;
    case Severity.Information:
      return DiagnosticSeverity.Information;
    case Severity.Hint:
      return DiagnosticSeverity.Hint;
    default:
      return undefined;
  }
}

async function validateAll() {
  for (const document of docs.all()) {
    await validateTextDocument(document);
  }
}

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  if (conf!.enable) {
    const source = basename(textDocument.uri);
    const json = textDocument.getText();

    const validateProperty = (
      property: jsonToAst.AstProperty
    ): ILinterProblem<RuleKeys>[] =>
      /^[A-Z]+$/.test(property.key.value)
        ? [{ key: RuleKeys.UppercaseNamesIsForbidden, loc: property.key.loc }]
        : [];

    const validateObject = (
      obj: jsonToAst.AstObject
    ): ILinterProblem<RuleKeys>[] =>
      obj.children.some((p) => p.key.value === "block")
        ? []
        : [{ key: RuleKeys.BlockNameIsRequired, loc: obj.loc }];

    const diagnostics: Diagnostic[] = makeLint(
      json,
      validateProperty,
      validateObject
    ).reduce(
      (list: Diagnostic[], problem: ILinterProblem<RuleKeys>): Diagnostic[] => {
        const severity = getDiagnosticSeverity(problem.key);

        if (severity) {
          const message = getDiagnosticMessage(problem.key);

          const diagnostic: Diagnostic = {
            message,
            range: {
              end: textDocument.positionAt(problem.loc.end.offset),
              start: textDocument.positionAt(problem.loc.start.offset),
            },
            severity,
            source,
          };

          list.push(diagnostic);
        }

        return list;
      },
      []
    );

    if (diagnostics.length) {
      conn.sendDiagnostics({ uri: textDocument.uri, diagnostics });
    }
  } else {
    const diagnostics: Diagnostic[] = [];
    conn.sendDiagnostics({ uri: textDocument.uri, diagnostics });
  }
}

docs.onDidChangeContent((change) => {
  validateTextDocument(change.document);
});

docs.listen(conn);
conn.listen();
