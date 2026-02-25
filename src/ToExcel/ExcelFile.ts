import ExcelJS from "exceljs";
import * as fileSaver from "file-saver";
import { setStyleAndValue } from "./ExcelStyle";
import { setMerge } from "../common/method";
import { setImages } from "./ExcelImage";
import { setBorder } from "./ExcelBorder";
import { setDataValidations } from "./ExcelValidation";
import { setHiddenRowCol } from "./ExcelConfig";
import { IFileType } from "../common/ICommon";


export async function exportSheetExcel(
  luckysheetRef: any,
  fileType: IFileType,
  download: boolean = true
) {
  const luckysheet = luckysheetRef.current.getAllSheets();
  const workbook = new ExcelJS.Workbook();
  luckysheet.every(function (table: any) {
    if (table?.data?.length === 0) return true;
    const worksheet = workbook.addWorksheet(table.name);
    setStyleAndValue(table, worksheet);
    setMerge(table?.config?.merge, worksheet);
    setBorder(table, worksheet);
    setImages(table, worksheet, workbook);
    setDataValidations(table, worksheet);
    setHiddenRowCol(table, worksheet);
    return true;
  });

  let fileData;
  if (fileType === IFileType.CSV) {
    const buffer = await workbook.csv.writeBuffer();
    fileData = new Blob([buffer]);
  } else {
    const buffer = await workbook.xlsx.writeBuffer();
    fileData = new Blob([buffer]);
  }
  if (download)
    fileSaver.saveAs(fileData, `${luckysheetRef.current.getSheet().name}.${fileType}`);
  return fileData;
}
