'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, X, Tv } from 'lucide-react';
import { useAppStore } from '@/store';
import { Channel, ChannelCategory } from '@/types';
import { CATEGORY_CONFIG } from '@/lib/channels-data';
import { cn } from '@/lib/utils';
import { ChannelCardSkeleton } from '@/components/ui/skeleton';
import toast from 'react-hot-toast';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { channels, addToHistory } = useAppStore();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'newest'>('name');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const filtered = channels
    .filter((c) => {
      const matchesQuery =
        !query ||
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.description?.toLowerCase().includes(query.toLowerCase()) ||
        c.tags?.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
        c.country?.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === 'all' || c.category === category;
      return matchesQuery && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'category') return a.category.localeCompare(b.category);
      return (b.addedAt || '').localeCompare(a.addedAt || '');
    });

  const handlePlay = (channel: Channel) => {
    addToHistory({ channelId: channel.id, channelName: channel.name, channelLogo: channel.logo, watchedAt: new Date().toISOString() });
    router.push(`/channel/${channel.id}`);
  };

  const categories = ['all', ...Object.keys(CATEGORY_CONFIG)] as const;

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white text-3xl font-black mb-2">Browse Channels</h1>
          <p className="text-white/50">Explore {channels.length} live TV channels</p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search channels, categories, countries..."
              className="w-full bg-zinc-900 border border-white/10 text-white placeholder-white/30 rounded-xl pl-12 pr-12 py-3.5 focus:outline-none focus:border-red-500 transition-colors"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters((f) => !f)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-colors border',
              showFilters ? 'bg-red-600 text-white border-red-600' : 'bg-zinc-900 text-white/70 hover:text-white border-white/10 hover:border-white/20'
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-5 mb-6 animate-slide-down">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3 block">Sort By</label>
                <div className="flex gap-2">
                  {[['name', 'Name (A-Z)'], ['category', 'Category'], ['newest', 'Newest']].map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setSortBy(val as typeof sortBy)}
                      className={cn('px-3 py-1.5 rounded-lg text-sm transition-colors', sortBy === val ? 'bg-red-600 text-white' : 'bg-zinc-800 text-white/60 hover:text-white')}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-8">
          {categories.map((cat) => {
            const config = cat === 'all' ? { icon: '📺', label: 'All' } : CATEGORY_CONFIG[cat as ChannelCategory];
            const count = cat === 'all' ? channels.length : channels.filter((c) => c.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all',
                  category === cat
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                    : 'bg-zinc-900 text-white/60 hover:text-white border border-white/10 hover:border-white/20'
                )}
              >
                <span>{config?.icon}</span>
                {config?.label}
                <span className={cn('text-xs px-1.5 py-0.5 rounded-full', category === cat ? 'bg-white/20' : 'bg-white/5')}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-white/50 text-sm">
            {filtered.length} {filtered.length === 1 ? 'channel' : 'channels'} found
            {query && <span> for "<span className="text-white">{query}</span>"</span>}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <ChannelCardSkeleton key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map((channel) => {
              const catConfig = CATEGORY_CONFIG[channel.category] || CATEGORY_CONFIG.other;
              return (
                <div
                  key={channel.id}
                  onClick={() => handlePlay(channel)}
                  className="bg-zinc-900 border border-white/5 hover:border-white/20 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-200 group"
                >
                  <div className="aspect-video bg-zinc-800 flex items-center justify-center relative overflow-hidden">
                    {channel.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={channel.logo} alt={channel.name} className="w-12 h-12 object-contain group-hover:scale-110 transition-transform" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-xl', catConfig.color)}>
                        {catConfig.icon}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-red-600 rounded-full p-2.5 shadow-lg">
                        <svg className="w-4 h-4 text-white fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                    </div>
                    {channel.isLive && (
                      <span className="absolute top-1.5 left-1.5 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <span className="w-1 h-1 bg-white rounded-full animate-pulse" />LIVE
                      </span>
                    )}
                    {channel.isHD && (
                      <span className="absolute top-1.5 right-1.5 bg-black/70 text-white text-[9px] font-bold px-1 py-0.5 rounded border border-white/20">HD</span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-white text-xs font-semibold truncate">{channel.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', catConfig.color)} />
                      <span className="text-white/40 text-xs">{catConfig.label}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24">
            <Tv className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <h3 className="text-white text-xl font-bold mb-2">No channels found</h3>
            <p className="text-white/40 text-sm mb-6">Try adjusting your search or filters</p>
            <button onClick={() => { setQuery(''); setCategory('all'); }} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors text-sm">
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
