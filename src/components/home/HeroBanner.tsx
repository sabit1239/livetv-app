'use client';

import { useState, useEffect } from 'react';
import { Play, Info, Volume2, VolumeX } from 'lucide-react';
import { Channel } from '@/types';
import { cn } from '@/lib/utils';
import { CATEGORY_CONFIG } from '@/lib/channels-data';

interface HeroBannerProps {
  channels: Channel[];
  onPlay: (channel: Channel) => void;
  onInfo?: (channel: Channel) => void;
}

export default function HeroBanner({ channels, onPlay, onInfo }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const featured = channels.filter((c) => c.isFeatured).slice(0, 6);
  const current = featured[currentIndex];

  useEffect(() => {
    if (featured.length <= 1) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((i) => (i + 1) % featured.length);
        setIsTransitioning(false);
      }, 400);
    }, 7000);
    return () => clearInterval(interval);
  }, [featured.length]);

  if (!current) return null;

  const categoryConfig = CATEGORY_CONFIG[current.category] || CATEGORY_CONFIG.other;

  const backgrounds: Record<string, string> = {
    sports: 'from-green-950 via-black to-black',
    news: 'from-blue-950 via-black to-black',
    entertainment: 'from-purple-950 via-black to-black',
    movies: 'from-red-950 via-black to-black',
    kids: 'from-yellow-950 via-black to-black',
    music: 'from-pink-950 via-black to-black',
    documentary: 'from-teal-950 via-black to-black',
    default: 'from-zinc-900 via-black to-black',
  };

  const bgGradient = backgrounds[current.category] || backgrounds.default;

  return (
    <div className={cn(
      'relative w-full min-h-[70vh] md:min-h-[80vh] flex items-end overflow-hidden transition-all duration-700',
      `bg-gradient-to-br ${bgGradient}`
    )}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,50,50,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(50,50,255,0.2) 0%, transparent 50%)',
        }} />
      </div>

      {/* Channel Logo - Background */}
      {current.logo && (
        <div className="absolute inset-0 flex items-center justify-end pr-8 md:pr-24 opacity-10 md:opacity-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.logo}
            alt=""
            className={cn(
              'w-64 md:w-96 h-64 md:h-96 object-contain transition-all duration-700',
              isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            )}
          />
        </div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

      {/* Content */}
      <div className={cn(
        'relative z-10 p-6 md:p-16 pb-12 md:pb-20 w-full max-w-3xl transition-all duration-500',
        isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
      )}>
        {/* Category Badge */}
        <div className="flex items-center gap-3 mb-4">
          <span className={cn('text-white text-xs font-bold px-3 py-1 rounded-full', categoryConfig.color)}>
            {categoryConfig.icon} {categoryConfig.label}
          </span>
          {current.isLive && (
            <span className="flex items-center gap-1.5 text-red-400 text-xs font-bold">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              LIVE NOW
            </span>
          )}
          {current.isHD && (
            <span className="border border-white/30 text-white/70 text-xs font-bold px-2 py-0.5 rounded">
              HD
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-white text-4xl md:text-6xl font-black mb-3 leading-tight">
          {current.name}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-4 text-white/60 text-sm">
          {current.country && <span>{current.country}</span>}
          {current.language && <><span>·</span><span>{current.language}</span></>}
          {current.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="bg-white/10 px-2 py-0.5 rounded text-xs">{tag}</span>
          ))}
        </div>

        {/* Description */}
        {current.description && (
          <p className="text-white/70 text-base md:text-lg mb-8 max-w-xl leading-relaxed line-clamp-2">
            {current.description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onPlay(current)}
            className="flex items-center gap-3 bg-white text-black px-8 py-3.5 rounded-xl font-bold text-base hover:bg-white/90 transition-all duration-200 hover:scale-105 shadow-2xl"
          >
            <Play className="w-5 h-5 fill-black" />
            Watch Now
          </button>
          <button
            onClick={() => onInfo?.(current)}
            className="flex items-center gap-3 bg-white/20 backdrop-blur-sm text-white px-8 py-3.5 rounded-xl font-bold text-base hover:bg-white/30 transition-all duration-200 border border-white/20"
          >
            <Info className="w-5 h-5" />
            More Info
          </button>
        </div>
      </div>

      {/* Slide Indicators */}
      {featured.length > 1 && (
        <div className="absolute bottom-6 right-6 flex gap-2 z-10">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => { setCurrentIndex(i); setIsTransitioning(false); }, 300);
              }}
              className={cn(
                'h-1 rounded-full transition-all duration-300',
                i === currentIndex ? 'w-8 bg-red-500' : 'w-2 bg-white/30 hover:bg-white/50'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
