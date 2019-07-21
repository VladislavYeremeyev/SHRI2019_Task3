import * as jsonToAst from "json-to-ast";

export const isBlock = (
  elem: jsonToAst.AstObject,
  blockName: string
): boolean =>
  elem.children.some(
    (p) =>
      p.key.value === "block" &&
      (p.value.type === "Literal" && p.value.value === blockName)
  ) && !elem.children.some((p) => p.key.value === "elem")
    ? true
    : false;

export const isElement = (
  elem: jsonToAst.AstObject,
  blockName: string,
  elementName: string
): boolean =>
  elem.children.some(
    (p) =>
      p.key.value === "elem" &&
      (p.value.type === "Literal" && p.value.value === elementName)
  ) &&
  elem.children.some(
    (p) =>
      p.key.value === "block" &&
      (p.value.type === "Literal" && p.value.value === blockName)
  )
    ? true
    : false;

export const getMixedObject = (
  elem: jsonToAst.AstObject,
  blockName: string,
  elementName?: string,
  mods?: string[]
): jsonToAst.AstObject | undefined => {
  let result;
  const mixProperty = elem.children.find((p) => p.key.value === "mix");
  if (
    typeof mixProperty !== "undefined" &&
    mixProperty.value.type === "Array"
  ) {
    mixProperty.value.children.find((mix) => {
      if (mix.type === "Object") {
        if (typeof elementName === "undefined") {
          if (isBlock(mix, blockName)) {
            if (typeof mods === "undefined") {
              result = mix;
            } else {
              const modsObj = mix.children.find((p) => p.key.value === "mods");
              if (typeof modsObj !== "undefined") {
                if (mods.every((mod) => getModValue(modsObj.value, mod))) {
                  result = mix;
                }
              }
            }
          }
        } else {
          if (isElement(mix, blockName, elementName)) {
            if (typeof mods === "undefined") {
              result = mix;
            } else {
              const modsObj = mix.children.find((p) => p.key.value === "mods");
              if (typeof modsObj !== "undefined") {
                if (mods.every((mod) => getModValue(modsObj.value, mod))) {
                  result = mix;
                }
              }
            }
          }
        }
      }
    });
  }

  return result;
};

export const getModValue = (
  modsObj: jsonToAst.AstJsonEntity,
  modName: string
) => {
  let result;

  if (modsObj.type === "Object") {
    const modProperty = modsObj.children.find((p) => p.key.value === modName);
    if (
      typeof modProperty !== "undefined" &&
      modProperty.value.type === "Literal"
    ) {
      result = modProperty.value.value;
    }
  }
  return result;
};

export const getModsError = (
  elem: jsonToAst.AstObject,
  modName: string,
  referenceValue: string | undefined,
  expectedValues: string[],
  referenceValueOffset?: number
) => {
  let modErrorObject: jsonToAst.AstObject | undefined;
  let newReferenceValue = referenceValue;
  let offset = referenceValueOffset;
  if (typeof offset === "undefined") {
    offset = 0;
  }

  const mods = elem.children.find((p) => p.key.value === "mods");
  if (typeof mods !== "undefined") {
    const modValue = getModValue(mods.value, modName);
    if (
      modValue !== "undefined" &&
      typeof modValue === "string" &&
      expectedValues.includes(expectedValues[expectedValues.indexOf(modValue)])
    ) {
      if (typeof referenceValue === "undefined") {
        newReferenceValue = modValue;
      } else if (
        expectedValues[expectedValues.indexOf(referenceValue) + offset] !==
        modValue
      ) {
        modErrorObject = elem;
      }
    } else {
      modErrorObject = elem;
    }
  } else {
    modErrorObject = elem;
  }

  return { newReferenceValue, modErrorObject };
};

export const getInnerEntities = (
  elem: jsonToAst.AstJsonEntity,
  blockName: string,
  elementName?: string
): JsonToAst.AstObject[] => {
  let innerTextBlocks: JsonToAst.AstObject[] = [];

  switch (elem.type) {
    case "Array":
      elem.children.forEach((child: jsonToAst.AstJsonEntity) => {
        if (child.type === "Object") {
          if (
            (typeof elementName === "undefined" && isBlock(child, blockName)) ||
            typeof getMixedObject(child, blockName) !== "undefined" ||
            ((typeof elementName !== "undefined" &&
              isElement(child, blockName, elementName)) ||
              typeof getMixedObject(child, blockName, elementName) !==
                "undefined")
          ) {
            innerTextBlocks = [...innerTextBlocks, child];
          }

          const innerContent = child.children.find(
            (p) => p.key.value === "content"
          );
          if (typeof innerContent !== "undefined") {
            innerTextBlocks = [
              ...innerTextBlocks,
              ...getInnerEntities(innerContent.value, blockName, elementName),
            ];
          }
        }
      });
      break;
    case "Object":
      if (
        (typeof elementName === "undefined" && isBlock(elem, blockName)) ||
        typeof getMixedObject(elem, blockName) !== "undefined" ||
        ((typeof elementName !== "undefined" &&
          isElement(elem, blockName, elementName)) ||
          typeof getMixedObject(elem, blockName, elementName) !== "undefined")
      ) {
        innerTextBlocks = [...innerTextBlocks, elem];
      }

      const innerContent = elem.children.find((p) => p.key.value === "content");
      if (typeof innerContent !== "undefined") {
        innerTextBlocks = [
          ...innerTextBlocks,
          ...getInnerEntities(innerContent.value, blockName, elementName),
        ];
      }
  }

  return innerTextBlocks;
};
