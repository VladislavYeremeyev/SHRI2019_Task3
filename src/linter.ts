import * as jsonToAst from "json-to-ast";
import { ILinterProblem, RuleKeys } from "./configuration";
import { checkTextHeaderRules } from "./customLinter/textHeadersCheck";

function parseJson(json: string): jsonToAst.AstJsonEntity | undefined {
  try {
    return jsonToAst(json);
  } catch (err) {
    return undefined;
  }
}

function walk(
  node: jsonToAst.AstJsonEntity,
  cbObj: (property: jsonToAst.AstObject) => void
) {
  switch (node.type) {
    case "Object":
      cbObj(node);

      node.children.forEach((property: jsonToAst.AstProperty) => {
        walk(property.value, cbObj);
      });
      break;
    case "Array":
      node.children.forEach((item: jsonToAst.AstJsonEntity) =>
        walk(item, cbObj)
      );
      break;
  }
}

export function makeLint(
  jsonString: string,
  validateObjectFunction: (
    property: jsonToAst.AstObject
  ) => ILinterProblem<RuleKeys>[]
): ILinterProblem<RuleKeys>[] {
  let errors: ILinterProblem<RuleKeys>[] = [];
  const ast: jsonToAst.AstJsonEntity | undefined = parseJson(jsonString);

  const cbObj = (obj: jsonToAst.AstObject) => {
    errors = [...errors, ...validateObjectFunction(obj)];
  };

  if (ast) {
    errors = [
      ...errors,
      ...checkTextHeaderRules(ast, undefined, false, 1).headerErrors,
    ];
    walk(ast, cbObj);
  } else {
    console.warn("Invalid JSON");
  }

  return errors;
}
