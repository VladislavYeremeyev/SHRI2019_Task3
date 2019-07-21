import jsonToAst = require("json-to-ast");
import { ILinterProblem, RuleKeys } from "../configuration";
import { getModValue, isBlock } from "./utils";

export function checkTextHeaderRules(
  content: jsonToAst.AstJsonEntity,
  prevElement: jsonToAst.AstObject | undefined,
  isH1Found: boolean,
  maxAvailableHeaderLevel: number
) {
  let errors: ILinterProblem<RuleKeys>[] = [];
  let h1Found = isH1Found;
  let maxLevel = maxAvailableHeaderLevel;
  let prevElem = prevElement;

  switch (content.type) {
    case "Array":
      const initialMaxValue = maxAvailableHeaderLevel;
      content.children.forEach((elem: jsonToAst.AstJsonEntity) => {
        if (elem.type === "Object") {
          if (isBlock(elem, "text")) {
            const mods = elem.children.find((p) => p.key.value === "mods");
            if (typeof mods !== "undefined") {
              const modValue = getModValue(mods.value, "type");
              switch (modValue) {
                case "h1":
                  if (maxLevel > 1) {
                    if (typeof prevElem !== "undefined") {
                      errors.push({
                        key:
                          RuleKeys[
                            `TextInvalidH${maxLevel}Position` as keyof typeof RuleKeys
                          ],
                        loc: prevElem.loc,
                      });
                    }
                  }
                  if (h1Found) {
                    errors.push({
                      key: RuleKeys["TextSeveralH1"],
                      loc: elem.loc,
                    });
                  } else {
                    h1Found = true;
                  }
                  prevElem = elem;
                  break;
                case "h2":
                  if (maxLevel > 2) {
                    if (typeof prevElem !== "undefined") {
                      errors.push({
                        key:
                          RuleKeys[
                            `TextInvalidH${maxLevel}Position` as keyof typeof RuleKeys
                          ],
                        loc: prevElem.loc,
                      });
                    }
                  }
                  maxLevel = 2;
                  prevElem = elem;
                  break;
                case "h3":
                  maxLevel = 3;
                  prevElem = elem;
                  break;
                default:
                  break;
              }
            }
          } else {
            maxLevel = initialMaxValue;
          }

          const innerContent = elem.children.find(
            (p) => p.key.value === "content"
          );
          if (typeof innerContent !== "undefined") {
            const {
              headerErrors,
              maxLevelValue,
              previousElement,
            } = checkTextHeaderRules(
              innerContent.value,
              elem,
              h1Found,
              maxLevel
            );

            errors = [...errors, ...headerErrors];

            maxLevel = maxLevelValue;
            prevElem = previousElement;
          }
        }
      });
      break;
    case "Object":
      if (isBlock(content, "text")) {
        const mods = content.children.find((p) => p.key.value === "mods");
        if (typeof mods !== "undefined") {
          const modValue = getModValue(mods.value, "type");
          switch (modValue) {
            case "h1":
              if (maxLevel > 1) {
                if (typeof prevElem !== "undefined") {
                  errors.push({
                    key:
                      RuleKeys[
                        `TextInvalidH${maxLevel}Position` as keyof typeof RuleKeys
                      ],
                    loc: prevElem.loc,
                  });
                }
              }
              if (h1Found) {
                errors.push({
                  key: RuleKeys["TextSeveralH1"],
                  loc: content.loc,
                });
              } else {
                h1Found = true;
              }
              break;
            case "h2":
              if (maxLevel > 2) {
                if (typeof prevElem !== "undefined") {
                  errors.push({
                    key:
                      RuleKeys[
                        `TextInvalidH${maxLevel}Position` as keyof typeof RuleKeys
                      ],
                    loc: prevElem.loc,
                  });
                }
              }
              maxLevel = 2;
              prevElem = content;
              break;
            case "h3":
              maxLevel = 3;
              prevElem = content;
              break;
            default:
              break;
          }
        }
      }

      const innerContent = content.children.find(
        (p) => p.key.value === "content"
      );
      if (typeof innerContent !== "undefined") {
        const {
          headerErrors,
          maxLevelValue,
          previousElement,
        } = checkTextHeaderRules(
          innerContent.value,
          prevElem,
          h1Found,
          maxLevel
        );

        errors = [...errors, ...headerErrors];

        maxLevel = maxLevelValue;
        prevElem = previousElement;
      }
      break;
    default:
      break;
  }

  return {
    headerErrors: errors,
    maxLevelValue: maxLevel,
    previousElement: prevElem,
  };
}
