import { IfortunesheetDataVerificationType } from "../ToFortuneSheet/IFortune";

export interface IuploadfileList {
  [index: string]: string;
}

export interface stringToNum {
  [index: string]: number;
}

export interface numTostring {
  [index: number]: string;
}

export interface IattributeList {
  [index: string]: string;
}

export interface IDataVerificationMap {
  [key: string]: IfortunesheetDataVerificationType;
}

export interface IDataVerificationType2Map {
  [key: string]: { [key: string]: string };
}

export interface IBorderSide {
  color: string;
  style: number;
}

export interface IBorderInfo {
  b: IBorderSide;
  l: IBorderSide;
  r: IBorderSide;
  t: IBorderSide;
}

export interface IBorderInfoCompute {
  [key: string]: IBorderInfo;
}

export enum IFileType {
  CSV = "csv",
  XLSX = "xlsx",
}