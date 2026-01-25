import { disable, enable, isEnabled } from '@tauri-apps/plugin-autostart';
import { useEffect, useState } from 'react';

export function useAutoStart() {
  const [isAutoStart, _setAutoStart] = useState(false);

  useEffect(() => {
    isEnabled().then(_setAutoStart);
  }, []);

  const setAutoStart = async (open) => {
    try {
      if (open) {
        await enable();
      } else {
        await disable();
      }
      setAutoStart(open);
    } catch (e) {
      console.error(e);
    }
  };

  return { isAutoStart, setAutoStart };
}
