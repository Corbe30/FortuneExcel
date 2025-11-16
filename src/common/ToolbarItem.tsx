import React from "react";
import ExportIcon from "../icons/ExportIcon";
import ImportIcon from "../icons/ImportIcon";

export const exportToolBarItem = (sheetRef:any) => {
  return {
    key: "export",
    tooltip: "Export ...",
    icon: ExportIcon(),
    onClick: async (e:any) => {
      const exportHelper = document.querySelector(".export-helper") as HTMLElement;
      const visibility = exportHelper?.style.visibility;
      exportHelper.style.visibility = visibility === "visible" ? "hidden" : "visible";
    },
  };
};

export const importToolBarItem = () => {
  return {
    key: "import",
    tooltip: "Import file",
    icon: ImportIcon(),
    onClick: (e:any) => {
      document.getElementById("ImportHelper")?.click();
    },
  };
};