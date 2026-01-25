import { kOneMinute, kOneSecond } from '@del-wang/utils';
import {
  ChevronRight,
  Clock,
  Image as ImageIcon,
  Monitor,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Type,
  X,
} from 'lucide-react';
import { useStore } from 'zenbox';

import { useAutoStart } from '@/core/autostart';
import { Timer, useTimerState } from '@/core/timer';
import { SettingStore } from '@/store';

export const HomePage = () => {
  const { isAutoStart, setAutoStart } = useAutoStart();
  const settings = useStore(SettingStore);
  const { mode, timeLeft, paused } = useTimerState();
  const isActive = !paused && mode !== 'idle';

  // 计算进度百分比
  const totalDuration =
    mode === 'focus' ? settings.focusDuration : settings.breakDuration;
  const progress =
    timeLeft === 0 ? 0 : ((totalDuration - timeLeft) / totalDuration) * 100;

  // 格式化时间
  const formatTime = (ms) => {
    const mins = Math.floor(ms / kOneMinute);
    const secs = Math.floor(ms / kOneSecond) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-12 font-sans text-[#1D1D1F] selection:bg-blue-100">
      <div className="mx-auto max-w-xl space-y-6 p-6">
        {/* 核心计时器仪表盘 */}
        <section className="relative overflow-hidden rounded-[2.5rem] border border-white bg-white/40 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] backdrop-blur-2xl">
          <div className="flex flex-col items-center justify-center space-y-6">
            {/* 进度环形 */}
            <div className="relative flex items-center justify-center">
              <svg className="h-48 w-48 -rotate-90">
                <circle
                  className="text-gray-200/50"
                  cx="96"
                  cy="96"
                  fill="transparent"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="6"
                />
                <circle
                  className="text-[#007AFF] transition-all duration-1000 ease-linear"
                  cx="96"
                  cy="96"
                  fill="transparent"
                  r="88"
                  stroke="currentColor"
                  strokeDasharray={552}
                  strokeDashoffset={552 - (552 * progress) / 100}
                  strokeLinecap="round"
                  strokeWidth="6"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-light text-5xl tabular-nums tracking-tighter">
                  {formatTime(timeLeft)}
                </span>
                <span className="mt-1 font-medium text-[#86868B] text-[13px] uppercase tracking-[0.2em]">
                  {mode === 'focus' ? 'Focus' : 'Break'}
                </span>
              </div>
            </div>

            {/* 控制按钮组 */}
            <div className="flex items-center gap-4">
              <button
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white text-[#86868B] shadow-sm transition-transform active:scale-90"
                onClick={() => {
                  Timer.reset();
                }}
              >
                <RotateCcw size={20} />
              </button>

              <button
                className={`flex h-16 w-16 cursor-pointer items-center justify-center rounded-full shadow-lg transition-all active:scale-95 ${
                  isActive
                    ? 'bg-white text-[#1D1D1F]'
                    : 'bg-[#007AFF] text-white'
                }`}
                onClick={() => {
                  isActive ? Timer.pause() : Timer.resume();
                }}
              >
                {isActive ? (
                  <Pause fill="currentColor" size={28} />
                ) : (
                  <Play className="ml-1" fill="currentColor" size={28} />
                )}
              </button>

              <button
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white text-[#86868B] shadow-sm transition-transform active:scale-90"
                onClick={() => {
                  Timer.next();
                }}
              >
                <SkipForward size={20} />
              </button>
            </div>
          </div>
        </section>

        {/* 时间设置卡片 */}
        <section className="overflow-hidden rounded-2xl border border-[#D2D2D7]/30 bg-white/80 shadow-sm backdrop-blur-md">
          <div className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#007AFF]/10 text-[#007AFF]">
                  <Clock size={16} strokeWidth={2.5} />
                </div>
                <span className="font-medium text-[15px]">工作时长</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  className="w-12 bg-transparent text-right font-semibold text-[17px] focus:outline-none"
                  onChange={(e) =>
                    SettingStore.setState({
                      focusDuration:
                        Math.max(1, parseInt(e.target.value) || 0) * kOneMinute,
                    })
                  }
                  type="number"
                  value={settings.focusDuration / kOneMinute}
                />
                <span className="text-[#86868B] text-sm">分钟</span>
              </div>
            </div>

            <div className="h-[0.5px] w-full bg-[#D2D2D7]/30" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF9500]/10 text-[#FF9500]">
                  <RotateCcw size={16} strokeWidth={2.5} />
                </div>
                <span className="font-medium text-[15px]">休息时长</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  className="w-12 bg-transparent text-right font-semibold text-[17px] focus:outline-none"
                  onChange={(e) =>
                    SettingStore.setState({
                      breakDuration:
                        Math.max(1, parseInt(e.target.value) || 0) * kOneMinute,
                    })
                  }
                  type="number"
                  value={settings.breakDuration / kOneMinute}
                />
                <span className="text-[#86868B] text-sm">分钟</span>
              </div>
            </div>
          </div>
        </section>

        {/* 个性化设置 */}
        <div className="space-y-3">
          <h3 className="px-4 font-semibold text-[#86868B] text-[12px] uppercase tracking-widest">
            个性化
          </h3>
          <section className="rounded-2xl border border-[#D2D2D7]/30 bg-white/80 shadow-sm">
            <div
              className="flex cursor-pointer items-center justify-between px-6 py-4 transition-colors hover:bg-black/[0.01]"
              onClick={() => SettingStore.value.pickImage()}
            >
              <div className="flex items-center gap-3">
                <ImageIcon className="text-[#86868B]" size={18} />
                <span className="text-[15px]">背景图片</span>
              </div>
              <div className="flex items-center gap-3">
                {settings.backgroundImage ? (
                  <div className="group relative flex items-center">
                    {/* 缩略图预览 */}
                    <div
                      className="h-10 w-16 rounded-md border border-black/5 bg-center bg-cover shadow-sm"
                      style={{
                        backgroundImage: `url(${settings.backgroundImage})`,
                      }}
                    />
                    {/* 删除按钮 */}
                    <button
                      className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-50 text-red-500 transition-colors hover:bg-red-500 hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        SettingStore.setState({ backgroundImage: '' });
                      }}
                    >
                      <X size={14} strokeWidth={3} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="text-[#86868B] text-sm">选择</span>
                    <ChevronRight className="text-[#C7C7CC]" size={16} />
                  </div>
                )}
              </div>
            </div>

            <div className="mx-6 h-[0.5px] bg-[#D2D2D7]/30" />

            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <Type className="text-[#86868B]" size={18} />
                <span className="text-[15px]">提示文案</span>
              </div>
              <input
                className="max-w-[160px] bg-transparent text-right font-medium text-[15px] placeholder-[#C7C7CC] outline-none"
                onChange={(e) =>
                  SettingStore.setState({ breakMessage: e.target.value })
                }
                placeholder="空"
                type="text"
                value={settings.breakMessage}
              />
            </div>
          </section>
        </div>

        {/* 系统配置 */}
        <div className="space-y-3">
          <h3 className="px-4 font-semibold text-[#86868B] text-[12px] uppercase tracking-widest">
            系统
          </h3>
          <section className="flex items-center justify-between rounded-2xl border border-[#D2D2D7]/30 bg-white/80 px-6 py-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Monitor className="text-[#86868B]" size={18} />
              <span className="text-[15px]">开机启动</span>
            </div>
            <button
              className={`h-6 w-11 cursor-pointer rounded-full transition-all duration-300 ${
                isAutoStart ? 'bg-[#34C759]' : 'bg-[#E9E9EB]'
              } relative flex items-center px-1`}
              onClick={() => setAutoStart(!isAutoStart)}
            >
              <div
                className={`h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-300 ${
                  isAutoStart ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};
