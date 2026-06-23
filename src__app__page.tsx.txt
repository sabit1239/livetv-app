'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import { Channel } from '@/types';
import HeroBanner from '@/components/home/HeroBanner';
import ChannelRow from '@/components/channels/ChannelRow';
import { ChannelRowSkeleton, HeroSkeleton } from '@/components/ui/skeleton';
import { Play, History, Heart } from 'lucide-react';
import { CATEGORY_CONFIG } from '@/lib/channels-data';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const { channels, watchHistory, favorites, addToHistory } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handlePlay = (channel: Channel) => {
    addToHistory({
      channelId: channel.id,
      channelName: channel.name,
      channelLogo: channel.logo,
      watchedAt: new Date().toISOString(),
    });
    router.push(`/channel/${channel.id}`);
  };

  const featured = channels.filter((c) => c.isFeatured);
  const trending = channels.filter((c) => c.isTrending);
  const sports = channels.filter((c) => c.category === 'sports');
  const news = channels.filter((c) => c.category === 'news');
  const entertainment = channels.filter((c) => c.category === 'entertainment');

  const recentChannelIds = watchHistory.slice(0, 10).map((h) => h.channelId);
  const recentChannels = recentChannelIds
    .map((id) => channels.find((c) => c.id === id))
    .filter(Boolean) as Channel[];

  const favoriteChannelIds = favorites.map((f) => f.channelId);
  const favoriteChannels = favoriteChannelIds
    .map((id) => channels.find((c) => c.id === id))
    .filter(Boolean) as Channel[];

  if (isLoading) {
    return (
      <div className="bg-black">
        <HeroSkeleton />
        <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-12 space-y-12">
          {Array.from({ length: 3 }).map((_, i) => <ChannelRowSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      {/* Hero Banner */}
      <HeroBanner channels={featured} onPlay={handlePlay} />

      {/* Category Quick Links */}
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 -mt-6 relative z-10 mb-8">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
            <Link
              key={key}
              href={`/search?category=${key}`}
              className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium text-white/70 hover:text-white transition-all whitespace-nowrap flex-shrink-0 hover:border-white/20"
            >
              <span>{config.icon}</span>
              {config.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-4 space-y-12 pb-20">
        {/* Continue Watching */}
        {recentChannels.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-red-500" />
              <h2 className="text-white text-xl font-bold">Continue Watching</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {recentChannels.map((channel) => (
                <div
                  key={channel.id}
                  onClick={() => handlePlay(channel)}
                  className="flex-shrink-0 w-48 bg-zinc-900 rounded-xl overflow-hidden border border-white/5 hover:border-white/20 cursor-pointer hover:scale-105 transition-all duration-200 group"
                >
                  <div className="aspect-video bg-zinc-800 flex items-center justify-center relative overflow-hidden">
                    {channel.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={channel.logo} alt={channel.name} className="w-14 h-14 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div className="text-3xl">{CATEGORY_CONFIG[channel.category]?.icon || '📺'}</div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-red-600 rounded-full p-2.5">
                        <Play className="w-4 h-4 text-white fill-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />
                  </div>
                  <div className="p-3">
                    <p className="text-white text-sm font-medium truncate">{channel.name}</p>
                    <p className="text-white/50 text-xs mt-0.5">Resume watching</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Favorites */}
        {favoriteChannels.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              <h2 className="text-white text-xl font-bold">My Favorites</h2>
            </div>
            <ChannelRow channels={favoriteChannels} onPlay={handlePlay} />
          </div>
        )}

        {/* Trending Now */}
        {trending.length > 0 && (
          <ChannelRow title="🔥 Trending Now" channels={trending} onPlay={handlePlay} />
        )}

        {/* Sports */}
        {sports.length > 0 && (
          <ChannelRow title="🏆 Sports" channels={sports} onPlay={handlePlay} />
        )}

        {/* News */}
        {news.length > 0 && (
          <ChannelRow title="📰 News" channels={news} onPlay={handlePlay} />
        )}

        {/* All Channels */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-xl font-bold">📺 All Channels</h2>
            <Link href="/search" className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {channels.slice(0, 12).map((channel) => (
              <div
                key={channel.id}
                onClick={() => handlePlay(channel)}
                className="bg-zinc-900 border border-white/5 hover:border-white/20 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-200 group"
              >
                <div className="aspect-video bg-zinc-800 flex items-center justify-center relative overflow-hidden">
                  {channel.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={channel.logo} alt={channel.name} className="w-12 h-12 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <div className="text-2xl">{CATEGORY_CONFIG[channel.category]?.icon || '📺'}</div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </div>
                  {channel.isLive && (
                    <span className="absolute top-1.5 left-1.5 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1 h-1 bg-white rounded-full animate-pulse" />LIVE
                    </span>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-white text-xs font-semibold truncate">{channel.name}</p>
                  <p className="text-white/40 text-xs mt-0.5 capitalize">{CATEGORY_CONFIG[channel.category]?.label}</p>
                </div>
              </div>
            ))}
          </div>
          {channels.length > 12 && (
            <div className="text-center mt-8">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors border border-white/10"
              >
                Show all {channels.length} channels
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
