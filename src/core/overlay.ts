import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { availableMonitors, getAllWindows } from '@tauri-apps/api/window';

const WALLPAPER_WINDOW_PREFIX = 'overlay';

const formatLabel = (monitor: any) => {
  return `${WALLPAPER_WINDOW_PREFIX}-${monitor.name}`.replace(
    /[^a-zA-Z0-9-_]/g,
    '',
  );
};

class _Overlay {
  async start() {
    listen<any>('monitor-changed', (e) => {
      this.syncOverlayWindows(e.payload);
    });
  }

  async syncOverlayWindows(monitors?: any[]) {
    monitors ??= await availableMonitors();
    const windows = await getAllWindows();

    const overlayWindows = windows.filter((w) =>
      w.label.startsWith(WALLPAPER_WINDOW_PREFIX),
    );

    const currentLabels = monitors.map(formatLabel);

    // 1. 销毁不再存在的显示器对应的窗口
    for (const win of overlayWindows) {
      if (!currentLabels.includes(win.label)) {
        await win.close();
      }
    }

    // 2. 为新显示器创建窗口
    for (const monitor of monitors) {
      const label = formatLabel(monitor);
      const win = overlayWindows.find((w) => w.label === label);
      if (!win) {
        await invoke('create_overlay_window', {
          label,
          url: 'index.html#/overlay',
          x: monitor.position.x,
          y: monitor.position.y,
          width: monitor.size.width,
          height: monitor.size.height,
        });
      }
    }
  }
}

export const Overlay = new _Overlay();
