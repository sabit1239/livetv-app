'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Heart, Share2, ArrowLeft, Info, Tv } from 'lucide-react';
import { useAppStore } from '@/store';
import { Channel } from '@/types';
import { CATEGORY_CONFIG } from '@/lib/channels-data';
import { PlayerSkeleton } from '@/components/ui/skeleton';
import ChannelCard from '@/components/channels/ChannelCard';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const VideoPlayer = dynamic(() => import('@/components/player/VideoPlayer'), {
  ssr: false,
  loading: () => <PlayerSkeleton />,
});

interface Props {
  params: Promise<{ id: string }>;
}

export default function ChannelPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { channels, addToHistory, toggleFavorite, isFavorite } = useAppStore();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const found = channels.find((c) => c.id === id);
    if (found) {
      setChannel(found);
      addToHistory({
        channelId: found.id,
        channelName: found.name,
        channelLogo: found.logo,
        watchedAt: new Date().toISOString(),
      });
    }
  }, [id, channels, addToHistory]);

  if (!channel) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Tv className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h2 className="text-white text-xl font-bold mb-2">Channel Not Found</h2>
          <p className="text-white/50 mb-6">This channel may have been removed or is unavailable.</p>
          <button onClick={() => router.push('/')} className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const favorite = isFavorite(channel.id);
  const categoryConfig = CATEGORY_CONFIG[channel.category] || CATEGORY_CONFIG.other;
  const relatedChannels = channels
    .filter((c) => c.id !== channel.id && c.category === channel.category)
    .slice(0, 10);

  const handleShare = async () => {
    try {
      await navigator.share({ title: channel.name, url: window.location.href });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  return (
    <div className="bg-black min-h-screen">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Player + Info Column */}
          <div className="xl:col-span-2 space-y-6">
            {/* Video Player */}
            <VideoPlayer
              channel={channel}
              autoPlay
              onError={(err) => toast.error(`Stream error: ${err}`)}
            />

            {/* Channel Info Bar */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {channel.logo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={channel.logo}
                    alt={channel.name}
                    className="w-14 h-14 object-contain rounded-xl bg-zinc-800 p-2 flex-shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                <div className="min-w-0">
                  <h1 className="text-white text-2xl font-black leading-tight truncate">{channel.name}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className={cn('text-white text-xs font-bold px-2.5 py-1 rounded-full', categoryConfig.color)}>
                      {categoryConfig.icon} {categoryConfig.label}
                    </span>
                    {channel.isLive && (
                      <span className="flex items-center gap-1 text-red-400 text-xs font-bold bg-red-500/10 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                        LIVE
                      </span>
                    )}
                    {channel.isHD && (
                      <span className="text-white/60 text-xs font-bold border border-white/20 px-2 py-0.5 rounded">HD</span>
                    )}
                    {channel.country && (
                      <span className="text-white/50 text-sm">{channel.country}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => { toggleFavorite(channel.id); toast.success(favorite ? 'Removed from favorites' : 'Added to favorites'); }}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                    favorite
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-zinc-800 text-white/70 hover:text-white hover:bg-zinc-700'
                  )}
                >
                  <Heart className={cn('w-4 h-4', favorite && 'fill-white')} />
                  <span className="hidden sm:inline">{favorite ? 'Saved' : 'Save'}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 bg-zinc-800 text-white/70 hover:text-white hover:bg-zinc-700 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </button>
                <button
                  onClick={() => setShowInfo((s) => !s)}
                  className="bg-zinc-800 text-white/70 hover:text-white hover:bg-zinc-700 p-2.5 rounded-xl transition-all"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Channel Description */}
            {showInfo && channel.description && (
              <div className="bg-zinc-900 border border-white/10 rounded-xl p-5 animate-fade-in">
                <h3 className="text-white font-bold mb-2">About this channel</h3>
                <p className="text-white/70 text-sm leading-relaxed">{channel.description}</p>
                {channel.tags && channel.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {channel.tags.map((tag) => (
                      <span key={tag} className="bg-white/10 text-white/60 text-xs px-2.5 py-1 rounded-full">{tag}</span>
                    ))}
                  </div>
                )}
                {channel.language && (
                  <p className="text-white/40 text-xs mt-3">Language: {channel.language}</p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar: Related Channels */}
          <div className="xl:col-span-1">
            <h3 className="text-white text-lg font-bold mb-4">
              More {categoryConfig.label} Channels
            </h3>
            {relatedChannels.length > 0 ? (
              <div className="grid grid-cols-2 xl:grid-cols-1 gap-3">
                {relatedChannels.map((related) => (
                  <div
                    key={related.id}
                    onClick={() => router.push(`/channel/${related.id}`)}
                    className="flex items-center gap-3 bg-zinc-900 hover:bg-zinc-800 border border-white/5 hover:border-white/20 rounded-xl p-3 cursor-pointer transition-all group"
                  >
                    <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {related.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={related.logo} alt={related.name} className="w-10 h-10 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <span className="text-xl">{categoryConfig.icon}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate group-hover:text-red-400 transition-colors">{related.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {related.isLive && (
                          <span className="flex items-center gap-1 text-red-400 text-[10px] font-bold">
                            <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />LIVE
                          </span>
                        )}
                        {related.country && <span className="text-white/40 text-xs">{related.country}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-white/30">
                <Tv className="w-10 h-10 mx-auto mb-2" />
                <p className="text-sm">No related channels</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
