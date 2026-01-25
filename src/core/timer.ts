import { emit, listen } from '@tauri-apps/api/event';

import { SettingStore } from '../store';
import { Overlay } from './overlay';

export type TimerMode = 'idle' | 'focus' | 'break';

export interface TimerState {
  mode: TimerMode;
  paused: boolean;
  remaining: number; // milliseconds
}

/**
 * 核心计时器控制器 - 运行在后台窗口中
 */
class TimerController {
  private mode: TimerMode = 'idle';
  private paused = false;
  private remaining = 0;

  private timerId: number | null = null;
  private lastTick: number = 0;

  /**
   * 初始化：注册全局事件监听并立即开始计时
   */
  async init() {
    listen('timer-next', () => this.handleNext());
    listen('timer-start', () => this.handleStart());
    listen('timer-stop', () => this.handleStop());
    listen('timer-pause', () => this.handlePause());
    listen('timer-resume', () => this.handleResume());
    listen('settings-update', () => this.handleReset());

    // 初始启动：默认进入 focus 模式
    this.mode = 'focus';
    this.resetDuration();
    await this.syncUI();
    this.startTicker();
  }

  // --- 外部调用接口 (Emitters) ---

  next() {
    emit('timer-next');
  }
  start() {
    emit('timer-start');
  }
  stop() {
    emit('timer-stop');
  }
  pause() {
    emit('timer-pause');
  }
  resume() {
    emit('timer-resume');
  }

  // --- 内部逻辑处理 ---

  private async handleStart() {
    this.mode = 'break';
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

  private async handleStop() {
    this.mode = 'idle';
    this.remaining = 0;
    this.paused = false;
    this.stopTicker();
    await this.syncUI();
    this.broadcast();
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
    this.remaining =
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
      remaining: Math.max(0, this.remaining),
    });
  }

  private startTicker() {
    this.stopTicker();
    this.lastTick = Date.now();

    const tick = () => {
      if (this.paused || this.mode === 'idle') return;

      const now = Date.now();
      this.remaining -= now - this.lastTick;
      this.lastTick = now;

      if (this.remaining <= 0) {
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
