import { PluginExample } from "./Plugin.tsx";
import { ManualExample } from "./Manual.tsx";

const meta = {
  title: "Example/FortuneExcel",
  parameters: {
    layout: "fullscreen",
    options: { showPanel: false } 
  },
};

export default meta;

export const plugin = () => {
  return PluginExample();
};
export const manual = () => {
  return ManualExample();
};