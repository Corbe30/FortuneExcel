import React from "react";
import { Workbook } from "@fortune-sheet/react";
import "@fortune-sheet/react/dist/index.css";
import {
  exportToolBarItem,
  importToolBarItem,
  FortuneExcelHelper,
  transformFortuneToExcel,
} from "@corbe30/fortune-excel";

export const Page = () => {
  const [key, setKey] = React.useState(0);
  const [sheets, setSheets] = React.useState([{ name: "Sheet1" }]);
  const sheetRef = React.useRef(null);

  const manualExport = async () => {
    const exportedFile = await transformFortuneToExcel(
      sheetRef.current,
      "xlsx",
      true
    );
    console.log("Exported file data:", exportedFile);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100vh",
      }}
    >
      <button onClick={manualExport}>Try Manual Export!</button>
      <FortuneExcelHelper
        setKey={setKey}
        setSheets={setSheets}
        sheetRef={sheetRef}
        config={{
          import: { xlsx: true, csv: true },
          export: { xlsx: true, csv: true },
        }}
      />
      <Workbook
        key={key}
        data={sheets}
        ref={sheetRef}
        customToolbarItems={[importToolBarItem(), exportToolBarItem()]}
      />
    </div>
  );
};
