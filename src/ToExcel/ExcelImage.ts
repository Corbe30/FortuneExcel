type ImageExtension = "png" | "jpeg" | "gif";

// Convert a pixel offset to ExcelJS's zero-based fractional cell coordinate.
const getImagePosition = function (num: number, positions: number[]) {
  if (positions.length === 0) {
    return 0;
  }

  let previous = 0;
  for (let index = 0; index < positions.length; index++) {
    const current = positions[index];
    if (num <= current) {
      const size = current - previous;
      return index + (size > 0 ? (num - previous) / size : 0);
    }
    previous = current;
  }

  const lastIndex = positions.length - 1;
  const lastSize =
    lastIndex > 0
      ? positions[lastIndex] - positions[lastIndex - 1]
      : positions[0];
  return positions.length + (lastSize > 0 ? (num - previous) / lastSize : 0);
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
        const rowPosition = lastVal + rowHeight;

        visibledatarow.push(rowPosition);
        lastVal = rowPosition;
      }

      lastVal = 0;
      for (let i = 0; i < colCount; i++) {
        const colWidth = localTable.config?.columnlen?.[i] || defaultColWidth;
        const colPosition = lastVal + colWidth;

        visibledatacolumn.push(colPosition);
        lastVal = colPosition;
      }
    }

    const col_st = getImagePosition(item.left, visibledatacolumn);
    const row_st = getImagePosition(item.top, visibledatarow);

    // Preserve FortuneSheet's image movement/resize mode in the OOXML anchor.
    if (item.type === "1") {
      worksheet.addImage(imageId, {
        tl: { col: col_st, row: row_st },
        br: {
          col: getImagePosition(item.left + item.width, visibledatacolumn),
          row: getImagePosition(item.top + item.height, visibledatarow),
        },
        editAs: "twoCell",
      });
    } else {
      worksheet.addImage(imageId, {
        tl: { col: col_st, row: row_st },
        ext: { width: item.width, height: item.height },
        editAs: item.type === "3" ? "absolute" : "oneCell",
      });
    }
  }
};

export { setImages };
