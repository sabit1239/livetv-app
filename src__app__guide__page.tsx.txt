'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Tv, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/store';
import { CATEGORY_CONFIG } from '@/lib/channels-data';
import { cn } from '@/lib/utils';
import { format, addDays, isSameDay } from 'date-fns';

// Generate mock EPG data
function generateMockPrograms(channelId: string) {
  const programs = [
    'Morning News', 'Sports Update', 'Live Match', 'Documentary Hour',
    'Entertainment Tonight', 'Breaking News', 'Prime Time Sport',
    'Late Night Show', 'World Report', 'Highlights'
  ];
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const result = [];
  let current = new Date(start);
  while (current.getDate() === start.getDate()) {
    const durationHours = Math.random() * 1.5 + 0.5;
    const end = new Date(current.getTime() + durationHours * 3600000);
    result.push({
      id: `${channelId}-${current.getTime()}`,
      title: programs[Math.floor(Math.random() * programs.length)],
      startTime: new Date(current),
      endTime: end,
      isLive: current <= now && now <= end,
    });
    current = end;
  }
  return result;
}

export default function GuidePage() {
  const router = useRouter();
  const { channels } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i - 1));
  const now = new Date();

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const displayChannels = channels.slice(0, 12);

  const getProgressPercent = (start: Date, end: Date) => {
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.max(0, Math.min(100, (elapsed / total) * 100));
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white text-3xl font-black mb-1">TV Guide</h1>
            <p className="text-white/50 text-sm">Electronic Program Guide</p>
          </div>
          <div className="flex items-center gap-2 text-white/50 text-sm">
            <Clock className="w-4 h-4" />
            <span>{format(now, 'HH:mm')}</span>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide pb-1">
          {dates.map((date) => {
            const isToday = isSameDay(date, new Date());
            const isSelected = isSameDay(date, selectedDate);
            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  'flex flex-col items-center px-5 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0',
                  isSelected
                    ? 'bg-red-600 text-white'
                    : 'bg-zinc-900 text-white/60 hover:text-white border border-white/10 hover:border-white/20'
                )}
              >
                <span className="text-xs opacity-70">{isToday ? 'Today' : format(date, 'EEE')}</span>
                <span className="text-lg font-black">{format(date, 'd')}</span>
                <span className="text-xs opacity-70">{format(date, 'MMM')}</span>
              </button>
            );
          })}
        </div>

        {/* EPG Grid */}
        <div className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden">
          {/* Time header */}
          <div className="flex border-b border-white/10">
            <div className="w-40 flex-shrink-0 p-3 border-r border-white/10">
              <span className="text-white/40 text-xs font-semibold">Channel</span>
            </div>
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <div className="flex" style={{ minWidth: `${24 * 120}px` }}>
                {hours.map((h) => (
                  <div key={h} className={cn(
                    'flex-shrink-0 p-3 border-r border-white/5 text-xs font-semibold',
                    h === now.getHours() && isSameDay(selectedDate, new Date())
                      ? 'text-red-400'
                      : 'text-white/30'
                  )} style={{ width: '120px' }}>
                    {String(h).padStart(2, '0')}:00
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Channel rows */}
          {displayChannels.map((channel) => {
            const config = CATEGORY_CONFIG[channel.category] || CATEGORY_CONFIG.other;
            const programs = generateMockPrograms(channel.id);
            return (
              <div key={channel.id} className="flex border-b border-white/5 last:border-0 hover:bg-white/2 group">
                {/* Channel info */}
                <div
                  className="w-40 flex-shrink-0 p-3 border-r border-white/10 flex items-center gap-2 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => router.push(`/channel/${channel.id}`)}
                >
                  <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {channel.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={channel.logo} alt={channel.name} className="w-7 h-7 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <span className="text-sm">{config.icon}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-xs font-semibold truncate">{channel.name}</p>
                    {channel.isLive && (
                      <span className="text-red-400 text-[9px] flex items-center gap-0.5">
                        <span className="w-1 h-1 bg-red-400 rounded-full animate-pulse" />LIVE
                      </span>
                    )}
                  </div>
                </div>

                {/* Programs */}
                <div className="flex-1 overflow-x-auto scrollbar-hide">
                  <div className="flex items-stretch relative" style={{ minWidth: `${24 * 120}px`, height: '60px' }}>
                    {programs.map((program) => {
                      const startMinutes = program.startTime.getHours() * 60 + program.startTime.getMinutes();
                      const endMinutes = program.endTime.getHours() * 60 + program.endTime.getMinutes();
                      const leftPx = (startMinutes / 60) * 120;
                      const widthPx = ((endMinutes - startMinutes) / 60) * 120;
                      const progress = program.isLive ? getProgressPercent(program.startTime, program.endTime) : 0;

                      return (
                        <div
                          key={program.id}
                          className={cn(
                            'absolute top-1 bottom-1 rounded-lg px-2 overflow-hidden cursor-pointer transition-all border',
                            program.isLive
                              ? 'bg-red-600/20 border-red-500/40 hover:bg-red-600/30'
                              : 'bg-zinc-800 border-white/5 hover:bg-zinc-700 hover:border-white/15'
                          )}
                          style={{ left: `${leftPx}px`, width: `${Math.max(widthPx - 4, 30)}px` }}
                          title={program.title}
                        >
                          {program.isLive && (
                            <div
                              className="absolute bottom-0 left-0 h-0.5 bg-red-500 transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          )}
                          <p className={cn('text-xs font-medium truncate leading-tight mt-1', program.isLive ? 'text-red-300' : 'text-white/60')}>
                            {program.isLive && <span className="text-red-400 mr-1">●</span>}
                            {program.title}
                          </p>
                          <p className="text-white/30 text-[9px]">
                            {format(program.startTime, 'HH:mm')} - {format(program.endTime, 'HH:mm')}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-white/20 text-xs text-center mt-4">
          Program schedule is illustrative. Connect an EPG provider for real data.
        </p>
      </div>
    </div>
  );
}
