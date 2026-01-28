import {
  IFortuneFile,
  IFortuneFileInfo,
  IfortuneSheet,
  IfortuneSheetCelldata,
  IfortuneSheetConfig,
  IfortuneSheetCelldataValue,
  IfortuneSheetCelldataValueMerge,
  IFortuneSheetCellFormat,
  IfortuneSheetConfigMerges,
  IfortuneSheetConfigMerge,
  IMapfortuneSheetborderInfoCellForImp,
  IfortuneSheetborderInfoCellValue,
  IfortuneSheetborderInfoCellValueStyle,
  IfortuneSheetborderInfoCellForImp,
  IfortuneSheetRowAndColumnLen,
  IfortuneSheetRowAndColumnHidden,
  IfortuneSheetSelection,
  IfortunesheetFrozen,
  IfortuneSheetChart,
  IfortuneSheetPivotTable,
  IfortunesheetConditionFormat,
  IfortunesheetCalcChain,
  IFortuneInlineString,
  IfortuneImage,
  IfortuneImageBorder,
  IfortuneImageCrop,
  IfortuneImageDefault,
  IfortuneImages,
  IfortunesheetHyperlink,
  IfortunesheetDataVerification,
} from "./IFortune";

export class FortuneFileBase implements IFortuneFile {
  info: IFortuneFileInfo;
  sheets: IfortuneSheet[];
}

export class FortuneSheetBase implements IfortuneSheet {
  name: string;
  color: string;
  config: IfortuneSheetConfig;
  id: string;
  status: string;
  order: string;
  row: number;
  column: number;
  luckysheet_select_save: IfortuneSheetSelection[];
  scrollLeft: number;
  scrollTop: number;
  zoomRatio: number;
  showGridLines: string;
  defaultColWidth: number;
  defaultRowHeight: number;

  celldata: IfortuneSheetCelldata[];
  chart: IfortuneSheetChart[];

  isPivotTable: boolean;
  pivotTable: IfortuneSheetPivotTable;

  luckysheet_conditionformat_save: IfortunesheetConditionFormat[];
  freezen: IfortunesheetFrozen;

  calcChain: IfortunesheetCalcChain[];

  images: IfortuneImages;

  dataVerification: IfortunesheetDataVerification;
  hyperlink: IfortunesheetHyperlink;
  hide: number;
}

export class FortuneFileInfo implements IFortuneFileInfo {
  name: string;
  creator: string;
  lastmodifiedby: string;
  createdTime: string;
  modifiedTime: string;
  company: string;
  appversion: string;
}

export class FortuneSheetCelldataBase implements IfortuneSheetCelldata {
  r: number;
  c: number;
  v: IfortuneSheetCelldataValue | string | null;
}

export class FortuneSheetCelldataValue implements IfortuneSheetCelldataValue {
  ct: FortuneSheetCellFormat | undefined; //celltype,Cell value format: text, time, etc. numfmts
  bg: string | undefined; //background,#fff000,	fill
  ff: string | undefined; //fontfamily, fonts
  fc: string | undefined; //fontcolor fonts
  bl: number | undefined; //Bold, fonts
  it: number | undefined; //italic, fonts
  fs: number | undefined; //font size, fonts
  cl: number | undefined; //strike, 0 Regular, 1 strikes, fonts
  un: number | undefined; //underline, 0 Regular, 1 underlines, fonts
  vt: number | undefined; //Vertical alignment, 0 middle, 1 up, 2 down, alignment
  ht: number | undefined; //Horizontal alignment,0 center, 1 left, 2 right, alignment
  mc: IfortuneSheetCelldataValueMerge | undefined; //Merge Cells, mergeCells
  tr: number | undefined; //Text rotation,0: 0、3 Vertical text alignment
  tb: string | undefined; //Text wrap,0 truncation, 1 overflow, 2 word wrap, alignment
  v: string | undefined; //Original value, v
  m: string | undefined; //Display value, v
  f: string | undefined; //formula, f
  rt: number | undefined; //text rotation angle 0-180 alignment
  qp: number | undefined; //quotePrefix, show number as string
}

export class FortuneSheetCellFormat implements IFortuneSheetCellFormat {
  fa: string;
  t: string;
  s: FortuneInlineString[] | undefined;
}

export class FortuneInlineString implements IFortuneInlineString {
  ff: string | undefined; //font family
  fc: string | undefined; //font color
  fs: number | undefined; //font size
  cl: number | undefined; //strike
  un: number | undefined; //underline
  bl: number | undefined; //blod
  it: number | undefined; //italic
  va: number | undefined; //1sub and 2super and 0none
  v: string | undefined;
}

export class FortuneConfig implements IfortuneSheetConfig {
  merge: IfortuneSheetConfigMerges;
  borderInfo: IfortuneSheetborderInfoCellForImp[];
  // _borderInfo: IMapfortuneSheetborderInfoCellForImp
  rowlen: IfortuneSheetRowAndColumnLen;
  columnlen: IfortuneSheetRowAndColumnLen;
  rowhidden: IfortuneSheetRowAndColumnHidden;
  colhidden: IfortuneSheetRowAndColumnHidden;

  customHeight: IfortuneSheetRowAndColumnHidden;
  customWidth: IfortuneSheetRowAndColumnHidden;
}

export class FortuneSheetborderInfoCellForImp
  implements IfortuneSheetborderInfoCellForImp
{
  rangeType: string;
  // cells:string[]
  value: IfortuneSheetborderInfoCellValue;
}

export class FortuneSheetborderInfoCellValue
  implements IfortuneSheetborderInfoCellValue
{
  row_index: number;
  col_index: number;
  l: IfortuneSheetborderInfoCellValueStyle;
  r: IfortuneSheetborderInfoCellValueStyle;
  t: IfortuneSheetborderInfoCellValueStyle;
  b: IfortuneSheetborderInfoCellValueStyle;
}

export class FortuneSheetborderInfoCellValueStyle
  implements IfortuneSheetborderInfoCellValueStyle
{
  "style": number;
  "color": string;
}

export class FortuneSheetConfigMerge implements IfortuneSheetConfigMerge {
  r: number;
  c: number;
  rs: number;
  cs: number;
}

export class FortunesheetCalcChain implements IfortunesheetCalcChain {
  r: number;
  c: number;
  id: string | undefined;
}

export class FortuneImageBase implements IfortuneImage {
  border: IfortuneImageBorder;
  crop: IfortuneImageCrop;
  default: IfortuneImageDefault;

  fixedLeft: number;
  fixedTop: number;
  isFixedPos: Boolean;
  originHeight: number;
  originWidth: number;
  src: string;
  type: string;
}
