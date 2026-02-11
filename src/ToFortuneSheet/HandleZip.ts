import JSZip from "jszip";
import { IuploadfileList } from "../common/ICommon";

export class HandleZip {
  uploadFile: File;
  workBook: JSZip;

  constructor(file: File) {
    this.uploadFile = file;
  }

  async unzipFile(): Promise<IuploadfileList> {
    const zip = await JSZip.loadAsync(this.uploadFile);
    const fileList: IuploadfileList = <IuploadfileList>{};
    for (const [_path, zipEntry] of Object.entries(zip.files)) {
      const fileName = zipEntry.name;
      const fileNameArr = fileName.split(".");
      const suffix = fileNameArr[fileNameArr.length - 1]?.toLowerCase();
      let fileType: JSZip.OutputType = "string";
      if (
        suffix in
        {
          png: 1,
          jpeg: 1,
          jpg: 1,
          gif: 1,
          bmp: 1,
          tif: 1,
          webp: 1,
        }
      ) {
        fileType = "base64";
      } else if (suffix == "emf") {
        fileType = "arraybuffer";
      }
      let data = await zipEntry.async(fileType);
      if (fileType == "base64") {
        data = "data:image/" + suffix + ";base64," + data;
      }
      fileList[zipEntry.name] = data as string; // XXX: ignore EMF ArrayBuffer :/
    }
    return fileList;
  }
}
