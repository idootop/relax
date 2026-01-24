import { getAllWebviewWindows } from '@tauri-apps/api/webviewWindow';

export const getWebviewWindow = async (label: string) => {
  const windows = await getAllWebviewWindows();
  return windows.find((w) => w.label === label);
};
