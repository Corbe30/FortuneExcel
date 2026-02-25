
import { FortuneFile } from "../ToFortuneSheet/FortuneFile";
import { HandleZip } from "../ToFortuneSheet/HandleZip";
import { exportSheetExcel } from "../ToExcel/ExcelFile";
import { IFileType } from "./ICommon";
import * as ExcelJS from "exceljs";

const convertCsvToExcel = async (file: File): Promise<ArrayBuffer> => {
    const csvText = await file.text();
    const rows = csvText.split("\n").map((row) => row.split(","));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    rows.forEach((row) => {
        worksheet.addRow(row);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as ArrayBuffer;
}

export const transformExcelToFortune = async (
    file: any,
    setSheets: any,
    setKey: any,
    sheetRef: any
) => {
    let excelFile: ArrayBuffer;
    let fileName: string = file.name;

    // check if the file is CSV
    if (file.type === 'text/csv' || file?.name?.toLowerCase()?.endsWith('.csv')) {
        // convert CSV to xlsx
        excelFile = await convertCsvToExcel(file);
        fileName = file.name.replace(/\.csv$/i, '.xlsx');
    } else {
        // process as excel file
        excelFile = await file.arrayBuffer();
    }

    const files = await new HandleZip(new File([excelFile], fileName)).unzipFile();
    const fortuneFile = new FortuneFile(files, fileName);
    fortuneFile.Parse();

    const lsh = fortuneFile.serialize();    

    setSheets(lsh.sheets);
    setKey((k: number) => k + 1);

    setTimeout(() => {
        for (let sheet of lsh.sheets) {
            let config = sheet.config;
            sheetRef?.current?.setColumnWidth?.(config?.columnlen || {}, { id: sheet.id });
            sheetRef?.current?.setRowHeight?.(config?.rowlen || {}, { id: sheet.id });
        }
    }, 1);
};

export const transformFortuneToExcel = async (
    luckysheetRef: any,
    fileType: IFileType = IFileType.XLSX,
    download: boolean = true
) => {
    const result = await exportSheetExcel(luckysheetRef, fileType, download);
    return result;
};
