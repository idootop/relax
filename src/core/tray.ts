import { Image } from '@tauri-apps/api/image';
import { Menu, MenuItem, type MenuItemOptions } from '@tauri-apps/api/menu';
import { TrayIcon } from '@tauri-apps/api/tray';
import { exit } from '@tauri-apps/plugin-process';

import { getWebviewWindow } from '@/core/window';

class _Tray {
  trayId = 'tray-main';

  menu: MenuItemOptions[] = [
    {
      id: 'home',
      text: '设置',
      action: async () => {
        const mainWin = await getWebviewWindow('main');
        if (mainWin) {
          await mainWin.show();
          await mainWin.setFocus();
        }
      },
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
      menu: await Menu.new({
        items: await Promise.all(
          this.menu.map(async (item) => {
            return MenuItem.new(item);
          }),
        ),
      }),
      showMenuOnLeftClick: false,
      action: async (event) => {
        // 点击托盘图标显示窗口
        if (
          event.type === 'Click' &&
          event.button === 'Left' &&
          event.buttonState === 'Up'
        ) {
          const mainWin = await getWebviewWindow('main');
          if (mainWin) {
            await mainWin.show();
            await mainWin.setFocus();
          }
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
