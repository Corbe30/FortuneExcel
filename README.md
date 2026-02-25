<p align="center">
  <img align="center" src="fortuneExcelLogo.png" width="150px" height="150px" />
</p>
<h1 align="center">FortuneExcel</h1>
<p align="center">FortuneExcel is an .xlsx and .csv import/export plugin for FortuneSheet / ProsperaSheet.</p>

<div align="center">

<p>
  <a href="http://npmjs.com/package/@corbe30/fortune-excel" alt="fortuneExcel on npm">
    <img src="https://img.shields.io/npm/v/@corbe30/fortune-excel" />
  </a> 
  <a href="http://npmjs.com/package/@corbe30/fortune-excel" alt="fortuneExcel downloads">
    <img src="https://img.shields.io/npm/d18m/%40corbe30%2Ffortune-excel" />
  </a>
  <a href="https://corbe30.github.io/FortuneExcel/" alt="fortuneExcel storybok">
    <img src="https://img.shields.io/badge/storybook-FF4785" />
  </a>
</p>

</div>

## Usage

1. Install the package:
    ```js
    npm i @corbe30/fortune-excel
    ```

2. Import/export toolbar item ([code example](https://github.com/Corbe30/FortuneExcel/tree/main/src/stories/Plugin.tsx))
    > Note: `<FortuneExcelHelper />` is a hidden component.
    ```js
    import { FortuneExcelHelper, importToolBarItem, exportToolBarItem } from "@corbe30/fortune-excel";

    function App() {
      const sheetRef = useRef();
      const [key, setKey] = useState(0);
      const [sheets, setSheets] = useState(data);

      return (
        <>
          <FortuneExcelHelper
            setKey={setKey}
            setSheets={setSheets}
            sheetRef={sheetRef}
            config={{ // default = all values are true
              import: { xlsx: true, csv: true },
              export: { xlsx: true, csv: true },
            }}
          />
          <Workbook
            key={key} data={sheets} ref={sheetRef}
            customToolbarItems={[importToolBarItem(), exportToolBarItem()]}
          />
        </>
      );
    }
    ```

3. Programmatic import/export ([code example](https://github.com/Corbe30/FortuneExcel/tree/main/src/stories/Manual.tsx))
    ```js
    import { transformFortuneToExcel } from "@corbe30/fortune-excel";

    const manualExport = async () => {
      const exportedFile = await transformFortuneToExcel(
        sheetRef.current,
        "xlsx", // or "csv"; default = "xlsx"
        true // start automatic download; default = true
      );
      console.log("Exported file data:", exportedFile);
    };

    <button onClick={manualExport}>Export</button>
    ```
    ```js
    import { transformExcelToFortune } from "@corbe30/fortune-excel";
     
    const manualImport = async (event) => {
      await transformExcelToFortune(
        event.target.files[0], // file type (csv/xlsx) is automatically identified
        setSheets,
        setKey,
        sheetRef
      )
    }
    ```

## Authors and acknowledgment

- [@Corbe30](https://github.com/Corbe30)

Developers of [FortuneSheetExcel](https://github.com/zenmrp/FortuneSheetExcel):
- [@wbfsa](https://github.com/wbfsa)
- [@wpxp123456](https://github.com/wpxp123456)
- [@Dushusir](https://github.com/Dushusir)
- [@xxxDeveloper](https://github.com/xxxDeveloper)
- [@mengshukeji](https://github.com/mengshukeji)

Export support:
- [Orleans9](https://blog.csdn.net/zinchliang) - [article](https://blog.csdn.net/zinchliang/article/details/120262185)

## Contribution
1. Install node v20.17.0
3. `npm run prepare`
4. `npm run build-storybook`
5. `npm run storybook`

## License

[MIT](http://opensource.org/licenses/MIT)
