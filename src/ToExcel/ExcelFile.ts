import ExcelJS from "exceljs";
import * as fileSaver from "file-saver";
import { setStyleAndValue } from "./ExcelStyle.js";
import { setMerge } from "../common/method.js";
import { setImages } from "./ExcelImage.js";
import { setBorder } from "./ExcelBorder.js";
import { setDataValidations } from "./ExcelValidation.js";
import { setHiddenRowCol } from "./ExcelConfig.js";


export async function exportSheetExcel(
  luckysheetRef: any
) {
  const luckysheet = luckysheetRef.getAllSheets();
  // 参数为luckysheet.getluckysheetfile()获取的对象
  // 1.创建工作簿，可以为工作簿添加属性
  const workbook = new ExcelJS.Workbook();
  // 2.创建表格，第二个参数可以配置创建什么样的工作表
  luckysheet.every(function (table: any) {
    if (table?.data?.length === 0) return true;
    const worksheet = workbook.addWorksheet(table.name);
    // 3.设置单元格合并,设置单元格边框,设置单元格样式,设置值
    setStyleAndValue(luckysheetRef, table, worksheet);
    setMerge(table?.config?.merge, worksheet);
    setBorder(table, worksheet);
    setImages(table, worksheet, workbook);
    setDataValidations(table, worksheet);
    setHiddenRowCol(table, worksheet);
    return true;
  });
  // 4.写入 buffer
  const buffer = await workbook.xlsx.writeBuffer();
  const fileData = new Blob([buffer]);
  // 5.保存为文件
  fileSaver.saveAs(fileData, `${luckysheetRef.getSheet().name}.xlsx`);
}
