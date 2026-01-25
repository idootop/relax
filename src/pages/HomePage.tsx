import {
  ChevronRight,
  Clock,
  Image as ImageIcon,
  Monitor,
  Play,
  RotateCcw,
  Type,
} from 'lucide-react';
import { useStore } from 'zenbox';

import { useAutoStart } from '@/core/autostart';
import { Timer } from '@/core/timer';
import { SettingStore } from '@/store';

export const HomePage = () => {
  const { isAutoStart, setAutoStart } = useAutoStart();
  const settings = useStore(SettingStore);

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-sans text-[#1D1D1F] selection:bg-blue-100">
      <div className="mx-auto max-w-xl space-y-12 p-8 pt-12">
        {/* 页眉 */}
        <header className="flex items-end justify-between">
          <div className="space-y-1">
            <h1 className="font-semibold text-3xl tracking-tight">Re:Lax</h1>
            <p className="font-medium text-[#86868B] text-[13px]">
              此刻即是当下。
            </p>
          </div>
        </header>

        {/* 时间设置卡片 */}
        <section className="overflow-hidden rounded-2xl border border-[#D2D2D7]/30 bg-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.04)] backdrop-blur-md">
          <div className="space-y-6 p-6">
            <div className="group flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#007AFF]/10 text-[#007AFF]">
                  <Clock size={16} strokeWidth={2.5} />
                </div>
                <span className="font-medium text-[15px]">专注时长</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  className="w-16 bg-transparent text-right font-semibold text-[17px] focus:outline-none"
                  onChange={(e) =>
                    SettingStore.setState({
                      focusDuration: parseInt(e.target.value) || 0,
                    })
                  }
                  type="number"
                  value={settings.focusDuration}
                />
                <span className="font-normal text-[#86868B] text-sm">min</span>
              </div>
            </div>

            <div className="h-[1px] w-full bg-[#D2D2D7]/30" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF9500]/10 text-[#FF9500]">
                  <RotateCcw size={16} strokeWidth={2.5} />
                </div>
                <span className="font-medium text-[15px]">休息时长</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  className="w-16 bg-transparent text-right font-semibold text-[17px] focus:outline-none"
                  onChange={(e) =>
                    SettingStore.setState({
                      breakDuration: parseInt(e.target.value) || 0,
                    })
                  }
                  type="number"
                  value={settings.breakDuration}
                />
                <span className="font-normal text-[#86868B] text-sm">min</span>
              </div>
            </div>
          </div>
        </section>

        {/* 个性化设置 */}
        <div className="space-y-4">
          <h3 className="px-2 font-semibold text-[#86868B] text-[13px] uppercase tracking-wider">
            个性化
          </h3>
          <section className="rounded-2xl border border-[#D2D2D7]/30 bg-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
            <div className="flex cursor-pointer items-center justify-between rounded-t-2xl px-6 py-4 transition-colors hover:bg-black/[0.01]">
              <div className="flex items-center gap-3">
                <ImageIcon className="text-[#86868B]" size={18} />
                <span className="text-[15px]">休息壁纸</span>
              </div>
              <ChevronRight className="text-[#C7C7CC]" size={16} />
            </div>

            <div className="mx-6 h-[1px] bg-[#D2D2D7]/30" />

            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <Type className="text-[#86868B]" size={18} />
                <span className="text-[15px]">提示文案</span>
              </div>
              <input
                className="max-w-[200px] bg-transparent text-right font-medium text-[15px] placeholder-[#C7C7CC] outline-none"
                onChange={(e) =>
                  SettingStore.setState({ breakMessage: e.target.value })
                }
                type="text"
                value={settings.breakMessage}
              />
            </div>
          </section>
        </div>

        {/* 系统配置 */}
        <div className="space-y-4">
          <h3 className="px-2 font-semibold text-[#86868B] text-[13px] uppercase tracking-wider">
            系统
          </h3>
          <section className="flex items-center justify-between rounded-2xl border border-[#D2D2D7]/30 bg-white/80 px-6 py-4 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3">
              <Monitor className="text-[#86868B]" size={18} />
              <span className="text-[15px]">登录时自动启动</span>
            </div>
            <button
              className={`h-5 w-9 rounded-full transition-all duration-300 ${
                isAutoStart ? 'bg-[#007AFF]' : 'bg-[#E9E9EB]'
              } relative flex items-center px-0.5 shadow-inner`}
              onClick={() => setAutoStart(!isAutoStart)}
            >
              <div
                className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                  isAutoStart ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </section>
        </div>

        {/* 底部操作 */}
        <div className="pt-4">
          <button
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#007AFF] py-4 font-semibold text-[15px] text-white shadow-[0_10px_20px_rgba(0,122,255,0.2)] transition-all hover:bg-[#0071E3] active:scale-[0.99]"
            onClick={() => Timer.next()}
          >
            <Play fill="white" size={16} />
            立即开始休息
          </button>
        </div>
      </div>
    </div>
  );
};
