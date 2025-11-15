import React from "react";
import {ImportHelper} from "../ToFortuneSheet/ImportHelper";
import {ExportHelper} from "../ToExcel/ExportHelper";

const formatConfig = (config = {}) => {
    const defaultConfig = {
        import: { xlsx: true, csv: true },
        export: { xlsx: true, csv: true },
    };
    return { ...defaultConfig, ...config };
}

export const FortuneExcelHelper = (props: any) => {
    const { setKey, setSheets, sheetRef, config } = props;
    const sanitizedConfig = formatConfig(config); 
    return (
        <>
            <ImportHelper setKey={setKey} setSheets={setSheets} sheetRef={sheetRef} config={sanitizedConfig.import} />
            <ExportHelper sheetRef={sheetRef} config={sanitizedConfig.export} />
        </>
    )
}