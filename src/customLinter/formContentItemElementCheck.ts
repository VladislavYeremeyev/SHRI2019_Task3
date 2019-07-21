import * as jsonToAst from "json-to-ast";

import { ILinterProblem, RuleKeys, spaceValues } from "../configuration";
import { getInnerEntities, getMixedObject, getModsError } from "./utils";

export function checkContentItemElementRules(
  formContent: jsonToAst.AstJsonEntity,
  referenceSize: string
) {
  const errors: ILinterProblem<RuleKeys>[] = [];

  const contentItems = getInnerEntities(formContent, "form", "content");
  if (typeof contentItems !== "undefined") {
    contentItems.forEach((elem) => {
      const contentItemElements = getInnerEntities(
        elem,
        "form",
        "content-item"
      );
      if (typeof contentItemElements !== "undefined") {
        contentItemElements.forEach((elem, i) => {
          const mixObj = getMixedObject(elem, "form", "item", ["indent-b"]);
          if (typeof mixObj !== "undefined") {
            if (
              typeof getModsError(
                mixObj,
                "indent-b",
                referenceSize,
                spaceValues,
                1
              ).modErrorObject !== "undefined"
            ) {
              errors.push({
                key: RuleKeys["FormContentItemIndentIsInvalid"],
                loc: elem.loc,
              });
            }
          } else {
            if (i !== contentItemElements.length - 1) {
              errors.push({
                key: RuleKeys["FormContentItemIndentIsInvalid"],
                loc: elem.loc,
              });
            }
          }
        });
      }
    });
  }

  return errors;
}
