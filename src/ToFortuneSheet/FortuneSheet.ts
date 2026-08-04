import {
  IfortuneImageBorder,
  IfortuneImageCrop,
  IfortuneImageDefault,
  IfortuneImages,
  IfortuneSheetCelldata,
  IfortuneSheetCelldataValue,
  IMapfortuneSheetborderInfoCellForImp,
  IfortuneSheetborderInfoCellValue,
  IfortuneSheetborderInfoCellValueStyle,
  IFormulaSI,
  IfortuneSheetRowAndColumnLen,
  IfortuneSheetRowAndColumnHidden,
  IfortuneSheetSelection,
  IcellOtherInfo,
  IformulaList,
  IformulaListItem,
  IfortunesheetHyperlink,
  IfortunesheetHyperlinkType,
  IfortunesheetDataVerification,
} from "./IFortune";
import { FortuneSheetCelldata } from "./FortuneCell";
import { IattributeList } from "../common/ICommon";
import {
  getXmlAttibute,
  getColumnWidthPixel,
  fromulaRef,
  getRowHeightPixel,
  getcellrange,
  generateRandomIndex,
  getPxByEMUs,
  getMultiSequenceToNum,
  getTransR1C1ToSequence,
  getPeelOffX14,
  getMultiFormulaValue,
} from "../common/method";
import {
  borderTypes,
  COMMON_TYPE2,
  DATA_VERIFICATION_MAP,
  DATA_VERIFICATION_TYPE2_MAP,
  worksheetFilePath,
} from "../common/constant";
import { ReadXml, IStyleCollections, Element, getColor } from "./ReadXml";
import {
  FortuneFileBase,
  FortuneSheetBase,
  FortuneConfig,
  FortuneSheetborderInfoCellForImp,
  FortuneSheetborderInfoCellValue,
  FortunesheetCalcChain,
  FortuneSheetConfigMerge,
} from "./FortuneBase";
import { ImageList } from "./FortuneImage";
import dayjs from "dayjs";

export class FortuneSheet extends FortuneSheetBase {
  private readXml: ReadXml;
  private sheetFile: string;
  private isInitialCell: boolean;
  private styles: IStyleCollections;
  private sharedStrings: Element[];
  private mergeCells: Element[];
  private calcChainEles: Element[];
  private sheetList: IattributeList;

  private imageList: ImageList;

  private formulaRefList: IFormulaSI;

  constructor(
    sheetName: string,
    sheetId: string,
    sheetOrder: number,
    isInitialCell: boolean = false,
    allFileOption: any
  ) {
    //Private
    super();
    this.isInitialCell = isInitialCell;

    this.readXml = allFileOption.readXml;
    this.sheetFile = allFileOption.sheetFile;
    this.styles = allFileOption.styles;
    this.sharedStrings = allFileOption.sharedStrings;
    this.calcChainEles = allFileOption.calcChain;
    this.sheetList = allFileOption.sheetList;
    this.imageList = allFileOption.imageList;
    this.hide = allFileOption.hide;

    //Output
    this.name = sheetName;
    this.id = sheetId;
    this.order = sheetOrder.toString();
    this.config = new FortuneConfig();
    this.celldata = [];
    this.mergeCells = this.readXml.getElementsByTagName(
      "mergeCells/mergeCell",
      this.sheetFile
    );
    let clrScheme = this.styles["clrScheme"] as Element[];
    let sheetView = this.readXml.getElementsByTagName(
      "sheetViews/sheetView",
      this.sheetFile
    );
    let showGridLines = "1",
      tabSelected = "0",
      zoomScale = "100",
      activeCell = "A1";
    if (sheetView.length > 0) {
      let attrList = sheetView[0].attributeList;
      showGridLines = getXmlAttibute(attrList, "showGridLines", "1");
      tabSelected = getXmlAttibute(attrList, "tabSelected", "0");
      zoomScale = getXmlAttibute(attrList, "zoomScale", "100");
      // let colorId = getXmlAttibute(attrList, "colorId", "0");
      let selections = sheetView[0].getInnerElements("selection");
      if (selections != null && selections.length > 0) {
        activeCell = getXmlAttibute(
          selections[0].attributeList,
          "activeCell",
          "A1"
        );
        let range: IfortuneSheetSelection = getcellrange(
          activeCell,
          this.sheetList,
          sheetId
        );
        this.luckysheet_select_save = [];
        this.luckysheet_select_save.push(range);
      }
    }
    this.showGridLines = showGridLines;
    this.status = tabSelected;
    this.zoomRatio = parseInt(zoomScale) / 100;

    let tabColors = this.readXml.getElementsByTagName(
      "sheetPr/tabColor",
      this.sheetFile
    );
    if (tabColors != null && tabColors.length > 0) {
      let tabColor = tabColors[0],
        attrList = tabColor.attributeList;
      // if(attrList.rgb!=null){
      let tc = getColor(tabColor, this.styles, "b");
      this.color = tc;
      // }
    }

    let sheetFormatPr = this.readXml.getElementsByTagName(
      "sheetFormatPr",
      this.sheetFile
    );
    let defaultColWidth, defaultRowHeight;
    if (sheetFormatPr.length > 0) {
      let attrList = sheetFormatPr[0].attributeList;
      defaultColWidth = getXmlAttibute(attrList, "defaultColWidth", "9.21");
      defaultRowHeight = getXmlAttibute(attrList, "defaultRowHeight", "19");
    }

    this.defaultColWidth = getColumnWidthPixel(parseFloat(defaultColWidth));
    this.defaultRowHeight = getRowHeightPixel(parseFloat(defaultRowHeight));

    this.generateConfigColumnLenAndHidden();
    let cellOtherInfo: IcellOtherInfo =
      this.generateConfigRowLenAndHiddenAddCell();

    if (this.calcChain == null) {
      this.calcChain = [];
    }

    let formulaListExist: IformulaList = {};
    for (let c = 0; c < this.calcChainEles.length; c++) {
      let calcChainEle = this.calcChainEles[c],
        attrList = calcChainEle.attributeList;
      if (attrList.i != sheetId) {
        continue;
      }

      let r = attrList.r,
        i = attrList.i,
        l = attrList.l,
        s = attrList.s,
        a = attrList.a,
        t = attrList.t;

      let range = getcellrange(r);
      let chain = new FortunesheetCalcChain();
      chain.r = range.row[0];
      chain.c = range.column[0];
      chain.id = this.id;
      this.calcChain.push(chain);
      formulaListExist["r" + r + "c" + c] = null;
    }

    if (this.formulaRefList != null) {
      for (let key in this.formulaRefList) {
        let funclist = this.formulaRefList[key];
        let mainFunc = funclist["mainRef"],
          mainCellValue = mainFunc.cellValue;
        let formulaTxt = mainFunc.fv;
        let mainR = mainCellValue.r,
          mainC = mainCellValue.c;
        // let refRange = getcellrange(ref);
        for (let name in funclist) {
          if (name == "mainRef") {
            continue;
          }

          let funcValue = funclist[name],
            cellValue = funcValue.cellValue;
          if (cellValue == null) {
            continue;
          }
          let r = cellValue.r,
            c = cellValue.c;

          let func = formulaTxt;
          let offsetRow = r - mainR,
            offsetCol = c - mainC;

          if (offsetRow > 0) {
            func = "=" + fromulaRef.functionCopy(func, "down", offsetRow);
          } else if (offsetRow < 0) {
            func =
              "=" + fromulaRef.functionCopy(func, "up", Math.abs(offsetRow));
          }

          if (offsetCol > 0) {
            func = "=" + fromulaRef.functionCopy(func, "right", offsetCol);
          } else if (offsetCol < 0) {
            func =
              "=" + fromulaRef.functionCopy(func, "left", Math.abs(offsetCol));
          }

          // console.log(offsetRow, offsetCol, func);

          (cellValue.v as IfortuneSheetCelldataValue).f = func;

          //添加共享公式链
          let chain = new FortunesheetCalcChain();
          chain.r = cellValue.r;
          chain.c = cellValue.c;
          chain.id = this.id;
          this.calcChain.push(chain);
        }
      }
    }

    //There may be formulas that do not appear in calcChain
    for (let key in cellOtherInfo.formulaList) {
      if (!(key in formulaListExist)) {
        let formulaListItem = cellOtherInfo.formulaList[key];
        let chain = new FortunesheetCalcChain();
        chain.r = formulaListItem.r;
        chain.c = formulaListItem.c;
        chain.id = this.id;
        this.calcChain.push(chain);
      }
    }

    // dataVerification config
    this.dataVerification = this.generateConfigDataValidations();

    // hyperlink config
    this.hyperlink = this.generateConfigHyperlinks();

    // sheet hide
    this.hide = this.hide;

    if (this.mergeCells != null) {
      for (let i = 0; i < this.mergeCells.length; i++) {
        let merge = this.mergeCells[i],
          attrList = merge.attributeList;
        let ref = attrList.ref;
        if (ref == null) {
          continue;
        }
        let range = getcellrange(ref, this.sheetList, sheetId);
        let mergeValue = new FortuneSheetConfigMerge();
        mergeValue.r = range.row[0];
        mergeValue.c = range.column[0];
        mergeValue.rs = range.row[1] - range.row[0] + 1;
        mergeValue.cs = range.column[1] - range.column[0] + 1;
        if (this.config.merge == null) {
          this.config.merge = {};
        }
        this.config.merge[range.row[0] + "_" + range.column[0]] = mergeValue;
      }
    }

    let drawingFile = allFileOption.drawingFile,
      drawingRelsFile = allFileOption.drawingRelsFile;
    if (drawingFile != null && drawingRelsFile != null) {
      this.parseImages(drawingFile, drawingRelsFile);
    }
  }

  private parseImages(drawingFile: string, drawingRelsFile: string) {
    const anchors = this.readXml.getElementsByTagName(
      "xdr:twoCellAnchor|xdr:oneCellAnchor|xdr:absoluteAnchor",
      drawingFile
    );

    for (const anchor of anchors) {
      const blips = anchor.getInnerElements("a:blip");
      if (blips == null || blips.length === 0) {
        continue;
      }

      const relationshipId = getXmlAttibute(
        blips[0].attributeList,
        "r:embed",
        null
      );
      const imageObject: any = this.getBase64ByRid(
        relationshipId,
        drawingRelsFile
      );
      if (imageObject == null) {
        continue;
      }

      if (anchor.elementString.indexOf("<xdr:absoluteAnchor") === 0) {
        this.setAbsoluteImagePosition(imageObject, anchor);
      } else {
        const from = anchor.getInnerElements("xdr:from");
        if (from == null || from.length === 0) {
          continue;
        }
        this.setImageStartPosition(imageObject, from[0]);

        if (anchor.elementString.indexOf("<xdr:oneCellAnchor") === 0) {
          this.setOneCellImageSize(imageObject, anchor);
        } else if (!this.setTwoCellImageEndPosition(imageObject, anchor)) {
          continue;
        }

        const defaultEditAs =
          anchor.elementString.indexOf("<xdr:twoCellAnchor") === 0
            ? "twoCell"
            : "oneCell";
        imageObject.type = this.getImageType(
          getXmlAttibute(anchor.attributeList, "editAs", defaultEditAs)
        );
      }

      this.initializeImageDisplayProperties(imageObject);
      if (this.images == null) {
        this.images = {};
      }
      this.images[generateRandomIndex("image")] = imageObject;
    }
  }

  private setImageStartPosition(imageObject: any, from: Element) {
    imageObject.fromCol = this.getXdrValue(from.getInnerElements("xdr:col"));
    imageObject.fromColOff = getPxByEMUs(
      this.getXdrValue(from.getInnerElements("xdr:colOff"))
    );
    imageObject.fromRow = this.getXdrValue(from.getInnerElements("xdr:row"));
    imageObject.fromRowOff = getPxByEMUs(
      this.getXdrValue(from.getInnerElements("xdr:rowOff"))
    );
  }

  private setTwoCellImageEndPosition(
    imageObject: any,
    anchor: Element
  ): boolean {
    const to = anchor.getInnerElements("xdr:to");
    if (to == null || to.length === 0) {
      return false;
    }

    imageObject.toCol = this.getXdrValue(to[0].getInnerElements("xdr:col"));
    imageObject.toColOff = getPxByEMUs(
      this.getXdrValue(to[0].getInnerElements("xdr:colOff"))
    );
    imageObject.toRow = this.getXdrValue(to[0].getInnerElements("xdr:row"));
    imageObject.toRowOff = getPxByEMUs(
      this.getXdrValue(to[0].getInnerElements("xdr:rowOff"))
    );
    return true;
  }

  private setOneCellImageSize(imageObject: any, anchor: Element) {
    const ext = anchor.getInnerElements("xdr:ext");
    imageObject.originWidth = getPxByEMUs(this.getXdrAttribute(ext, "cx"));
    imageObject.originHeight = getPxByEMUs(this.getXdrAttribute(ext, "cy"));
  }

  private setAbsoluteImagePosition(imageObject: any, anchor: Element) {
    const pos = anchor.getInnerElements("xdr:pos");
    const ext = anchor.getInnerElements("xdr:ext");
    const left = getPxByEMUs(this.getXdrAttribute(pos, "x"));
    const top = getPxByEMUs(this.getXdrAttribute(pos, "y"));
    const width = getPxByEMUs(this.getXdrAttribute(ext, "cx"));
    const height = getPxByEMUs(this.getXdrAttribute(ext, "cy"));

    imageObject.originWidth = width;
    imageObject.originHeight = height;
    imageObject.default = { left, top, width, height };
    imageObject.type = "3";
  }

  private initializeImageDisplayProperties(imageObject: any) {
    const width = imageObject.originWidth || 0;
    const height = imageObject.originHeight || 0;
    imageObject.isFixedPos = false;
    imageObject.fixedLeft = 0;
    imageObject.fixedTop = 0;

    const imageBorder: IfortuneImageBorder = {
      color: "#000",
      radius: 0,
      style: "solid",
      width: 0,
    };
    imageObject.border = imageBorder;

    const imageCrop: IfortuneImageCrop = {
      height,
      offsetLeft: 0,
      offsetTop: 0,
      width,
    };
    imageObject.crop = imageCrop;

    if (imageObject.default == null) {
      const imageDefault: IfortuneImageDefault = {
        height,
        left: 0,
        top: 0,
        width,
      };
      imageObject.default = imageDefault;
    }
  }

  private getImageType(editAs: string): string {
    if (editAs === "absolute") {
      return "3";
    }
    if (editAs === "oneCell") {
      return "2";
    }
    return "1";
  }

  private getXdrAttribute(elements: Element[], attribute: string): number {
    if (elements == null || elements.length === 0) {
      return null;
    }
    const value = getXmlAttibute(elements[0].attributeList, attribute, null);
    return value == null ? null : parseInt(value);
  }

  private getXdrValue(ele: Element[]): number {
    if (ele == null || ele.length == 0) {
      return null;
    }

    return parseInt(ele[0].value);
  }

  private getBase64ByRid(rid: string, drawingRelsFile: string) {
    let Relationships = this.readXml.getElementsByTagName(
      "Relationships/Relationship",
      drawingRelsFile
    );

    if (Relationships != null && Relationships.length > 0) {
      for (let i = 0; i < Relationships.length; i++) {
        let Relationship = Relationships[i];
        let attrList = Relationship.attributeList;
        let Id = getXmlAttibute(attrList, "Id", null);
        let src = getXmlAttibute(attrList, "Target", null);
        if (Id == rid) {
          src = src.replace(/\.\.\//g, "");
          src = "xl/" + src;
          let imgage = this.imageList.getImageByName(src);
          return imgage;
        }
      }
    }

    return null;
  }

  /**
   * @desc This will convert cols/col to fortunesheet config of column'width
   */
  private generateConfigColumnLenAndHidden() {
    let cols = this.readXml.getElementsByTagName("cols/col", this.sheetFile);
    for (let i = 0; i < cols.length; i++) {
      let col = cols[i],
        attrList = col.attributeList;
      let min = getXmlAttibute(attrList, "min", null);
      let max = getXmlAttibute(attrList, "max", null);
      let width = getXmlAttibute(attrList, "width", null);
      let hidden = getXmlAttibute(attrList, "hidden", null);
      let customWidth = getXmlAttibute(attrList, "customWidth", null);

      if (min == null || max == null) {
        continue;
      }

      let minNum = parseInt(min) - 1,
        maxNum = parseInt(max) - 1,
        widthNum = parseFloat(width);

      for (let m = minNum; m <= maxNum; m++) {
        if (width != null) {
          if (this.config.columnlen == null) {
            this.config.columnlen = {};
          }
          this.config.columnlen[m] = getColumnWidthPixel(widthNum);
        }

        if (hidden == "1") {
          if (this.config.colhidden == null) {
            this.config.colhidden = {};
          }
          this.config.colhidden[m] = 0;

          if (this.config.columnlen) {
            delete this.config.columnlen[m];
          }
        }

        if (customWidth != null) {
          if (this.config.customWidth == null) {
            this.config.customWidth = {};
          }
          this.config.customWidth[m] = 1;
        }
      }
    }
  }

  /**
   * @desc This will convert cols/col to fortunesheet config of column'width
   */
  private generateConfigRowLenAndHiddenAddCell(): IcellOtherInfo {
    let rows = this.readXml.getElementsByTagName(
      "sheetData/row",
      this.sheetFile
    );
    let cellOtherInfo: IcellOtherInfo = {};
    let formulaList: IformulaList = {};
    cellOtherInfo.formulaList = formulaList;
    for (let i = 0; i < rows.length; i++) {
      let row = rows[i],
        attrList = row.attributeList;
      let rowNo = getXmlAttibute(attrList, "r", null);
      let height = getXmlAttibute(attrList, "ht", null);
      let hidden = getXmlAttibute(attrList, "hidden", null);
      let customHeight = getXmlAttibute(attrList, "customHeight", null);

      if (rowNo == null) {
        continue;
      }

      let rowNoNum = parseInt(rowNo) - 1;
      if (height != null) {
        let heightNum = parseFloat(height);
        if (this.config.rowlen == null) {
          this.config.rowlen = {};
        }
        this.config.rowlen[rowNoNum] = getRowHeightPixel(heightNum);
      }

      if (hidden == "1") {
        if (this.config.rowhidden == null) {
          this.config.rowhidden = {};
        }
        this.config.rowhidden[rowNoNum] = 0;

        if (this.config.rowlen) {
          delete this.config.rowlen[rowNoNum];
        }
      }

      if (customHeight != null) {
        if (this.config.customHeight == null) {
          this.config.customHeight = {};
        }
        this.config.customHeight[rowNoNum] = 1;
      }

      if (this.isInitialCell) {
        let cells = row.getInnerElements("c");
        for (let key in cells) {
          let cell = cells[key];
          let cellValue = new FortuneSheetCelldata(
            cell,
            this.styles,
            this.sharedStrings,
            this.mergeCells,
            this.sheetFile,
            this.readXml
          );
          if (cellValue._borderObject != null) {
            if (this.config.borderInfo == null) {
              this.config.borderInfo = [];
            }
            this.config.borderInfo.push(cellValue._borderObject);
            delete cellValue._borderObject;
          }

          // let borderId = cellValue._borderId;
          // if(borderId!=null){
          //     let borders = this.styles["borders"] as Element[];
          //     if(this.config._borderInfo==null){
          //         this.config._borderInfo = {};
          //     }
          //     if( borderId in this.config._borderInfo){
          //         this.config._borderInfo[borderId].cells.push(cellValue.r + "_" + cellValue.c);
          //     }
          //     else{
          //         let border = borders[borderId];
          //         let borderObject = new FortuneSheetborderInfoCellForImp();
          //         borderObject.rangeType = "cellGroup";
          //         borderObject.cells = [];
          //         let borderCellValue = new FortuneSheetborderInfoCellValue();

          //         let lefts = border.getInnerElements("left");
          //         let rights = border.getInnerElements("right");
          //         let tops = border.getInnerElements("top");
          //         let bottoms = border.getInnerElements("bottom");
          //         let diagonals = border.getInnerElements("diagonal");

          //         let left = this.getBorderInfo(lefts);
          //         let right = this.getBorderInfo(rights);
          //         let top = this.getBorderInfo(tops);
          //         let bottom = this.getBorderInfo(bottoms);
          //         let diagonal = this.getBorderInfo(diagonals);

          //         let isAdd = false;
          //         if(left!=null && left.color!=null){
          //             borderCellValue.l = left;
          //             isAdd = true;
          //         }

          //         if(right!=null && right.color!=null){
          //             borderCellValue.r = right;
          //             isAdd = true;
          //         }

          //         if(top!=null && top.color!=null){
          //             borderCellValue.t = top;
          //             isAdd = true;
          //         }

          //         if(bottom!=null && bottom.color!=null){
          //             borderCellValue.b = bottom;
          //             isAdd = true;
          //         }

          //         if(isAdd){
          //             borderObject.value = borderCellValue;
          //             this.config._borderInfo[borderId] = borderObject;
          //         }

          //     }
          // }
          if (cellValue._formulaType == "shared") {
            if (this.formulaRefList == null) {
              this.formulaRefList = {};
            }

            if (this.formulaRefList[cellValue._formulaSi] == null) {
              this.formulaRefList[cellValue._formulaSi] = {};
            }

            let fv;
            if (cellValue.v != null) {
              fv = (cellValue.v as IfortuneSheetCelldataValue).f;
            }

            let refValue = {
              t: cellValue._formulaType,
              ref: cellValue._fomulaRef,
              si: cellValue._formulaSi,
              fv: fv,
              cellValue: cellValue,
            };

            if (cellValue._fomulaRef != null) {
              this.formulaRefList[cellValue._formulaSi]["mainRef"] = refValue;
            } else {
              this.formulaRefList[cellValue._formulaSi][
                cellValue.r + "_" + cellValue.c
              ] = refValue;
            }

            // console.log(refValue, this.formulaRefList);
          }

          //There may be formulas that do not appear in calcChain
          if (
            cellValue.v != null &&
            (cellValue.v as IfortuneSheetCelldataValue).f != null
          ) {
            let formulaCell: IformulaListItem = {
              r: cellValue.r,
              c: cellValue.c,
            };
            cellOtherInfo.formulaList["r" + cellValue.r + "c" + cellValue.c] =
              formulaCell;
          }

          this.celldata.push(cellValue);
        }
      }
    }

    return cellOtherInfo;
  }

  /**
   * fortunesheet config of dataValidations
   *
   * @returns {IfortunesheetDataVerification} - dataValidations config
   */
  private generateConfigDataValidations(): IfortunesheetDataVerification {
    let rows = this.readXml.getElementsByTagName(
      "dataValidations/dataValidation",
      this.sheetFile
    );
    let extLst =
      this.readXml.getElementsByTagName(
        "extLst/ext/x14:dataValidations/x14:dataValidation",
        this.sheetFile
      ) || [];

    rows = rows.concat(extLst);

    let dataVerification: IfortunesheetDataVerification = {};

    for (let i = 0; i < rows.length; i++) {
      let row = rows[i];
      let attrList = row.attributeList;
      let formulaValue = row.value;

      let type = getXmlAttibute(attrList, "type", null);
      if (!type) {
        continue;
      }
      let operator = "",
        sqref = "",
        sqrefIndexArr: string[] = [],
        valueArr: string[] = [];
      let _prohibitInput =
        getXmlAttibute(attrList, "allowBlank", null) !== "1" ? false : true;

      // x14 processing
      const formulaReg = new RegExp(/<x14:formula1>|<xm:sqref>/g);
      if (formulaReg.test(formulaValue) && extLst?.length >= 0) {
        operator = getXmlAttibute(attrList, "operator", null);
        const peelOffData = getPeelOffX14(formulaValue);
        sqref = peelOffData?.sqref;
        sqrefIndexArr = getMultiSequenceToNum(sqref);
        valueArr = getMultiFormulaValue(peelOffData?.formula);
      } else {
        operator = getXmlAttibute(attrList, "operator", null);
        sqref = getXmlAttibute(attrList, "sqref", null);
        sqrefIndexArr = getMultiSequenceToNum(sqref);
        valueArr = getMultiFormulaValue(formulaValue);
      }

      let _type = DATA_VERIFICATION_MAP[type];
      let _type2 = null;
      let _value1: string | number = valueArr?.length >= 1 ? valueArr[0] : "";
      let _value2: string | number = valueArr?.length === 2 ? valueArr[1] : "";
      let _hint = getXmlAttibute(attrList, "prompt", null);
      let _hintShow = _hint ? true : false;

      const matchType = COMMON_TYPE2.includes(_type) ? "common" : _type;
      _type2 = operator
        ? DATA_VERIFICATION_TYPE2_MAP[matchType][operator]
        : "bw";

      // mobile phone number processing
      if (
        _type === "text_content" &&
        (_value1?.includes("LEN") || _value1?.includes("len")) &&
        _value1?.includes("=11")
      ) {
        _type = "validity";
        _type2 = "phone";
      }

      // date processing
      if (_type === "date") {
        const D1900 = new Date(1899, 11, 30, 0, 0, 0);
        _value1 = dayjs(D1900)
          .clone()
          .add(Number(_value1), "day")
          .format("YYYY-MM-DD");
        _value2 = dayjs(D1900)
          .clone()
          .add(Number(_value2), "day")
          .format("YYYY-MM-DD");
      }

      // checkbox and dropdown processing
      if (_type === "checkbox" || _type === "dropdown") {
        _type2 = null;
      }

      // dynamically add dataVerifications
      for (const ref of sqrefIndexArr) {
        dataVerification[ref] = {
          type: _type,
          type2: _type2,
          value1: _value1,
          value2: _value2,
          checked: false,
          remote: false,
          prohibitInput: _prohibitInput,
          hintShow: _hintShow,
          hintText: _hint,
        };
      }
    }

    return dataVerification;
  }

  /**
   * fortunesheet config of hyperlink
   *
   * @returns {IfortunesheetHyperlink} - hyperlink config
   */
  private generateConfigHyperlinks(): IfortunesheetHyperlink {
    let rows = this.readXml.getElementsByTagName(
      "hyperlinks/hyperlink",
      this.sheetFile
    );
    let hyperlink: IfortunesheetHyperlink = {};
    for (let i = 0; i < rows.length; i++) {
      let row = rows[i];
      let attrList = row.attributeList;
      let ref = getXmlAttibute(attrList, "ref", null),
        refArr = getMultiSequenceToNum(ref),
        _display = getXmlAttibute(attrList, "display", null),
        _address = getXmlAttibute(attrList, "location", null),
        _tooltip = getXmlAttibute(attrList, "tooltip", null);
      let _type: IfortunesheetHyperlinkType = _address
        ? "cellrange"
        : "webpage";

      // external hyperlink
      if (!_address) {
        let rid = attrList["r:id"];
        let sheetFile = this.sheetFile;
        let relationshipList = this.readXml.getElementsByTagName(
          "Relationships/Relationship",
          `xl/worksheets/_rels/${sheetFile.replace(worksheetFilePath, "")}.rels`
        );

        const findRid = relationshipList?.find(
          (e) => e.attributeList["Id"] === rid
        );

        if (findRid) {
          _address = findRid.attributeList["Target"];
          const type = findRid.attributeList[
            "TargetMode"
          ]?.toLocaleLowerCase();
          if (type === "external") {
            _type = "webpage";
          }
        }
      }

      // match R1C1
      const addressReg = new RegExp(/^.*!R([\d$])+C([\d$])*$/g);
      if (addressReg.test(_address)) {
        _address = getTransR1C1ToSequence(_address);
      }

      // dynamically add hyperlinks
      for (const ref of refArr) {
        hyperlink[ref] = {
          linkAddress: _address,
          linkTooltip: _tooltip || "",
          linkType: _type,
          display: _display || "",
        };
      }
    }

    return hyperlink;
  }

  // private getBorderInfo(borders:Element[]):FortuneSheetborderInfoCellValueStyle{
  //     if(borders==null){
  //         return null;
  //     }

  //     let border = borders[0], attrList = border.attributeList;
  //     let clrScheme = this.styles["clrScheme"] as Element[];
  //     let style:string = attrList.style;
  //     if(style==null || style=="none"){
  //         return null;
  //     }

  //     let colors = border.getInnerElements("color");
  //     let colorRet = "#000000";
  //     if(colors!=null){
  //         let color = colors[0];
  //         colorRet = getColor(color, clrScheme);
  //     }

  //     let ret = new FortuneSheetborderInfoCellValueStyle();
  //     ret.style = borderTypes[style];
  //     ret.color = colorRet;

  //     return ret;
  // }
}
