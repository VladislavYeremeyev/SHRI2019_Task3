import * as jsonToAst from "json-to-ast";
import { ILinterProblem, RuleKeys, spaceValues } from "./configuration";
import { getInnerEntities, getMixedObject, getModsError } from "./utils";

export function checkContentElementRules(
  formContent: jsonToAst.AstJsonEntity,
  referenceSize: string
) {
  const errors: ILinterProblem<RuleKeys>[] = [];

  const contentElements = getInnerEntities(formContent, "form", "content");
  if (typeof contentElements !== "undefined") {
    contentElements.forEach((elem) => {
      ["space-v", "space-h"].forEach((mod) => {
        const mixObj = getMixedObject(elem, "form", "item", [mod]);
        if (typeof mixObj !== "undefined") {
          if (
            typeof getModsError(
              mixObj,
              mod,
              referenceSize,
              spaceValues,
              mod === "space-v" ? 2 : 1
            ).modErrorObject !== "undefined"
          ) {
            errors.push(
              mod === "space-v"
                ? {
                    key: RuleKeys["FormContentVerticalSpaceIsInvalid"],
                    loc: elem.loc,
                  }
                : {
                    key: RuleKeys["FormContentHorizontalSpaceIsInvalid"],
                    loc: elem.loc,
                  }
            );
          }
        } else {
          errors.push(
            mod === "space-v"
              ? {
                  key: RuleKeys["FormContentVerticalSpaceIsInvalid"],
                  loc: elem.loc,
                }
              : {
                  key: RuleKeys["FormContentHorizontalSpaceIsInvalid"],
                  loc: elem.loc,
                }
          );
        }
      });
    });
  }

  return errors;
}
