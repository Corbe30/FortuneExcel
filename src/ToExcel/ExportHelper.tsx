import React from "react";
import "./style.css";
import { transformFortuneToExcel } from "../common/Transform";
import { IFileType } from "../common/ICommon";

const getExportButton = (
  fileType: IFileType,
  onClick: (fileType: IFileType) => void
) => {
  return (
    <button className="unstyled-button" onClick={() => onClick(fileType)}>
      Export as .{fileType.toLowerCase()}
    </button>
  );
};

export const ExportHelper = (props: any) => {
  const { sheetRef, config } = props;
  const onMouseLeave = () => {
    const exportHelper = document.querySelector(
      ".export-helper"
    ) as HTMLElement;
    exportHelper.style.visibility = "hidden";
  };
  const onClick = (fileType: IFileType) => {
    transformFortuneToExcel(sheetRef.current, fileType);
    onMouseLeave();
  };

  return (
    <div className="export-helper" onMouseLeave={onMouseLeave}>
      {config.xlsx ? getExportButton(IFileType.XLSX, onClick) : null}
      {config.csv ? getExportButton(IFileType.CSV, onClick) : null}
    </div>
  );
};
