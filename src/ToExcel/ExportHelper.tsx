import React from "react";
import { transformFortuneToExcel } from "../common/Transform";
import { IFileType } from "../common/ICommon";

const exportHelperStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  visibility: "hidden",
  backgroundColor: "#fff",
  color: "#000",
  textAlign: "start",
  borderRadius: "4px",
  fontSize: "12px",
  position: "absolute",
  zIndex: 26,
  top: "40px",
  whiteSpace: "nowrap",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.35)",
  left: "50px",
};

const unstyledButtonStyle: React.CSSProperties = {
  width: "100%",
  background: "none",
  border: "none",
  margin: 0,
  font: "inherit",
  color: "inherit",
  cursor: "pointer",
  padding: "6px 12px",
  outline: "none",
  fontFamily: "Arial, Helvetica, sans-serif",
  textAlign: "left",
};

const getExportButton = (
  fileType: IFileType,
  onClick: (fileType: IFileType) => void
) => {
  return (
    <button
      style={unstyledButtonStyle}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ededed")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
      onClick={() => onClick(fileType)}
    >
      Export as .{fileType.toLowerCase()}
    </button>
  );
};



interface ExportHelperProps {
  sheetRef: React.RefObject<any>;
  config: { xlsx?: boolean; csv?: boolean };
}

export const ExportHelper: React.FC<ExportHelperProps> = (props) => {
  const { sheetRef, config } = props;
  const onMouseLeave = () => {
    const exportHelper = document.querySelector(".export-helper") as HTMLElement;
    if (exportHelper) exportHelper.style.visibility = "hidden";
  };
  const onClick = (fileType: IFileType) => {
    transformFortuneToExcel(sheetRef, fileType, true);
    onMouseLeave();
  };

  return (
    <div className="export-helper" style={exportHelperStyle} onMouseLeave={onMouseLeave}>
      {config.xlsx ? getExportButton(IFileType.XLSX, onClick) : null}
      {config.csv ? getExportButton(IFileType.CSV, onClick) : null}
    </div>
  );
};
