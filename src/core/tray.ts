import { Image } from '@tauri-apps/api/image';
import { Menu, MenuItem, type MenuItemOptions } from '@tauri-apps/api/menu';
import { TrayIcon } from '@tauri-apps/api/tray';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { exit } from '@tauri-apps/plugin-process';

import { getWebviewWindow } from '@/core/window';

async function openMainWindow() {
  let mainWin = await getWebviewWindow('main');
  if (!mainWin) {
    mainWin = new WebviewWindow('main', {
      title: 'Re:Lax',
      width: 420,
      height: 680,
      center: true,
      resizable: false,
      skipTaskbar: false,
      url: 'index.html#',
    });
    await new Promise((resolve) => {
      mainWin!.once('tauri://created', resolve);
    });
  }

  await mainWin.show();
  await mainWin.setFocus();
}
class _Tray {
  trayId = 'tray-main';

  menu: MenuItemOptions[] = [
    {
      id: 'home',
      text: '首页',
      action: openMainWindow,
    },
    {
      id: 'quit',
      text: '退出',
      action: async () => {
        await exit(0);
      },
    },
  ];

  async init() {
    TrayIcon.new({
      id: this.trayId,
      tooltip: 'Re:Lax',
      icon: await this.getImage('/tray-icon.png'),
      iconAsTemplate: true,
      menu: await Menu.new({
        items: await Promise.all(
          this.menu.map(async (item) => {
            return MenuItem.new(item);
          }),
        ),
      }),
      showMenuOnLeftClick: false,
      action: async (event) => {
        if (
          event.type === 'Click' &&
          event.button === 'Left' &&
          event.buttonState === 'Up'
        ) {
          await openMainWindow();
        }
      },
    });
  }

  async getImage(url: string) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const buffer = await blob.arrayBuffer();
      return Image.fromBytes(new Uint8Array(buffer));
    } catch (e) {
      console.error('Failed to load tray icon', e);
      return;
    }
  }
}

export const Tray = new _Tray();
