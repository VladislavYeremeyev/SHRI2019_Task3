import jsonToAst = require("json-to-ast");

export enum RuleKeys {
  FormElementsSizeShouldBeEqual = "FORM_INPUT_AND_LABEL_SIZES_SHOULD_BE_EQUAL",
  FormContentVerticalSpaceIsInvalid = "FORM_CONTENT_VERTICAL_SPACE_IS_INVALID",
  FormContentHorizontalSpaceIsInvalid = "FORM_CONTENT_HORIZONTAL_SPACE_IS_INVALID",
  FormContentItemIndentIsInvalid = "FORM_CONTENT_ITEM_INDENT_IS_INVALID",
  FormHeaderTextSizeIsInvalid = "FORM_HEADER_TEXT_SIZE_IS_INVALID",
  FormHeaderVerticalSpaceIsInvalid = "FORM_HEADER_VERTICAL_SPACE_IS_INVALID",
  FormHeaderHorizontalSpaceIsInvalid = "FORM_HEADER_HORIZONTAL_SPACE_IS_INVALID",
  FormFooterVerticalSpaceIsInvalid = "FORM_FOOTER_VERTICAL_SPACE_IS_INVALID",
  FormFooterHorizontalSpaceIsInvalid = "FORM_FOOTER_HORIZONTAL_SPACE_IS_INVALID",
  FormFooterTextSizeIsInvalid = "FORM_FOOTER_TEXT_SIZE_IS_INVALID",
  TextSeveralH1 = "TEXT_SEVERAL_H1",
  TextInvalidH2Position = "TEXT_INVALID_H2_POSITION",
  TextInvalidH3Position = "TEXT_INVALID_H3_POSITION",
}

export enum RuleErrorText {
  FormElementsSizeShouldBeEqual = "Инпуты, кнопки и подписи в форме должны быть одного размера",
  FormContentVerticalSpaceIsInvalid = "Вертикальный внутренний отступ элемента content должен задаваться с помощью микса на него элемента item со значением модификатора space-v на 2 шага больше эталонного размера",
  FormContentHorizontalSpaceIsInvalid = "Горизонтальный внутренний отступ элемента content должен задаваться с помощью микса на него элемента item со значением модификатора space-h на 1 шаг больше эталонного размера",
  FormContentItemIndentIsInvalid = "Строки формы должны отбиваться между собой с помощью модификатора нижнего отступа indent-b элемента item на 1 шаг больше эталонного размера",
  FormHeaderTextSizeIsInvalid = "Все текстовые блоки в заголовке формы должны быть со значением модификатора size на 2 шага больше эталонного размера",
  FormHeaderVerticalSpaceIsInvalid = "Вертикальный внутренний отступ заголовка формы должен быть равным эталонному размеру",
  FormHeaderHorizontalSpaceIsInvalid = "Горизонтальный внутренний отступ заголовка формы должен быть на 1 шаг больше эталонного размера",
  FormFooterVerticalSpaceIsInvalid = "Вертикальный внутренний отступ подвала формы должен быть равным эталонному размеру",
  FormFooterHorizontalSpaceIsInvalid = "Горизонтальный внутренний отступ подвала формы должен быть на 1 шаг больше эталонного размера",
  FormFooterTextSizeIsInvalid = "Размер текстовых блоков в подвале должен соответствовать эталонному",
  TextSeveralH1 = "Заголовок первого уровня должен быть один на странице",
  TextInvalidH2Position = "Заголовок второго уровня не может следовать перед заголовком первого уровня на одном или более глубоком уровне вложенности",
  TextInvalidH3Position = "Заголовок третьего уровня не может следовать перед заголовком второго уровня на одном или более глубоком уровне вложенности",
}

export interface ILinterProblem<TKey> {
  key: TKey;
  loc: jsonToAst.AstLocation;
}

export interface IResult {
  errors: ILinterProblem<RuleKeys>[];
  newReferenceSize: string | undefined;
}

export interface ITextHeadersResult {
  headerErrors: ILinterProblem<RuleKeys>[];
  maxLevelValue: number;
  previousElement: JsonToAst.AstObject | undefined;
  h1Flag: boolean;
}

export enum Severity {
  Error = "Error",
  Warning = "Warning",
  Information = "Information",
  Hint = "Hint",
  None = "None",
}

export interface ISeverityConfiguration {
  [RuleKeys.FormElementsSizeShouldBeEqual]: Severity;
  [RuleKeys.FormContentVerticalSpaceIsInvalid]: Severity;
  [RuleKeys.FormContentHorizontalSpaceIsInvalid]: Severity;
  [RuleKeys.FormContentItemIndentIsInvalid]: Severity;
  [RuleKeys.FormHeaderTextSizeIsInvalid]: Severity;
  [RuleKeys.FormHeaderVerticalSpaceIsInvalid]: Severity;
  [RuleKeys.FormHeaderHorizontalSpaceIsInvalid]: Severity;
  [RuleKeys.FormFooterVerticalSpaceIsInvalid]: Severity;
  [RuleKeys.FormFooterHorizontalSpaceIsInvalid]: Severity;
  [RuleKeys.FormFooterTextSizeIsInvalid]: Severity;
  [RuleKeys.TextSeveralH1]: Severity;
  [RuleKeys.TextInvalidH2Position]: Severity;
  [RuleKeys.TextInvalidH3Position]: Severity;
}

export interface IExampleConfiguration {
  enable: boolean;

  severity: ISeverityConfiguration;
}

export const textSizeValues = ["s", "m", "l", "xl", "xxl"];
export const spaceValues = [
  "xxxs",
  "xxs",
  "s",
  "m",
  "l",
  "xl",
  "xxl",
  "xxxl",
  "xxxxl",
];
