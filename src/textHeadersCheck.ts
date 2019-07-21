import jsonToAst = require("json-to-ast");
import { ITextHeadersResult, RuleKeys } from "./configuration";
import { getModValue, isBlock } from "./utils";

export function checkTextHeaderRules(
  content: jsonToAst.AstJsonEntity,
  prevElement: jsonToAst.AstObject | undefined,
  isH1Found: boolean,
  maxAvailableHeaderLevel: number
): ITextHeadersResult {
  const result: ITextHeadersResult = {
    h1Flag: isH1Found,
    headerErrors: [],
    maxLevelValue: maxAvailableHeaderLevel,
    previousElement: prevElement,
  };

  switch (content.type) {
    case "Array":
      content.children.forEach((elem: jsonToAst.AstJsonEntity) => {
        if (elem.type === "Object") {
          if (isBlock(elem, "text")) {
            const mods = elem.children.find((p) => p.key.value === "mods");
            if (typeof mods !== "undefined") {
              const modValue = getModValue(mods.value, "type");
              switch (modValue) {
                case "h1":
                  if (result.maxLevelValue > 1) {
                    if (typeof result.previousElement !== "undefined") {
                      result.headerErrors.push({
                        key:
                          RuleKeys[
                            `TextInvalidH${result.maxLevelValue}Position` as keyof typeof RuleKeys
                          ],
                        loc: result.previousElement.loc,
                      });
                    }
                  }
                  if (result.h1Flag) {
                    result.headerErrors.push({
                      key: RuleKeys["TextSeveralH1"],
                      loc: elem.loc,
                    });
                  } else {
                    result.h1Flag = true;
                  }
                  result.previousElement = elem;
                  break;
                case "h2":
                  if (result.maxLevelValue > 2) {
                    if (typeof result.previousElement !== "undefined") {
                      result.headerErrors.push({
                        key:
                          RuleKeys[
                            `TextInvalidH${result.maxLevelValue}Position` as keyof typeof RuleKeys
                          ],
                        loc: result.previousElement.loc,
                      });
                    }
                  }
                  result.maxLevelValue = 2;
                  result.previousElement = elem;
                  break;
                case "h3":
                  result.maxLevelValue = 3;
                  result.previousElement = elem;
                  break;
                default:
                  break;
              }
            }
          }

          const innerContent = elem.children.find(
            (p) => p.key.value === "content"
          );
          if (typeof innerContent !== "undefined") {
            const data = checkTextHeaderRules(
              innerContent.value,
              elem,
              result.h1Flag,
              result.maxLevelValue
            );

            result.headerErrors = [
              ...result.headerErrors,
              ...data.headerErrors,
            ];

            result.maxLevelValue = data.maxLevelValue;
            result.previousElement = data.previousElement;
            result.h1Flag = data.h1Flag;
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
              if (result.maxLevelValue > 1) {
                if (typeof result.previousElement !== "undefined") {
                  result.headerErrors.push({
                    key:
                      RuleKeys[
                        `TextInvalidH${result.maxLevelValue}Position` as keyof typeof RuleKeys
                      ],
                    loc: result.previousElement.loc,
                  });
                }
              }
              if (result.h1Flag) {
                result.headerErrors.push({
                  key: RuleKeys["TextSeveralH1"],
                  loc: content.loc,
                });
              } else {
                result.h1Flag = true;
              }
              break;
            case "h2":
              if (result.maxLevelValue > 2) {
                if (typeof result.previousElement !== "undefined") {
                  result.headerErrors.push({
                    key:
                      RuleKeys[
                        `TextInvalidH${result.maxLevelValue}Position` as keyof typeof RuleKeys
                      ],
                    loc: result.previousElement.loc,
                  });
                }
              }
              result.maxLevelValue = 2;
              result.previousElement = content;
              break;
            case "h3":
              result.maxLevelValue = 3;
              result.previousElement = content;
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
        const data = checkTextHeaderRules(
          innerContent.value,
          content,
          result.h1Flag,
          result.maxLevelValue
        );

        result.headerErrors = [...result.headerErrors, ...data.headerErrors];

        result.maxLevelValue = data.maxLevelValue;
        result.previousElement = data.previousElement;
        result.h1Flag = data.h1Flag;
      }
      break;
    default:
      break;
  }

  return result;
}
