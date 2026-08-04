const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const React = require("react");
const ReactDOMClient = require("react-dom/client");
const { JSDOM } = require("jsdom");
const ExcelJS = require("exceljs");
const JSZip = require("jszip");

const {
  transformExcelToFortune,
  transformFortuneToExcel,
} = require("../dist/main.js");

const fixturePath = path.resolve(__dirname, "fixtures", "xls_preview.xlsx");

const toBuffer = (part) => {
  if (Buffer.isBuffer(part)) {
    return part;
  }

  if (part instanceof ArrayBuffer) {
    return Buffer.from(part);
  }

  if (ArrayBuffer.isView(part)) {
    return Buffer.from(part.buffer, part.byteOffset, part.byteLength);
  }

  if (typeof part === "string") {
    return Buffer.from(part);
  }

  throw new TypeError(`Unsupported file part: ${typeof part}`);
};

global.File = function TestFile(parts, name, options = {}) {
  const buffer = Buffer.concat(parts.map(toBuffer));
  buffer.name = name;
  buffer.type = options.type ?? "";
  buffer.lastModified = options.lastModified ?? Date.now();
  buffer.arrayBuffer = async () =>
    buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    );
  buffer.text = async () => buffer.toString();
  return buffer;
};

global.window = {
  navigator: {
    userAgent: "node-test",
  },
};

const waitForDeferredSizing = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 10);
  });

const getCell = (sheet, row, column) =>
  sheet.celldata.find((cell) => cell.r === row && cell.c === column);

const loadFixtureIntoFortune = async () => {
  const fileBuffer = await fs.readFile(fixturePath);
  const file = new File(
    [fileBuffer],
    "xls_preview.xlsx",
    {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }
  );

  const setSheetsCalls = [];
  const setKeyCalls = [];
  const columnWidthCalls = [];
  const rowHeightCalls = [];

  const setSheets = (sheets) => {
    setSheetsCalls.push(sheets);
  };

  const setKey = (updater) => {
    setKeyCalls.push(updater);
  };

  const sheetRef = {
    current: {
      setColumnWidth: (config, meta) => {
        columnWidthCalls.push([config, meta]);
      },
      setRowHeight: (config, meta) => {
        rowHeightCalls.push([config, meta]);
      },
    },
  };

  await transformExcelToFortune(file, setSheets, setKey, sheetRef);
  await waitForDeferredSizing();

  return {
    setSheetsCalls,
    setKeyCalls,
    columnWidthCalls,
    rowHeightCalls,
  };
};

test("transformExcelToFortune converts xls_preview.xlsx into Fortune sheets", async () => {
  const {
    setSheetsCalls,
    setKeyCalls,
    columnWidthCalls,
    rowHeightCalls,
  } = await loadFixtureIntoFortune();

  assert.equal(setSheetsCalls.length, 1);
  assert.equal(setKeyCalls.length, 1);
  assert.equal(typeof setKeyCalls[0], "function");
  assert.equal(setKeyCalls[0](0), 1);

  const [sheets] = setSheetsCalls;
  assert.equal(sheets.length, 1);

  const [sheet] = sheets;
  assert.equal(sheet.name, "Feuille1");
  assert.equal(sheet.status, "1");
  assert.equal(sheet.order, "0");
  assert.equal(sheet.showGridLines, "1");
  assert.deepEqual(sheet.luckysheet_select_save, [
    {
      row: [10, 10],
      column: [5, 5],
      sheetIndex: "1",
    },
  ]);

  const b2 = getCell(sheet, 1, 1);
  assert.ok(b2);
  assert.equal(b2.v.v, "552150");

  const c2 = getCell(sheet, 1, 2);
  assert.ok(c2);
  assert.equal(c2.v.f, "=$B$4");
  assert.equal(c2.v.v, "552150");

  const i3 = getCell(sheet, 2, 8);
  assert.ok(i3);
  assert.equal(i3.v.v, "max");

  const p7 = getCell(sheet, 6, 15);
  assert.ok(p7);
  assert.equal(p7.v.f, "=N7-O7");
  assert.equal(p7.v.v, "1300");

  const images = sheet.images || [];
  assert.equal(images.length, 1);
  assert.match(images[0].src, /^data:image\/png;base64,/);
  assert.equal(images[0].id.startsWith("image_"), true);
  assert.equal(images[0].left, 116.13333333333333);
  assert.equal(images[0].top, 312.2);
  assert.equal(images[0].width, 252.73333333333335);
  assert.equal(images[0].height, 273.06666666666666);
  assert.equal(images[0].type, "2");
  assert.equal(images[0].fromCol, 1);
  assert.equal(images[0].fromRow, 11);
  assert.equal(images[0].toCol, 4);
  assert.equal(images[0].toRow, 21);

  assert.equal(columnWidthCalls.length, 1);
  assert.deepEqual(columnWidthCalls[0], [sheet.config.columnlen || {}, { id: sheet.id }]);

  assert.equal(rowHeightCalls.length, 1);
  assert.deepEqual(rowHeightCalls[0], [sheet.config.rowlen || {}, { id: sheet.id }]);
});

test("an exported image can be imported again", async () => {
  const imageSource =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
  const grid = Array.from({ length: 10 }, () => Array(10).fill(null));
  const sourceSheet = {
    id: "roundtrip-sheet",
    name: "Roundtrip",
    data: grid,
    config: {},
    defaultColWidth: 73,
    defaultRowHeight: 19,
    images: [
      {
        id: "roundtrip-image",
        src: imageSource,
        left: 73,
        top: 19,
        width: 120,
        height: 60,
        originWidth: 120,
        originHeight: 60,
      },
    ],
  };
  const exportRef = {
    current: {
      getAllSheets: () => [sourceSheet],
    },
  };

  const exported = await transformFortuneToExcel(exportRef, "xlsx", false);
  const exportedBuffer = Buffer.from(await exported.arrayBuffer());
  const exportedFile = new File([exportedBuffer], "roundtrip.xlsx", {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  let importedSheets;
  await transformExcelToFortune(
    exportedFile,
    (sheets) => {
      importedSheets = sheets;
    },
    () => {},
    { current: {} }
  );

  assert.equal(importedSheets.length, 1);
  assert.equal(importedSheets[0].images.length, 1);
  const [image] = importedSheets[0].images;
  assert.equal(image.src, imageSource);
  assert.equal(image.type, "2");
  assert.equal(image.fromCol, 1);
  assert.equal(image.fromRow, 1);
  assert.equal(image.width, 120);
  assert.equal(image.height, 60);
});

test("an absolute-anchor image is imported with its pixel bounds", async () => {
  const imageSource =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Absolute");
  const imageId = workbook.addImage({
    base64: imageSource,
    extension: "gif",
  });
  worksheet.addImage(imageId, {
    tl: { col: 0, row: 0 },
    ext: { width: 120, height: 60 },
  });

  const zip = await JSZip.loadAsync(await workbook.xlsx.writeBuffer());
  const drawingPath = "xl/drawings/drawing1.xml";
  const oneCellDrawing = await zip.file(drawingPath).async("string");
  const absoluteDrawing = oneCellDrawing
    .replace(/<xdr:oneCellAnchor[^>]*>/, "<xdr:absoluteAnchor>")
    .replace(
      /<xdr:from>[\s\S]*?<\/xdr:from>/,
      '<xdr:pos x="914400" y="457200"/>'
    )
    .replace("</xdr:oneCellAnchor>", "</xdr:absoluteAnchor>");
  zip.file(drawingPath, absoluteDrawing);

  const file = new File(
    [await zip.generateAsync({ type: "nodebuffer" })],
    "absolute-anchor.xlsx",
    {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }
  );

  let importedSheets;
  await transformExcelToFortune(
    file,
    (sheets) => {
      importedSheets = sheets;
    },
    () => {},
    { current: {} }
  );

  const [image] = importedSheets[0].images;
  assert.equal(image.type, "3");
  assert.equal(image.left, 96);
  assert.equal(image.top, 48);
  assert.equal(image.width, 120);
  assert.equal(image.height, 60);
});

test("converted xls_preview.xlsx sheets can be mounted in Workbook", async () => {
  const { setSheetsCalls } = await loadFixtureIntoFortune();
  const [sheets] = setSheetsCalls;
  const { Workbook } = await import("@fortune-sheet/react/dist/index.esm.js");
  const dom = new JSDOM(
    "<!doctype html><html><body><div id='root'></div></body></html>",
    { pretendToBeVisual: true, url: "http://localhost/" }
  );

  const previousGlobals = {
    window: global.window,
    document: global.document,
    navigator: global.navigator,
    HTMLElement: global.HTMLElement,
    MutationObserver: global.MutationObserver,
    getComputedStyle: global.getComputedStyle,
    requestAnimationFrame: global.requestAnimationFrame,
    cancelAnimationFrame: global.cancelAnimationFrame,
    ResizeObserver: global.ResizeObserver,
    DOMParser: global.DOMParser,
  };

  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
  global.HTMLElement = dom.window.HTMLElement;
  global.MutationObserver = dom.window.MutationObserver;
  global.getComputedStyle = dom.window.getComputedStyle;
  global.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
  global.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  global.DOMParser = dom.window.DOMParser;

  const root = ReactDOMClient.createRoot(document.getElementById("root"));

  try {
    root.render(React.createElement(Workbook, { data: sheets }));
    await new Promise((resolve) => setTimeout(resolve, 50));
  } finally {
    root.unmount();
    dom.window.close();
    global.window = previousGlobals.window;
    global.document = previousGlobals.document;
    global.navigator = previousGlobals.navigator;
    global.HTMLElement = previousGlobals.HTMLElement;
    global.MutationObserver = previousGlobals.MutationObserver;
    global.getComputedStyle = previousGlobals.getComputedStyle;
    global.requestAnimationFrame = previousGlobals.requestAnimationFrame;
    global.cancelAnimationFrame = previousGlobals.cancelAnimationFrame;
    global.ResizeObserver = previousGlobals.ResizeObserver;
    global.DOMParser = previousGlobals.DOMParser;
  }
});
