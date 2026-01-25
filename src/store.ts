import { kOneMinute } from '@del-wang/utils';
import { emit } from '@tauri-apps/api/event';
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
  breakMessage: '休息一下，马上回来',
  // 背景图片
  backgroundImage: '',
});

export const SettingStore = withLocalStorage(store, 'settings');
