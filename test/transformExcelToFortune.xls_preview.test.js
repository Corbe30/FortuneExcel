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
        left: 74,
        top: 20,
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

test("PNG, JPEG, and GIF images preserve their anchors and bounds", async () => {
  const imageSources = {
    png: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    jpeg:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAF//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABBQJ//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAwEBPwF//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAgEBPwF//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQAGPwJ//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPyF//9oADAMBAAIAAwAAABD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/EH//xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/EH//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/EH//2Q==",
    gif: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
  };
  const expectedImages = [
    {
      id: "two-cell-png",
      src: imageSources.png,
      type: "1",
      left: 10,
      top: 8,
      width: 85,
      height: 35,
    },
    {
      id: "one-cell-jpeg",
      src: imageSources.jpeg,
      type: "2",
      left: 146,
      top: 38,
      width: 64,
      height: 48,
    },
    {
      id: "absolute-gif",
      src: imageSources.gif,
      type: "3",
      left: 230,
      top: 80,
      width: 96,
      height: 72,
    },
  ];
  const sourceSheet = {
    id: "image-matrix-sheet",
    name: "Image matrix",
    data: Array.from({ length: 12 }, () => Array(12).fill(null)),
    config: {},
    defaultColWidth: 73,
    defaultRowHeight: 19,
    images: expectedImages,
  };

  const exported = await transformFortuneToExcel(
    { current: { getAllSheets: () => [sourceSheet] } },
    "xlsx",
    false
  );
  const exportedBuffer = Buffer.from(await exported.arrayBuffer());
  const zip = await JSZip.loadAsync(exportedBuffer);
  const drawing = await zip.file("xl/drawings/drawing1.xml").async("string");

  assert.match(drawing, /<xdr:twoCellAnchor editAs="twoCell">/);
  assert.match(drawing, /<xdr:oneCellAnchor editAs="oneCell">/);
  assert.match(drawing, /<xdr:oneCellAnchor editAs="absolute">/);
  assert.ok(zip.file("xl/media/image1.png"));
  assert.ok(zip.file("xl/media/image2.jpeg"));
  assert.ok(zip.file("xl/media/image3.gif"));

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(exportedBuffer);
  assert.equal(workbook.worksheets[0].getImages().length, 3);

  const exportedFile = new File([exportedBuffer], "image-matrix.xlsx", {
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

  assert.equal(importedSheets[0].images.length, 3);
  for (const expected of expectedImages) {
    const actual = importedSheets[0].images.find((image) =>
      image.src.startsWith(expected.src.slice(0, expected.src.indexOf(",") + 1))
    );
    assert.ok(actual, `missing ${expected.type} image`);
    assert.equal(actual.src, expected.src);
    assert.equal(actual.type, expected.type);
    const tolerance = 0.01;
    assert.ok(
      Math.abs(actual.left - expected.left) < tolerance,
      `left: expected ${expected.left}, received ${actual.left}`
    );
    assert.ok(
      Math.abs(actual.top - expected.top) < tolerance,
      `top: expected ${expected.top}, received ${actual.top}`
    );
    assert.ok(
      Math.abs(actual.width - expected.width) < tolerance,
      `width: expected ${expected.width}, received ${actual.width}`
    );
    assert.ok(
      Math.abs(actual.height - expected.height) < tolerance,
      `height: expected ${expected.height}, received ${actual.height}`
    );
  }
});

test("image bounds survive custom and hidden rows and columns", async () => {
  const imageSource =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
  const expected = {
    id: "custom-dimensions-image",
    src: imageSource,
    type: "1",
    left: 90,
    top: 25,
    width: 40,
    height: 25,
  };
  const sourceSheet = {
    id: "custom-dimensions-sheet",
    name: "Custom dimensions",
    data: Array.from({ length: 6 }, () => Array(6).fill(null)),
    config: {
      columnlen: { 0: 100, 1: 50 },
      colhidden: { 1: 0 },
      rowlen: { 0: 30, 1: 40 },
      rowhidden: { 1: 0 },
    },
    defaultColWidth: 73,
    defaultRowHeight: 19,
    images: [expected],
  };

  const exported = await transformFortuneToExcel(
    { current: { getAllSheets: () => [sourceSheet] } },
    "xlsx",
    false
  );
  const buffer = Buffer.from(await exported.arrayBuffer());
  const file = new File([buffer], "custom-dimensions.xlsx", {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  let importedSheets;
  await transformExcelToFortune(
    file,
    (sheets) => {
      importedSheets = sheets;
    },
    () => {},
    { current: {} }
  );

  const [actual] = importedSheets[0].images;
  assert.equal(actual.type, expected.type);
  assert.equal(actual.left, expected.left);
  assert.equal(actual.top, expected.top);
  assert.equal(actual.width, expected.width);
  assert.equal(actual.height, expected.height);
});

test("an image outside the populated grid preserves its bounds", async () => {
  const imageSource =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
  const expected = {
    id: "outside-grid-image",
    src: imageSource,
    type: "2",
    left: 600,
    top: 160,
    width: 50,
    height: 30,
  };
  const sourceSheet = {
    id: "outside-grid-sheet",
    name: "Outside grid",
    data: Array.from({ length: 2 }, () => Array(2).fill(null)),
    config: {},
    defaultColWidth: 73,
    defaultRowHeight: 19,
    images: [expected],
  };

  const exported = await transformFortuneToExcel(
    { current: { getAllSheets: () => [sourceSheet] } },
    "xlsx",
    false
  );
  const buffer = Buffer.from(await exported.arrayBuffer());
  const file = new File([buffer], "outside-grid.xlsx", {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  let importedSheets;
  await transformExcelToFortune(
    file,
    (sheets) => {
      importedSheets = sheets;
    },
    () => {},
    { current: {} }
  );

  const [actual] = importedSheets[0].images;
  assert.equal(actual.left, expected.left);
  assert.equal(actual.top, expected.top);
  assert.equal(actual.width, expected.width);
  assert.equal(actual.height, expected.height);
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
