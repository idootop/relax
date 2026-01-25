import { emit, listen } from '@tauri-apps/api/event';
import { useState } from 'react';

import { SettingStore } from '../store';
import { useListen } from './event';
import { Overlay } from './overlay';

export type TimerMode = 'idle' | 'focus' | 'break';

export interface TimerState {
  mode: TimerMode;
  paused: boolean;
  timeLeft: number; // milliseconds
}

export function useTimerState() {
  const [state, setState] = useState<TimerState>({
    mode: 'idle',
    paused: false,
    timeLeft: 0,
  });
  useListen<TimerState>('timer-update', (s) => {
    setState(s);
  });
  return state;
}

/**
 * 核心计时器控制器 - 运行在后台窗口中
 */
class TimerController {
  private mode: TimerMode = 'idle';
  private paused = false;
  private timeLeft = 0;

  private timerId: number | null = null;
  private lastTick: number = 0;

  /**
   * 初始化：注册全局事件监听并立即开始计时
   */
  async init() {
    listen('timer-next', () => this.handleNext());
    listen('timer-reset', () => this.handleReset());
    listen('timer-pause', () => this.handlePause());
    listen('timer-resume', () => this.handleResume());
    listen('settings-update', () => this.handleReset());

    // 初始启动：默认进入 focus 模式
    this.handleStart();
  }

  // --- 外部调用接口 (Emitters) ---

  next() {
    emit('timer-next');
  }
  reset() {
    emit('timer-reset');
  }
  pause() {
    emit('timer-pause');
  }
  resume() {
    emit('timer-resume');
  }

  // --- 内部逻辑处理 ---

  private async handleStart() {
    this.mode = 'focus';
    this.resetDuration();
    this.paused = false;
    await this.syncUI();
    this.startTicker();
  }

  private async handleNext() {
    if (this.mode === 'idle') return;
    this.mode = this.mode === 'focus' ? 'break' : 'focus';
    this.resetDuration();
    this.paused = false;
    await this.syncUI();
    this.startTicker();
  }

  private async handlePause() {
    if (this.mode === 'idle' || this.paused) return;
    this.paused = true;
    this.stopTicker();
    this.broadcast();
  }

  private async handleResume() {
    if (this.mode === 'idle' || !this.paused) return;
    this.paused = false;
    this.startTicker();
    this.broadcast();
  }

  private handleReset() {
    if (this.mode === 'idle') return;
    this.resetDuration();
    this.broadcast();
  }

  // --- 核心引擎 ---

  private resetDuration() {
    const settings = SettingStore.refresh();
    this.timeLeft =
      this.mode === 'focus' ? settings.focusDuration : settings.breakDuration;
  }

  private async syncUI() {
    if (this.mode === 'break') {
      await Overlay.show();
    } else {
      await Overlay.hide();
    }
  }

  private broadcast() {
    return emit('timer-update', {
      mode: this.mode,
      paused: this.paused,
      timeLeft: Math.max(0, this.timeLeft),
    });
  }

  private startTicker() {
    this.stopTicker();
    this.lastTick = Date.now();

    const tick = () => {
      if (this.paused || this.mode === 'idle') return;

      const now = Date.now();
      this.timeLeft -= now - this.lastTick;
      this.lastTick = now;

      if (this.timeLeft <= 0) {
        this.handleNext();
        return;
      }

      this.broadcast();
      this.timerId = window.setTimeout(tick, 200);
    };

    tick();
  }

  private stopTicker() {
    if (this.timerId) clearTimeout(this.timerId);
    this.timerId = null;
  }
}

export const Timer = new TimerController();
