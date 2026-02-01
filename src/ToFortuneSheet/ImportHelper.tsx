import React from "react";
import { transformExcelToFortune } from "../common/Transform";

export const ImportHelper = (props: any) => {
  const { setSheets, setKey, sheetRef, config } = props;
  const acceptTypes = `${config.xlsx ? ".xlsx," : ""}${config.csv ? ".csv" : ""}`;
  return (
    <input
      type="file"
      id="ImportHelper"
      accept={acceptTypes}
      onChange={async (e) => {
        await transformExcelToFortune(e?.target?.files?.[0], setSheets, setKey, sheetRef.current);
      }}
      hidden
    />
  );
};
