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

import { IExampleConfiguration, ILinterProblem, RuleErrorText, RuleKeys, Severity } from "./configuration";
import { checkContentElementRules } from "./formContentElementCheck";
import { checkContentItemElementRules } from "./formContentItemElementCheck";
import { checkFooterRules } from "./formFooterCheck";
import { checkHeaderRules } from "./formHeaderCheck";
import { checkFormContentSize } from "./formReferenceSizeCheck";
import { makeLint } from "./linter";
import { isBlock } from "./utils";

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
    case RuleKeys.FormElementsSizeShouldBeEqual:
      return RuleErrorText['FormElementsSizeShouldBeEqual'];
    case RuleKeys.FormContentVerticalSpaceIsInvalid:
      return RuleErrorText['FormContentVerticalSpaceIsInvalid'];
    case RuleKeys.FormContentHorizontalSpaceIsInvalid:
      return RuleErrorText['FormContentHorizontalSpaceIsInvalid'];
    case RuleKeys.FormContentItemIndentIsInvalid:
      return RuleErrorText['FormContentItemIndentIsInvalid'];
    case RuleKeys.FormHeaderTextSizeIsInvalid:
      return RuleErrorText['FormHeaderTextSizeIsInvalid'];
    case RuleKeys.FormHeaderVerticalSpaceIsInvalid:
      return RuleErrorText['FormHeaderVerticalSpaceIsInvalid'];
    case RuleKeys.FormHeaderHorizontalSpaceIsInvalid:
      return RuleErrorText['FormHeaderHorizontalSpaceIsInvalid'];
    case RuleKeys.FormFooterVerticalSpaceIsInvalid:
      return RuleErrorText['FormFooterVerticalSpaceIsInvalid'];
    case RuleKeys.FormFooterHorizontalSpaceIsInvalid:
      return RuleErrorText['FormFooterHorizontalSpaceIsInvalid'];
    case RuleKeys.FormFooterTextSizeIsInvalid:
      return RuleErrorText['FormFooterTextSizeIsInvalid'];
    case RuleKeys.TextSeveralH1:
      return RuleErrorText['TextSeveralH1'];
    case RuleKeys.TextInvalidH2Position:
      return RuleErrorText['TextInvalidH2Position'];
    case RuleKeys.TextInvalidH3Position:
      return RuleErrorText['TextInvalidH3Position'];
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

        const validateObject = (
          obj: jsonToAst.AstObject
        ): ILinterProblem<RuleKeys>[] => {
          if (isBlock(obj, "form")) {
            const formContent = obj.children.find((p) => p.key.value === "content");
            if (typeof formContent !== "undefined") {
              let { errors, referenceSize } = checkFormContentSize(
                obj,
                formContent.value,
                undefined
              );
              if (typeof referenceSize === "undefined") {
                errors = [{ key: RuleKeys.FormElementsSizeShouldBeEqual, loc: obj.loc}];
              } else {
                errors = [
                  ...errors,
                  ...checkContentElementRules(formContent.value, referenceSize),
                  ...checkContentItemElementRules(formContent.value, referenceSize),
                  ...checkHeaderRules(formContent.value, referenceSize),
                  ...checkFooterRules(formContent.value, referenceSize),
                ];
              }

              return [...errors];
            }
            return [];
          }

          return [];
        };

    const diagnostics: Diagnostic[] = makeLint(
      json,
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
