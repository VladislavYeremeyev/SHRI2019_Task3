import * as jsonToAst from "json-to-ast";

import { ILinterProblem, RuleKeys, spaceValues } from "./configuration";
import { getInnerEntities, getMixedObject, getModsError } from "./utils";

export function checkContentItemElementRules(
  formContent: jsonToAst.AstJsonEntity,
  referenceSize: string
) {
  const errors: ILinterProblem<RuleKeys>[] = [];

  const contentItems = getInnerEntities(formContent, "form", "content");
  if (typeof contentItems !== "undefined") {
    contentItems.forEach((elem) => {
      const innerContent = elem.children.find((p) => p.key.value === "content");
      if (typeof innerContent !== "undefined") {
        const contentItemElements = getInnerEntities(
          innerContent.value,
          "form",
          "content-item",
          1
        );
        if (typeof contentItemElements !== "undefined") {
          contentItemElements.forEach((contentItemElem, i) => {
            const mixObj = getMixedObject(contentItemElem, "form", "item", [
              "indent-b",
            ]);
            if (typeof mixObj !== "undefined") {
              if (i !== contentItemElements.length - 1) {
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
                    loc: contentItemElem.loc,
                  });
                }
              } else {
                errors.push({
                  key: RuleKeys["FormContentItemIndentIsInvalid"],
                  loc: contentItemElem.loc,
                });
              }
            } else {
              if (i !== contentItemElements.length - 1) {
                errors.push({
                  key: RuleKeys["FormContentItemIndentIsInvalid"],
                  loc: contentItemElem.loc,
                });
              }
            }
          });
        }
      }
    });
  }

  return errors;
}
