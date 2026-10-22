import ExcelJS from "exceljs";
import { ALIGNMENT_DEFAULT } from "../common/constant";
import { rgb2hex } from "../common/method";

var fillConvert = function (bg: string): ExcelJS.Fill {
  if (!bg) {
    return null;
    // return {
    // 	type: 'pattern',
    // 	pattern: 'solid',
    // 	fgColor:{argb:'#ffffff'.replace('#','')}
    // }
  }
  bg = bg.indexOf("rgb") > -1 ? rgb2hex(bg) : bg;
  let fill: ExcelJS.Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: bg.replace("#", "") },
  };
  return fill;
};

const DEFAULT_FONT_NAME = "Calibri";

const luckyFontNames: Record<number, string> = {
  0: "微软雅黑",
  1: "宋体（Song）",
  2: "黑体（ST Heiti）",
  3: "楷体（ST Kaiti）",
  4: "仿宋（ST FangSong）",
  5: "新宋体（ST Song）",
  6: "华文新魏",
  7: "华文行楷",
  8: "华文隶书",
  9: "Arial",
  10: "Times New Roman",
  11: "Tahoma",
  12: "Verdana",
};

const resolveFontName = (ff: string | number | undefined | null): string => {
  if (ff === undefined || ff === null || ff === "") {
    return DEFAULT_FONT_NAME;
  }

  const numericIndex =
    typeof ff === "number"
      ? ff
      : /^(0|[1-9]\d*)$/.test(ff.trim())
      ? Number(ff)
      : NaN;
  if (!Number.isNaN(numericIndex) && luckyFontNames[numericIndex]) {
    return luckyFontNames[numericIndex];
  }

  const name = String(ff).trim();
  return name || DEFAULT_FONT_NAME;
};

var fontConvert = function (
  ff: string | number = "",
  fc = "#000000",
  bl = 0,
  it = 0,
  fs = 10,
  cl = 0,
  ul = 0
) {
  // luckysheet：ff(样式), fc(颜色), bl(粗体), it(斜体), fs(大小), cl(删除线), ul(下划线)
  const num2bl = (num: number) => num !== 0;
  let color = (fc + "").indexOf("rgb") > -1 ? rgb2hex(fc) : fc;

  let font = {
    name: resolveFontName(ff),
    family: 1,
    size: fs,
    color: { argb: color.replace("#", "") },
    bold: num2bl(bl),
    italic: num2bl(it),
    underline: num2bl(ul),
    strike: num2bl(cl),
  };

  return font;
};

var alignmentConvert = function (
  vt = ALIGNMENT_DEFAULT,
  ht = ALIGNMENT_DEFAULT,
  tb = ALIGNMENT_DEFAULT,
  tr = ALIGNMENT_DEFAULT
) {
  // luckysheet:vt(垂直), ht(水平), tb(换行), tr(旋转)
  const luckyToExcel: any = {
    vertical: {
      0: "middle",
      1: "top",
      2: "bottom",
      ALIGNMENT_DEFAULT: "top",
    },
    horizontal: {
      0: "center",
      1: "left",
      2: "right",
      ALIGNMENT_DEFAULT: "left",
    },
    wrapText: {
      0: false,
      1: false,
      2: true,
      ALIGNMENT_DEFAULT: false,
    },
    textRotation: {
      0: 0,
      1: 45,
      2: -45,
      3: "vertical",
      4: 90,
      5: -90,
      ALIGNMENT_DEFAULT: 0,
    },
  };

  let alignment: Partial<ExcelJS.Alignment> = {
    vertical: luckyToExcel.vertical[vt],
    horizontal: luckyToExcel.horizontal[ht],
    wrapText: luckyToExcel.wrapText[tb],
    textRotation: luckyToExcel.textRotation[tr],
  };
  return alignment;
};

export { fillConvert, fontConvert, alignmentConvert };
