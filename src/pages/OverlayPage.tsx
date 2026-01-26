import { useMemo, useState } from 'react';

import { useListen } from '@/core/event';
import { Timer, type TimerState } from '@/core/timer';
import { SettingStore } from '@/store';

export const OverlayPage = () => {
  const [timeLeft, setRemaining] = useState(0);

  const settings = useMemo(() => SettingStore.refresh(), []);

  useListen<TimerState>('timer-update', (timer) => {
    setRemaining(timer.timeLeft);
  });

  const formatTime = (ms) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 flex select-none items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0 bg-black">
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={settings.backgroundImage || '/bluescreen.png'}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
              objectFit: 'cover',
            }}
          />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
        <span
          className="font-thin text-[36vw] text-white tabular-nums leading-none tracking-tighter opacity-[0.25] transition-all duration-[2000ms] ease-out"
          style={{
            textShadow: '0 10px 30px rgba(0,0,0,0.5)',
          }}
        >
          {formatTime(timeLeft)}
        </span>
      </div>

      <div className="relative z-10 w-full px-12 text-center text-white">
        <h1
          className="select-none font-normal text-5xl leading-snug tracking-widest md:text-8xl"
          style={{
            textShadow: '0 10px 30px rgba(0,0,0,0.5)',
          }}
        >
          {settings.breakMessage}
        </h1>
      </div>

      {import.meta.env.DEV && (
        <button
          className="absolute right-12 bottom-12 cursor-pointer text-white"
          onClick={() => Timer.next()}
        >
          Skip
        </button>
      )}
    </div>
  );
};
