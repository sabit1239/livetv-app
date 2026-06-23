'use client';

import { useState } from 'react';
import { Heart, Play, Tv, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Channel } from '@/types';
import { useAppStore } from '@/store';
import { CATEGORY_CONFIG } from '@/lib/channels-data';

interface ChannelCardProps {
  channel: Channel;
  onPlay?: (channel: Channel) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ChannelCard({ channel, onPlay, size = 'md', className }: ChannelCardProps) {
  const { toggleFavorite, isFavorite } = useAppStore();
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const favorite = isFavorite(channel.id);
  const categoryConfig = CATEGORY_CONFIG[channel.category] || CATEGORY_CONFIG.other;

  const sizeClasses = {
    sm: 'w-36',
    md: 'w-48',
    lg: 'w-64',
  };

  return (
    <div
      className={cn(
        'relative group cursor-pointer rounded-xl overflow-hidden transition-all duration-300',
        'bg-zinc-900 border border-white/5 hover:border-white/20',
        'hover:scale-105 hover:shadow-2xl hover:shadow-red-500/10',
        sizeClasses[size],
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onPlay?.(channel)}
    >
      {/* Thumbnail / Logo Area */}
      <div className="relative aspect-video bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center overflow-hidden">
        {channel.logo && !imageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={channel.logo}
            alt={channel.name}
            className="w-16 h-16 object-contain transition-transform duration-300 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center text-2xl', categoryConfig.color)}>
            {categoryConfig.icon}
          </div>
        )}

        {/* Overlay on hover */}
        <div className={cn(
          'absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-200',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}>
          <div className="bg-red-600 rounded-full p-3 shadow-lg shadow-red-600/50">
            <Play className="w-5 h-5 text-white fill-white" />
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {channel.isLive && (
            <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
              LIVE
            </span>
          )}
          {channel.isHD && (
            <span className="bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/20">
              HD
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(channel.id); }}
          className={cn(
            'absolute top-2 right-2 p-1.5 rounded-full transition-all duration-200',
            'bg-black/60 hover:bg-black/80',
            favorite ? 'text-red-500' : 'text-white/60 hover:text-red-400',
            isHovered || favorite ? 'opacity-100' : 'opacity-0'
          )}
        >
          <Heart className={cn('w-3.5 h-3.5', favorite && 'fill-red-500')} />
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-white text-sm font-semibold truncate leading-tight">{channel.name}</h3>
        <div className="flex items-center gap-1.5 mt-1">
          <span className={cn('w-1.5 h-1.5 rounded-full', categoryConfig.color)} />
          <span className="text-white/50 text-xs capitalize">{categoryConfig.label}</span>
        </div>
        {channel.country && (
          <p className="text-white/40 text-xs mt-0.5 truncate">{channel.country}</p>
        )}
      </div>
    </div>
  );
}
