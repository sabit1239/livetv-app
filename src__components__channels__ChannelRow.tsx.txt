'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Channel } from '@/types';
import ChannelCard from './ChannelCard';
import { cn } from '@/lib/utils';

interface ChannelRowProps {
  title: string;
  channels: Channel[];
  onPlay?: (channel: Channel) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ChannelRow({ title, channels, onPlay, size = 'md', className }: ChannelRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 400;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  if (!channels.length) return null;

  return (
    <div className={cn('relative', className)}>
      <h2 className="text-white text-xl font-bold mb-4 px-4 md:px-0">{title}</h2>
      <div className="relative group/row">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className={cn(
            'absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-2',
            'bg-black/80 hover:bg-black text-white rounded-full p-2 shadow-xl',
            'opacity-0 group-hover/row:opacity-100 transition-all duration-200',
            'hidden md:flex items-center justify-center'
          )}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Channel Strip */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-4 md:px-0 pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {channels.map((channel) => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              onPlay={onPlay}
              size={size}
              className="flex-shrink-0"
            />
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className={cn(
            'absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-2',
            'bg-black/80 hover:bg-black text-white rounded-full p-2 shadow-xl',
            'opacity-0 group-hover/row:opacity-100 transition-all duration-200',
            'hidden md:flex items-center justify-center'
          )}
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Fade edges */}
        <div className="absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-black to-transparent pointer-events-none hidden md:block" />
        <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-black to-transparent pointer-events-none hidden md:block" />
      </div>
    </div>
  );
}
