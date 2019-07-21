export enum RuleKeys {
  UppercaseNamesIsForbidden = "uppercaseNamesIsForbidden",
  BlockNameIsRequired = "blockNameIsRequired",
}

export enum Severity {
  Error = "Error",
  Warning = "Warning",
  Information = "Information",
  Hint = "Hint",
  None = "None",
}

export interface ISeverityConfiguration {
  [RuleKeys.BlockNameIsRequired]: Severity;
  [RuleKeys.UppercaseNamesIsForbidden]: Severity;
}

export interface IExampleConfiguration {
  enable: boolean;

  severity: ISeverityConfiguration;
}
