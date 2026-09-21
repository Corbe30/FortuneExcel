type ImageExtension = "png" | "jpeg" | "gif";
type AnchorAxis = { index: number; offset: number };

const EMU_PER_PIXEL_AT_96_DPI = 9525;

// Use native OOXML offsets. ExcelJS's fractional col/row API derives offsets
// from character/point units and loses pixel accuracy for partial cells.
const getAnchorAxis = function (num: number, positions: number[]): AnchorAxis {
  const pixel = Math.max(0, num || 0);
  if (positions.length === 0) {
    return { index: 0, offset: pixel };
  }

  let previous = 0;
  for (let index = 0; index < positions.length; index++) {
    const current = positions[index];
    if (pixel < current) {
      return { index, offset: pixel - previous };
    }
    if (pixel === current) {
      return { index: index + 1, offset: 0 };
    }
    previous = current;
  }

  const lastIndex = positions.length - 1;
  const lastSize =
    lastIndex > 0
      ? positions[lastIndex] - positions[lastIndex - 1]
      : positions[0];
  if (lastSize <= 0) {
    return { index: positions.length, offset: pixel - previous };
  }

  const remaining = pixel - previous;
  const additionalCells = Math.floor(remaining / lastSize);
  return {
    index: positions.length + additionalCells,
    offset: remaining - additionalCells * lastSize,
  };
};

const getImageAnchor = function (
  left: number,
  top: number,
  columnPositions: number[],
  rowPositions: number[]
) {
  const column = getAnchorAxis(left, columnPositions);
  const row = getAnchorAxis(top, rowPositions);
  return {
    nativeCol: column.index,
    nativeColOff: Math.round(column.offset * EMU_PER_PIXEL_AT_96_DPI),
    nativeRow: row.index,
    nativeRowOff: Math.round(row.offset * EMU_PER_PIXEL_AT_96_DPI),
  };
};

const getImageExtension = function (src: string): ImageExtension {
  const match = /^data:image\/([^;,]+)[;,]/i.exec(src || "");
  const imageType = match?.[1]?.toLowerCase();
  if (imageType === "jpg" || imageType === "jpeg") {
    return "jpeg";
  }
  if (imageType === "gif") {
    return "gif";
  }
  return "png";
};

var setImages = function (table: any, worksheet: any, workbook: any) {
  const localTable = { ...table };
  let {
    images,
    visibledatacolumn, //所有行的位置
    visibledatarow, //所有列的位置
  } = localTable;
  if (typeof images != "object") return;
  for (let key in images) {
    // 通过 base64  将图像添加到工作簿
    const myBase64Image = images[key].src;
    //开始行 开始列 结束行 结束列
    const item = images[key];
    const imageId = workbook.addImage({
      base64: myBase64Image,
      extension: getImageExtension(myBase64Image),
    });

    if (!visibledatacolumn || !visibledatarow) {
      const defaultColWidth = localTable.defaultColWidth || 73;
      const defaultRowHeight = localTable.defaultRowHeight || 19;

      const rowCount = localTable.data.length;
      const colCount = localTable.data[0].length;

      visibledatacolumn = [];
      visibledatarow = [];

      let lastVal = 0;
      for (let i = 0; i < rowCount; i++) {
        const rowHeight = localTable.config?.rowlen?.[i] || defaultRowHeight;
        const isHidden = localTable.config?.rowhidden?.[i] != null;
        const rowPosition = lastVal + (isHidden ? 0 : rowHeight + 1);

        visibledatarow.push(rowPosition);
        lastVal = rowPosition;
      }

      lastVal = 0;
      for (let i = 0; i < colCount; i++) {
        const colWidth = localTable.config?.columnlen?.[i] || defaultColWidth;
        const isHidden = localTable.config?.colhidden?.[i] != null;
        const colPosition = lastVal + (isHidden ? 0 : colWidth + 1);

        visibledatacolumn.push(colPosition);
        lastVal = colPosition;
      }
    }

    const topLeft = getImageAnchor(
      item.left,
      item.top,
      visibledatacolumn,
      visibledatarow
    );

    // Preserve FortuneSheet's image movement/resize mode in the OOXML anchor.
    if (item.type === "1") {
      worksheet.addImage(imageId, {
        tl: topLeft,
        br: getImageAnchor(
          item.left + item.width,
          item.top + item.height,
          visibledatacolumn,
          visibledatarow
        ),
        editAs: "twoCell",
      });
    } else {
      worksheet.addImage(imageId, {
        tl: topLeft,
        ext: { width: item.width, height: item.height },
        editAs: item.type === "3" ? "absolute" : "oneCell",
      });
    }
  }
};

export { setImages };
