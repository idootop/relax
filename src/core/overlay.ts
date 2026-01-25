import { invoke } from '@tauri-apps/api/core';
import { availableMonitors, getAllWindows } from '@tauri-apps/api/window';

const OVERLAY_WINDOW_PREFIX = 'overlay';

const formatLabel = (monitor: any) => {
  return `${OVERLAY_WINDOW_PREFIX}-${monitor.name}`.replace(
    /[^a-zA-Z0-9-_]/g,
    '',
  );
};

class _Overlay {
  async show() {
    await this.hide();

    const monitors = await availableMonitors();

    for (const monitor of monitors) {
      const label = formatLabel(monitor);
      await invoke('create_overlay_window', {
        label,
        url: `index.html#/overlay`,
        x: monitor.position.x,
        y: monitor.position.y,
        width: monitor.size.width,
        height: monitor.size.height,
      });
    }
  }

  async hide() {
    const windows = await getAllWindows();
    for (const win of windows) {
      if (win.label.startsWith(OVERLAY_WINDOW_PREFIX)) {
        await win.close();
      }
    }
  }
}

export const Overlay = new _Overlay();
