import { listen } from '@tauri-apps/api/event';
import { useEffect, useRef } from 'react';

export function useListen<T>(event: string, callback: (data: T) => void) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const unlisten = listen<T>(event, async (event) => {
      callbackRef.current(event.payload);
    });
    return () => {
      unlisten.then((u) => u());
    };
  }, [event]);
}
