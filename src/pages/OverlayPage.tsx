import { useMemo, useState } from 'react';

import { useListen } from '@/core/event';
import { Timer, type TimerState } from '@/core/timer';
import { SettingStore } from '@/store';

export const OverlayPage = () => {
  const [remaining, setRemaining] = useState(0);

  const settings = useMemo(() => SettingStore.refresh(), []);

  useListen<TimerState>('timer-update', (timer) => {
    setRemaining(timer.remaining);
  });

  const formatTime = (ms) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const imageURL =
    'https://i.dell.com/sites/csimages/App-Merchandizing_esupport_flatcontent_global_Images/all/bluescreen.png';

  return (
    <div className="fixed inset-0 flex select-none items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0 bg-black">
        <div
          className="absolute inset-0 bg-center bg-cover transition-transform duration-[10000ms] ease-linear"
          style={{
            backgroundImage: `url(${settings.backgroundImage || imageURL})`,
          }}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
        <span
          className="font-thin text-[36vw] text-white tabular-nums leading-none tracking-tighter opacity-[0.25] transition-all duration-[2000ms] ease-out"
          style={{
            textShadow: '0 10px 30px rgba(0,0,0,0.5)',
          }}
        >
          {formatTime(remaining)}
        </span>
      </div>

      <div className="relative z-10 w-full px-12 text-center text-white">
        <h1
          className="font-light text-5xl leading-snug tracking-widest md:text-8xl"
          style={{
            textShadow: '0 4px 12px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.3)',
          }}
        >
          {settings.breakMessage}
        </h1>
      </div>

      <button
        className="absolute right-12 bottom-12 text-white"
        onClick={() => Timer.next()}
      >
        Skip
      </button>
    </div>
  );
};
