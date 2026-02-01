import React from "react";
import { Workbook } from "@fortune-sheet/react";
import "@fortune-sheet/react/dist/index.css";
import {
  transformExcelToFortune,
  transformFortuneToExcel,
} from "@corbe30/fortune-excel";

const FloatingContainer = (props: any) => {
  const { children } = props;
  return (
    <div
      style={{
          position: "fixed",
          bottom: "40px",
          right: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          zIndex: 100001,
      }}
    >
      {children}
    </div>
  );
};

const Button = (props: any) => {
  const { children, onClick, primary } = props;
  return (
    <button
      style={{
        padding: "10px 15px",
        cursor: "pointer",
        backgroundColor: primary ? "#007bff" : "#3573b2",
        color: "white",
        border: "none",
        borderRadius: "5px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      }}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export const ManualExample = () => {
  const [key, setKey] = React.useState(0);
  const [sheets, setSheets] = React.useState([{ name: "Sheet1" }]);
  const sheetRef = React.useRef(null);

  const manualExport = async () => {
    const exportedFile = await transformFortuneToExcel(
      sheetRef.current,
      "xlsx",
      true,
    );
    console.log("Exported file data:", exportedFile);
  };

  const manualImport = async (file: File) => {
    await transformExcelToFortune(file, setSheets, setKey, sheetRef);
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
      <FloatingContainer>
        <Button onClick={manualExport} primary>
          Manual Export
        </Button>

        <Button onClick={() => document.getElementById("ImportHelper")?.click()}>
          Manual Import
        </Button>
      </FloatingContainer>

      <input
        type="file"
        id="ImportHelper"
        accept={".xlsx,.csv"}
        onChange={async (e) => {
          if (!e.target.files) return;
          await manualImport(e.target.files[0]);
        }}
        hidden
      />
      <Workbook key={key} data={sheets} ref={sheetRef} />
    </div>
  );
};
