export interface IFortuneFile {
  info: IFortuneFileInfo; //File information, name,password,date,createor etc.
  sheets: IfortuneSheet[]; //Sheets, include all sheet data
}

export interface IFortuneFileInfo {
  name: string; // File name
  creator: string; //Create user
  lastmodifiedby: string; //Edit user
  createdTime: string;
  modifiedTime: string;
  company: string;
  appversion: string; //Excel version, Is it necessary?
}

export interface IfortuneSheet {
  name: string; // Sheet name, it will show on sheet bar, must be unique
  color: string; // Sheet color, it will show on sheet bar
  config?: IfortuneSheetConfig; // Row height, column width, hidden, and so on
  id: string; //A sheet uniquely identifies,
  status: string; //If 1 , it means current shown sheet, else means hidden
  order: string; //Order of sheet
  row: number; // Sheet the number of rows, contain blank cell
  column: number; // Sheet the number of columns, contain blank cell
  // visibledatarow:number[],
  // visibledatacolumn:number[],
  luckysheet_select_save?: IfortuneSheetSelection[]; //selection defines
  scrollLeft: number; //horizen scroll offset
  scrollTop: number; //verticel scroll offset

  celldata?: IfortuneSheetCelldata[]; // cells
  chart?: IfortuneSheetChart[];

  isPivotTable: boolean;
  pivotTable?: IfortuneSheetPivotTable;

  luckysheet_conditionformat_save?: IfortunesheetConditionFormat[];
  freezen?: IfortunesheetFrozen;

  calcChain?: IfortunesheetCalcChain[];

  zoomRatio: number; //sheet zoom ratio 10%-400%

  showGridLines: string; // show grid lines

  defaultColWidth: number; //cloumn width pixel
  defaultRowHeight: number; //row height pixel

  images: IfortuneImages; //image list

  dataVerification: IfortunesheetDataVerification;
  hyperlink: IfortunesheetHyperlink; // hyperlinks
  hide: number; // sheet hide
}

//fortunesheet general selection
export interface IfortuneSheetSelection {
  row: number[]; //selection start row and end row
  column: number[]; //selection start column and end column
  sheetIndex: number;
}

export interface IfortuneSheetChart {}

//pivot table interface
export interface IfortuneSheetPivotTable {
  pivot_select_save: IfortuneSheetSelection; //Pivot table data source range
  pivotDataSheetIndex: string | undefined; //data source sheet index, index is unique id
  column: IfortuneSheetPivotTableField[]; // column area, include filed
  row: IfortuneSheetPivotTableField[]; // row area, include filed
  filter: IfortuneSheetPivotTableField[]; // filter area, include filed
  filterparm: IfortuneSheetPivotTablefilterParam; // save param after apply filter
  values: IfortuneSheetPivotTableField[];
  showType: string;
  pivotDatas: any[][];
  drawPivotTable: boolean;
  pivotTableBoundary: number[];
}

export interface IfortuneSheetPivotTableField {
  index: number;
  name: string;
  fullname: string;
  sumtype: string;
  nameindex: number;
}

export interface IfortuneSheetPivotTablefilterParam {
  [index: string]: IfortuneSheetPivotTablefilterParamItem;
}

export interface IfortuneSheetPivotTablefilterParamItem {
  caljs: IfortuneSheetPivotTablefilterParamItemCaljs;
  rowhidden: IfortuneSheetPivotTablefilterParamItemRowhidden;
  selected: IfortuneSheetPivotTablefilterParamItemSelected;
}

export interface IfortuneSheetPivotTablefilterParamItemCaljs {
  text: string;
  type: string;
  value: string;
  value1: string;
}

export interface IfortuneSheetPivotTablefilterParamItemRowhidden {
  [index: number]: number;
}

export interface IfortuneSheetPivotTablefilterParamItemSelected {
  [index: number]: number;
}

export interface IfortunesheetFrozen {
  horizen: number | undefined; //freeze horizen row number
  vertical: number | undefined; //freeze horizen column number
}

export interface IfortunesheetConditionFormat {
  type: string; //Option:defualt,databar,colorGradation,icons,
  cellrange: IfortuneSheetSelection[]; //Valid range
  format: string[] | IfortunesheetCFDefaultFormat | IfortunesheetCFIconsFormat; //style
  conditionName: string | undefined; //Detailed settings,comparison parameters
  conditionRange: IfortuneSheetSelection[]; //Detailed settings,comparison range
  conditionValue: any[]; //Detailed settings,comparison value
}

export interface IfortunesheetCFDefaultFormat {
  textColor: string | undefined | null;
  cellColor: string | undefined | null;
}

export interface IfortunesheetCFIconsFormat {
  len: string | number;
  leftMin: string | number;
  top: string | number;
}

export interface IfortunesheetCalcChain {
  r: number;
  c: number;
  id: string | undefined;
  // func?:any[],//[true, 152, "=SUBTOTAL(9,OFFSET(F15,ROW(F15:F18)-ROW(F15),1,3))"] 已经计算、终值、公式
}

export interface IfortuneSheetCelldata {
  r: number; //cell row number
  c: number; //cell column number
  v:
    | IfortuneSheetCelldataValue
    | { mc: IfortuneSheetCelldataValueMerge; ct?: IFortuneSheetCellFormat }
    | string
    | null; //cell value
}

export interface IfortuneSheetCelldataValue {
  ct: IFortuneSheetCellFormat | undefined; //celltype,Cell value format: text, time, etc.
  bg: string | undefined; //background,#fff000
  ff: string | undefined; //fontfamily,
  fc: string | undefined; //fontcolor
  bl: number | undefined; //Bold
  it: number | undefined; //italic
  fs: number | undefined; //font size
  cl: number | undefined; //Cancelline, 0 Regular, 1 Cancelline
  un: number | undefined; //underline, 0 Regular, 1 underlines, fonts
  vt: number | undefined; //Vertical alignment, 0 middle, 1 up, 2 down
  ht: number | undefined; //Horizontal alignment,0 center, 1 left, 2 right
  mc: IfortuneSheetCelldataValueMerge | undefined; //Merge Cells
  tr: number | undefined; //Text rotation,0: 0、1: 45 、2: -45、3 Vertical text、4: 90 、5: -90
  tb: number | undefined; //Text wrap,0 truncation, 1 overflow, 2 word wrap
  v: string | undefined; //Original value
  m: string | undefined; //Display value
  rt: number | undefined; //text rotation angle 0-180 alignment
  f: string | undefined; //formula
  qp: number | undefined; //quotePrefix, show number as string
}

export interface IFortuneSheetCellFormat {
  fa: string; //Format definition string
  t: string; // Cell Type
}

export interface IfortuneSheetCelldataValueMerge {
  rs?: number; //row of merge cell  length, only main merge cell, every merge cell has only one main mergeCell
  cs?: number; //column of merge cell  length, only main merge cell, every merge cell has only one main mergeCell
  r: number; // main merge cell row Number, other cell link to main cell
  c: number; // main merge cell column Number, other cell link to main cell
}

//Fortune sheet config attribute
export interface IfortuneSheetConfig {
  merge?: IfortuneSheetConfigMerges; //merge handdler
  // _borderInfo?: IMapfortuneSheetborderInfoCellForImp, //range border
  borderInfo: IfortuneSheetborderInfoCellForImp[]; //range border
  rowlen?: IfortuneSheetRowAndColumnLen; // every row's height
  columnlen?: IfortuneSheetRowAndColumnLen; // every column's width
  rowhidden?: IfortuneSheetRowAndColumnHidden; //setting be hidden rows
  colhidden?: IfortuneSheetRowAndColumnHidden; //setting be hidden columns

  customHeight: IfortuneSheetRowAndColumnHidden; //user operate row height
  customWidth: IfortuneSheetRowAndColumnHidden; //user operate column width
}

//Merge cells interface
export interface IfortuneSheetConfigMerges {
  [firstRange: string]: IfortuneSheetConfigMerge; // "r_s":{ r,c,rs,cs } format, define a main merge cell
}
//Merge cell interface
export interface IfortuneSheetConfigMerge {
  r: number;
  c: number;
  rs: number;
  cs: number;
}

//Border cell interface
export interface IfortuneSheetborderInfoCell {
  rangeType: string;
  value: IfortuneSheetborderInfoCellValue;
}
export interface IfortuneSheetborderInfoCellValue {
  row_index: number;
  col_index: number;
  l: IfortuneSheetborderInfoCellValueStyle;
  r: IfortuneSheetborderInfoCellValueStyle;
  t: IfortuneSheetborderInfoCellValueStyle;
  b: IfortuneSheetborderInfoCellValueStyle;
}
export interface IfortuneSheetborderInfoCellValueStyle {
  style: number;
  color: string;
}

//border range interface
export interface IfortuneSheetborderInfoRange {
  rangeType: string;
  borderType: string;
  style: string;
  color: string;
  range: IfortuneSheetSelection[];
}

//Border cell interface for import
export interface IfortuneSheetborderInfoCellForImp {
  rangeType: string;
  cells?: string[];
  value: IfortuneSheetborderInfoCellValue;
}

//Border cell interface for import
export interface IMapfortuneSheetborderInfoCellForImp {
  [index: number]: IfortuneSheetborderInfoCellForImp;
}

//row length and column length interface
export interface IfortuneSheetRowAndColumnLen {
  [index: string]: number;
}

//row and column hidden interface
export interface IfortuneSheetRowAndColumnHidden {
  [index: string]: number;
}

export interface IFormulaSI {
  [index: string]: IFormulaCell;
}

export interface IFormulaCell {
  [index: string]: IFormulaCellValue;
}

export interface IFormulaCellValue {
  t: string;
  ref: string;
  si: string;
  fv: string;
  cellValue: IfortuneSheetCelldata;
}

export interface IFortuneInlineString {
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

//Image
export interface IfortuneImage {
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

export interface IfortuneImageBorder {
  color: string;
  radius: number;
  style: string;
  width: number;
}

export interface IfortuneImageCrop {
  height: number;
  offsetLeft: number;
  offsetTop: number;
  width: number;
}

export interface IfortuneImageDefault {
  height: number;
  left: number;
  top: number;
  width: number;
}

export interface IfortuneImages {
  [index: string]: IfortuneImage;
}

export interface IcellOtherInfo {
  [index: string]: IformulaList;
}

export interface IformulaList {
  [index: string]: IformulaListItem;
}

export interface IformulaListItem {
  r: number;
  c: number;
}

// DataVerification
export interface IfortunesheetDataVerification {
  [key: string]: IfortunesheetDataVerificationValue;
}

export interface IfortunesheetDataVerificationValue {
  type: IfortunesheetDataVerificationType;
  type2: string | null;
  value1: string | number | null;
  value2: string | number | null;
  checked: boolean;
  remote: boolean;
  prohibitInput: boolean;
  hintShow: boolean;
  hintText: string;
}

export type IfortunesheetDataVerificationType =
  | "dropdown"
  | "checkbox"
  | "number"
  | "number_integer"
  | "number_decimal"
  | "text_content"
  | "text_length"
  | "date"
  | "validity";

export interface IfortunesheetHyperlink {
  [key: string]: IfortunesheetHyperlinkValue;
}

export interface IfortunesheetHyperlinkValue {
  linkAddress: string;
  linkTooltip: string;
  linkType: IfortunesheetHyperlinkType;
  display: string;
}

export type IfortunesheetHyperlinkType = "webpage" | "cellrange" | "sheet";
