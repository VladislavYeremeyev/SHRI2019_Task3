import * as jsonToAst from "json-to-ast";
import {
  ILinterProblem,
  RuleKeys,
  spaceValues,
  textSizeValues,
} from "./configuration";
import { getInnerEntities, getMixedObject, getModsError } from "./utils";

function checkHeaderTextRule(
  header: jsonToAst.AstObject,
  referenceSize: string
) {
  const errors: ILinterProblem<RuleKeys>[] = [];

  const content = header.children.find((p) => p.key.value === "content");
  if (typeof content !== "undefined") {
    getInnerEntities(content.value, "text").forEach((textBlock) => {
      const { modErrorObject } = getModsError(
        textBlock,
        "size",
        referenceSize,
        textSizeValues,
        2
      );
      if (typeof modErrorObject !== "undefined") {
        errors.push({
          key: RuleKeys["FormHeaderTextSizeIsInvalid"],
          loc: textBlock.loc,
        });
      }
    });
  }

  return errors;
}

function checkHeaderSpaceRules(
  header: jsonToAst.AstObject,
  referenceSize: string
) {
  const errors: ILinterProblem<RuleKeys>[] = [];

  ["space-v", "space-h"].forEach((mod) => {
    const mixObj = getMixedObject(header, "form", "item", [mod]);
    if (typeof mixObj !== "undefined") {
      if (
        typeof getModsError(
          mixObj,
          mod,
          referenceSize,
          spaceValues,
          mod === "space-v" ? 0 : 1
        ).modErrorObject !== "undefined"
      ) {
        errors.push(
          mod === "space-v"
            ? {
                key: RuleKeys["FormHeaderVerticalSpaceIsInvalid"],
                loc: header.loc,
              }
            : {
                key: RuleKeys["FormHeaderHorizontalSpaceIsInvalid"],
                loc: header.loc,
              }
        );
      }
    } else {
      errors.push(
        mod === "space-v"
          ? {
              key: RuleKeys["FormHeaderVerticalSpaceIsInvalid"],
              loc: header.loc,
            }
          : {
              key: RuleKeys["FormHeaderHorizontalSpaceIsInvalid"],
              loc: header.loc,
            }
      );
    }
  });

  return errors;
}

export function checkHeaderRules(
  formContent: jsonToAst.AstJsonEntity,
  referenceSize: string
) {
  let errors: ILinterProblem<RuleKeys>[] = [];

  const headerElements = getInnerEntities(formContent, "form", "header");
  if (typeof headerElements !== "undefined") {
    headerElements.forEach((elem) => {
      errors = [
        ...errors,
        ...checkHeaderTextRule(elem, referenceSize),
        ...checkHeaderSpaceRules(elem, referenceSize),
      ];
    });
  }

  return errors;
}
