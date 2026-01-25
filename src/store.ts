import { kOneMinute } from '@del-wang/utils';
import { convertFileSrc } from '@tauri-apps/api/core';
import { emit } from '@tauri-apps/api/event';
import { appDataDir, join } from '@tauri-apps/api/path';
import { open } from '@tauri-apps/plugin-dialog';
import { copyFile, mkdir, remove } from '@tauri-apps/plugin-fs';
import { createStore, type State, type ZenBox } from 'zenbox';

export function withLocalStorage<T extends State>(
  store: ZenBox<T>,
  name: string,
  persistKeys?: (keyof T)[],
) {
  const originalSetState = store.setState;

  const newStore: ZenBox<T> & {
    refresh: () => Readonly<T>;
  } = store as any;

  newStore.setState = (state: T) => {
    originalSetState(state);
    localStorage.setItem(
      name,
      JSON.stringify(
        Object.fromEntries(
          Object.entries(store.value).filter(([key, value]) =>
            persistKeys
              ? persistKeys.includes(key)
              : typeof value !== 'function',
          ),
        ),
      ),
    );
    // 设置变更
    emit('settings-update');
  };

  newStore.refresh = () => {
    originalSetState(JSON.parse(localStorage.getItem(name) || '{}'));
    return store.value;
  };

  // 从本地存储中恢复状态
  newStore.refresh();

  return newStore;
}

const store = createStore({
  // 专注时长
  focusDuration: 45 * kOneMinute,
  // 休息时长
  breakDuration: 15 * kOneMinute,
  // 提示语
  breakMessage: '',
  // 背景图片
  backgroundImage: '',
  // 选择图片
  async pickImage() {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif'] },
        ],
      });

      if (!selected || Array.isArray(selected)) return;

      const assetsDir = await appDataDir();
      const imageDir = await join(assetsDir, 'images');
      await remove(imageDir).catch(() => {});
      await mkdir(imageDir, { recursive: true });
      const targetPath = await join(imageDir, 'background-' + Date.now());

      await copyFile(selected, targetPath);

      const backgroundImage = convertFileSrc(targetPath);

      store.setState({ backgroundImage });
    } catch (err) {
      console.error('保存壁纸失败:', err);
    }
  },
});

export const SettingStore = withLocalStorage(store, 'settings');
